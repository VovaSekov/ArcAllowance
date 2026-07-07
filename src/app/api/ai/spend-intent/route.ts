import { NextResponse } from "next/server";
import { RateLimitError, assertRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { agents, merchants, policies } from "@/lib/seed-data";
import type { PaymentType } from "@/lib/types";

type SpendIntent = {
  agentId: string;
  merchantId: string;
  amountUSDC: number;
  purpose: string;
  paymentType: PaymentType;
  rationale: string;
};

type SpendIntentResponse = SpendIntent & {
  source: "openai" | "fallback";
};

type RequestBody = {
  prompt?: unknown;
  agentId?: unknown;
};

type OpenAITextResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

const paymentTypes = ["x402", "usdc_transfer", "batch"] as const satisfies readonly PaymentType[];

function normalizePrompt(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 800) : "";
}

function knownAgent(id: unknown) {
  return typeof id === "string" ? agents.find((agent) => agent.id === id) : undefined;
}

function fallbackIntent(prompt: string, preferredAgentId?: string): SpendIntent {
  const lower = prompt.toLowerCase();

  if (lower.includes("alpha") || lower.includes("signal") || lower.includes("private") || lower.includes("250")) {
    return {
      agentId: "agent_trading",
      merchantId: "merchant_unknown_alpha",
      amountUSDC: 250,
      purpose: "private_alpha_signal",
      paymentType: "usdc_transfer",
      rationale: "The intent looks like a high-risk alpha-signal purchase, so it is routed to the restricted trading scenario."
    };
  }

  if (lower.includes("compute") || lower.includes("inference") || lower.includes("llm") || lower.includes("45")) {
    return {
      agentId: "agent_ops",
      merchantId: "merchant_llm_inference",
      amountUSDC: 45,
      purpose: "weekly_compute_budget",
      paymentType: "batch",
      rationale: "The intent maps to model inference or compute spend and should cross the autonomy threshold."
    };
  }

  const preferredAgent = knownAgent(preferredAgentId);
  const policy = policies.find((item) => item.agentId === preferredAgent?.id) ?? policies[0];
  const merchantId = policy.allowedMerchantIds[0] ?? "merchant_market_data";

  return {
    agentId: policy.agentId,
    merchantId,
    amountUSDC: lower.includes("wallet") ? 1.25 : 0.03,
    purpose: lower.includes("wallet") ? "wallet_risk_report" : "cpi_dataset_query",
    paymentType: "x402",
    rationale: "The intent maps to a low-value approved data request suitable for x402-style nanopayments."
  };
}

function extractOutputText(payload: OpenAITextResponse): string {
  if (payload.output_text) {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text): text is string => Boolean(text))
    .join("\n") ?? "";
}

function sanitizeIntent(value: unknown, fallback: SpendIntent): SpendIntent {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Partial<Record<keyof SpendIntent, unknown>>;
  const agent = typeof candidate.agentId === "string" ? agents.find((item) => item.id === candidate.agentId) : undefined;
  const merchant = typeof candidate.merchantId === "string" ? merchants.find((item) => item.id === candidate.merchantId) : undefined;
  const amount = typeof candidate.amountUSDC === "number" && Number.isFinite(candidate.amountUSDC) ? candidate.amountUSDC : fallback.amountUSDC;
  const paymentType = typeof candidate.paymentType === "string" && paymentTypes.includes(candidate.paymentType as PaymentType)
    ? candidate.paymentType as PaymentType
    : fallback.paymentType;

  return {
    agentId: agent?.id ?? fallback.agentId,
    merchantId: merchant?.id ?? fallback.merchantId,
    amountUSDC: Math.max(0.01, Math.min(1000, Number(amount.toFixed(2)))),
    purpose: typeof candidate.purpose === "string" && candidate.purpose.trim()
      ? candidate.purpose.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 48)
      : fallback.purpose,
    paymentType,
    rationale: typeof candidate.rationale === "string" && candidate.rationale.trim()
      ? candidate.rationale.trim().slice(0, 320)
      : fallback.rationale
  };
}

