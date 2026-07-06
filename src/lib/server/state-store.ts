import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { isArcTestnetMode, isRealSettlementMode, settlementMode } from "@/lib/settlement-mode";
import { initialAuditEvents, initialReceipts, initialSpendRequests } from "@/lib/seed-data";
import type { AppState } from "@/lib/types";

const dataDir = process.env.ARC_DATA_DIR || join(process.cwd(), ".data");
const statePath = join(dataDir, `app-state-${settlementMode}.json`);

let stateQueue = Promise.resolve();

function defaultState(): AppState {
  const seededDemoState = !isArcTestnetMode && !isRealSettlementMode;
  return {
    spendRequests: seededDemoState ? initialSpendRequests : [],
    receipts: seededDemoState ? initialReceipts : [],
    auditEvents: seededDemoState ? initialAuditEvents : [],
    idempotencyKeys: {}
  };
}

function normalizeState(value: unknown): AppState {
  if (!value || typeof value !== "object") {
    return defaultState();
  }

  const state = value as Partial<AppState>;
  return {
    spendRequests: Array.isArray(state.spendRequests) ? state.spendRequests : [],
    receipts: Array.isArray(state.receipts) ? state.receipts : [],
    auditEvents: Array.isArray(state.auditEvents) ? state.auditEvents : [],
    idempotencyKeys: state.idempotencyKeys && typeof state.idempotencyKeys === "object" ? state.idempotencyKeys : {}
  };
}

async function writeAppState(state: AppState): Promise<void> {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function readAppState(): Promise<AppState> {
  try {
    return normalizeState(JSON.parse(await readFile(statePath, "utf8")) as unknown);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      const state = defaultState();
      await writeAppState(state);
      return state;
    }
    throw error;
  }
}

export async function resetAppState(): Promise<AppState> {
  return mutateAppState((state) => {
    const next = defaultState();
    state.spendRequests = next.spendRequests;
    state.receipts = next.receipts;
    state.auditEvents = next.auditEvents;
    state.idempotencyKeys = {};
    return state;
  });
}

export async function mutateAppState<T>(operation: (state: AppState) => Promise<T> | T): Promise<T> {
  const run = stateQueue.then(async () => {
    const state = await readAppState();
    const result = await operation(state);
    await writeAppState(state);
    return result;
  });

  stateQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}
