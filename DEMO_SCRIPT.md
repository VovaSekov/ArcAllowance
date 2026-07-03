# ArcAllowance Live Walkthrough

## 1. Open With The Problem

Start on `/`.

Say:

> Agents should not get unlimited wallets. Before autonomous agents can spend USDC on APIs, data, compute, or tools, they need budgets, merchant allowlists, approval thresholds, policy checks, and audit receipts.

Point to:

- "Budgets before autonomy"
- "Policy controls for AI agents spending USDC on Arc"
- "Mock mode today. Arc-native settlement tomorrow."

## 2. Show The Dashboard

Open `/dashboard`.

Say:

> This is the control room. We can see total agent budget, spend today, pending approvals, blocked attempts, active agents, recent spend activity, and the real Arc Testnet audit registry status.

Point to:

- Total agent budget
- Pending approvals
- Blocked attempts
- Real Arc Testnet contract card

## 3. Show Agent Policy Context

Open `/agents`, then `ResearchAgent`.

Say:

> Each agent has a wallet address, risk tier, capabilities, and an active policy. The frontend policy engine decides what the agent can spend before any payment-like action is simulated.

Point to:

- Wallet address
- ERC-8004 placeholder ID
- Allowed merchants
- Allowed purposes

## 4. Approved Nanopayment

Open `/simulate`.

Choose preset:

```text
Approved nanopayment
ResearchAgent -> MarketData API
0.03 USDC
cpi_dataset_query
x402
```

Click "Run policy check".

Say:

> This passes the merchant allowlist, amount, daily budget, and purpose checks. ArcAllowance generates a mock Gateway authorization, memo ID, mock Arc transaction hash, and receipt.

Point to:

- Approved status
- Policy check trace
- Mock receipt

## 5. Blocked Unsafe Spend

Choose preset:

```text
Blocked unsafe spend
TradingAgent -> Unknown Alpha Group
250 USDC
private_alpha_signal
```

Click "Run policy check".

Say:

> This request is rejected. The merchant is not allowlisted, the amount exceeds policy limits, the purpose is explicitly blocked, and high-risk merchant controls stop settlement. No receipt is created.

Point to:

- Rejected status
- Failed policy rules
- "Settlement stopped"

## 6. Needs Human Approval

Choose preset:

```text
Needs approval
OpsAgent -> LLM Inference Hub
45 USDC
weekly_compute_budget
batch
```

Click "Run policy check".

Say:

> This request passes hard controls but crosses the approval threshold. It is routed to a human approval queue instead of being automatically settled.

Open `/approvals`, approve the request.

Say:

> Approval creates a mock receipt and audit event. This keeps the autonomous flow accountable without pretending real funds moved.

## 7. Inspect The Ledger

Open `/ledger`.

Say:

> The ledger shows approved, rejected, needs-approval, and settled requests. Receipts include memo IDs, mock Arc tx hashes, and settlement mode.

Filter statuses and click a settled row.

## 8. Show Real Arc Testnet Proof

Open `/contract`.

Say:

> The app remains mock for Gateway/x402 settlement, but the audit layer is real. ArcAllowanceRegistry is deployed on Arc Testnet and can anchor agent registrations, policy hashes, spend requests, and spend decisions.

Point to:

- Contract name: `ArcAllowanceRegistry`
- Network: Arc Testnet
- Chain ID: `5042002`
- Address: `0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f`
- Explorer link

Open Arcscan:

```text
https://testnet.arcscan.app/address/0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f
```

## 9. Close With The Architecture

Open `/architecture`.

Say:

> Today, policy evaluation and Gateway/x402 settlement are mocked for safety. The Arc Testnet registry proves that the decision trail can be anchored onchain. Later, Circle Wallets, Gateway/x402, Arc memos, batched settlements, and ERC-8004 agent identity can make this Arc-native end to end.

Final line:

> ArcAllowance is budgets before autonomy: a policy layer for safe agentic USDC spending on Arc.