function normalizePolicyCriticalIntent(prompt: string, intent: SpendIntent, fallback: SpendIntent): SpendIntent {
  const lower = prompt.toLowerCase();
  const isPrivateAlpha = lower.includes("private") || lower.includes("alpha") || lower.includes("unknown group") || lower.includes("250");
  const isComputeApproval = lower.includes("compute") || lower.includes("inference") || lower.includes("llm") || lower.includes("45");
  const isCpiNanopayment = lower.includes("cpi") || lower.includes("tiny api") || lower.includes("marketdata") || lower.includes("dataset");

  if (isPrivateAlpha) {
    return {
      ...intent,
      agentId: "agent_trading",
      merchantId: "merchant_unknown_alpha",
      amountUSDC: 250,
      purpose: "private_alpha_signal",
      paymentType: "usdc_transfer"
    };
  }

  if (isComputeApproval) {
    return {
      ...intent,
      agentId: "agent_ops",
      merchantId: "merchant_llm_inference",
      amountUSDC: 45,
      purpose: "weekly_compute_budget",
      paymentType: "batch"
    };
  }

  if (isCpiNanopayment) {
    return {
      ...intent,
      agentId: "agent_research",
      merchantId: "merchant_market_data",
      amountUSDC: 0.03,
      purpose: "cpi_dataset_query",
      paymentType: "x402"
    };
  }

  return {
    ...intent,
    agentId: intent.agentId || fallback.agentId,
    merchantId: intent.merchantId || fallback.merchantId,
    purpose: intent.purpose || fallback.purpose
  };
}

async function generateWithOpenAI(prompt: string, fallback: SpendIntent): Promise<SpendIntent | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return undefined;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        {
          role: "system",
          content: [
            "You convert autonomous AI agent payment intent into a safe ArcAllowance spend request.",
            "Only choose ids from the provided agents and merchants.",
            "The output is a proposed request only; policy evaluation will auto-clear it, reject it, or route it to exception review later."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            prompt,
            agents: agents.map(({ id, name, capabilities, riskTier }) => ({ id, name, capabilities, riskTier })),
            merchants: merchants.map(({ id, name, category, riskLevel }) => ({ id, name, category, riskLevel })),
            policies: policies.map(({ agentId, allowedMerchantIds, allowedPurposes, approvalRequiredAboveUSDC }) => ({
              agentId,
              allowedMerchantIds,
              allowedPurposes,
              approvalRequiredAboveUSDC
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "spend_intent",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["agentId", "merchantId", "amountUSDC", "purpose", "paymentType", "rationale"],
            properties: {
              agentId: { type: "string", enum: agents.map((agent) => agent.id) },
              merchantId: { type: "string", enum: merchants.map((merchant) => merchant.id) },
              amountUSDC: { type: "number", minimum: 0.01, maximum: 1000 },
              purpose: { type: "string", minLength: 3, maxLength: 48 },
              paymentType: { type: "string", enum: paymentTypes },
              rationale: { type: "string", minLength: 8, maxLength: 320 }
            }
          }
        }
      }
    })
  });

  const payload = await response.json() as OpenAITextResponse;
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "OpenAI request failed.");
  }

  const text = extractOutputText(payload);
  const sanitized = sanitizeIntent(JSON.parse(text) as unknown, fallback);
  return normalizePolicyCriticalIntent(prompt, sanitized, fallback);
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit({ key: `ai-intent:${getClientIp(request)}`, limit: 12, windowMs: 60_000 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } }
      );
    }
    throw error;
  }

  const body = await request.json().catch(() => ({} as RequestBody)) as RequestBody;
  const prompt = normalizePrompt(body.prompt);

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const fallback = fallbackIntent(prompt, typeof body.agentId === "string" ? body.agentId : undefined);

  try {
    const generated = await generateWithOpenAI(prompt, fallback);
    return NextResponse.json<SpendIntentResponse>({
      ...(generated ?? fallback),
      source: generated ? "openai" : "fallback"
    });
  } catch (error) {
    return NextResponse.json<SpendIntentResponse>({
      ...fallback,
      source: "fallback",
      rationale: error instanceof Error
        ? `AI provider was unavailable, so ArcAllowance used a safe local intent parser. ${fallback.rationale}`
        : fallback.rationale
    });
  }
}
