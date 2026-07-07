# ArcAllowance

USDC spend controls for autonomous AI agents on Arc.

## Submission Quick Links

- Live app: https://arcallowance.xyz
- Guided demo: https://arcallowance.xyz/demo
- GitHub: https://github.com/VovaSekov/ArcAllowance
- X / Twitter: https://x.com/arcallowans
- Arc Testnet contract: `0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f`
- Arcscan: https://testnet.arcscan.app/address/0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f

## One-Liner

ArcAllowance is an Arc Testnet audit and policy-control layer that makes AI agent USDC spending governable before autonomous payments are enabled.

## Judge Demo Path

1. Open https://arcallowance.xyz/demo.
2. Run the approved ResearchAgent scenario.
3. Run the rejected TradingAgent scenario.
4. Run the OpsAgent review scenario, then approve it in `/approvals`.
5. Inspect `/ledger` for receipts and audit trail.
6. Inspect `/contract` and the Arcscan link for Arc Testnet proof.

## Problem

Agents should not get unlimited wallets. Before autonomous systems can safely pay for APIs, data, compute, research, and tools, teams need budgets, merchant allowlists, autonomy thresholds, policy checks, and auditable receipts.

## Solution

ArcAllowance is a testnet spend-control layer for AI agents. It lets a user create and inspect agents, assign policy-driven USDC budgets, evaluate spend requests, route exceptions, and anchor spend decisions to `ArcAllowanceRegistry` on Arc Testnet.

## Why Arc / USDC / Circle

ArcAllowance is designed around stablecoin-native agent spending. Arc transaction memos make reconciliation clear, USDC keeps budgets denominated in a predictable unit, and Circle Wallets plus Gateway/x402-style authorization give a path toward controlled agent payments without exposing private keys in the app.

## Features

- Agent profiles with wallet addresses, risk tiers, and capabilities.
- Optional AI intent builder that converts a natural-language agent goal into a spend request.
- Seeded policies with merchant allowlists, daily limits, purpose controls, and autonomy thresholds.
- Spend simulator for x402, USDC transfer, and batch-style payments.
- Policy-check trace with pass, warning, and fail results.
- Exception review queue for threshold-triggered payments.
- Arc Testnet registry transaction hash, memoId, and receipt ledger in `arc_testnet` mode.
- Real settlement adapter mode for server-side wallet/Gateway transfers with pending, settled, and failed provider states.
- Architecture page showing the testnet audit layer and Arc-native payment roadmap.

## Demo Flow

1. Open `/demo` for the guided product walkthrough.
2. Run the approved ResearchAgent nanopayment scenario from `/simulate?scenario=approved`.
3. Run the blocked TradingAgent unsafe spend scenario from `/simulate?scenario=rejected`.
4. Run the OpsAgent threshold scenario from `/simulate?scenario=review`, authorize it in the review queue, and inspect the receipt in the ledger.
5. Use the AI intent builder on `/simulate` to turn an agent goal into a structured spend request.
6. Show `/contract` and the Arcscan link for real Arc Testnet registry proof.
7. Show `/architecture` for the upgrade path from audit proof to a real settlement adapter.

For a live walkthrough flow, see `DEMO_SCRIPT.md`.

## Arc Testnet Mode

Production is intended to run with `NEXT_PUBLIC_SETTLEMENT_MODE=arc_testnet`. In that mode, the simulator and review flow write real Arc Testnet transactions to `ArcAllowanceRegistry` for spend requests and spend decisions. The registry is an audit layer only: no mainnet funds move, the contract does not custody balances, the contract does not transfer USDC, and the frontend never receives private keys. Mock mode remains available for local development with `NEXT_PUBLIC_SETTLEMENT_MODE=mock`.

## Real Settlement Mode

`NEXT_PUBLIC_SETTLEMENT_MODE=real_settlement` turns approved spend into a server-side payment-adapter call. ArcAllowance still owns the control plane: agent request, policy checks, exception review, idempotency, audit events, and ledger receipts. The settlement adapter owns funded wallets, Circle/Gateway/x402 credentials, provider retries, balances, and actual USDC movement.

Flow:

1. Agent submits merchant, amount, purpose, and payment type.
2. Policy engine approves, rejects, or routes to exception review.
3. Approved spend calls `REAL_SETTLEMENT_ADAPTER_URL` from the server with an idempotency key.
4. The adapter executes or queues the provider transfer and returns `settled` or `pending`.
5. Pending transfers are finalized through `POST /api/settlement/webhook`.
6. The ledger stores provider payment ID, provider status, memo ID, tx/reference hash, merchant wallet, and optional Arc audit metadata.

Real settlement is fail-closed. If `REAL_SETTLEMENT_ENABLED=true`, `REAL_SETTLEMENT_ADAPTER_URL`, or provider auth is missing, approved payments return an error and no fake receipt is created.

Read-only readiness is exposed at:

```text
GET /api/settlement/readiness
```

The readiness endpoint exposes deployment status without leaking token or webhook secret values.

### Sandbox Settlement Adapter

ArcAllowance includes an internal sandbox adapter for end-to-end lifecycle testing. It never moves funds and must not be presented as real settlement. It is useful for verifying that `real_settlement` mode can move a request from policy approval to `settlement_pending`, then to `settled` through the webhook path.

Local test configuration:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SETTLEMENT_MODE=real_settlement
REAL_SETTLEMENT_ENABLED=true
REAL_SETTLEMENT_PROVIDER=custom
REAL_SETTLEMENT_ADAPTER_URL=http://localhost:3000/api/settlement/sandbox-adapter
REAL_SETTLEMENT_ADAPTER_TOKEN=local-sandbox-token
REAL_SETTLEMENT_WEBHOOK_SECRET=local-webhook-secret
SANDBOX_SETTLEMENT_ADAPTER_ENABLED=true
SANDBOX_SETTLEMENT_ADAPTER_RESULT=pending_then_settled
```

Run the ResearchAgent scenario. The simulator should first show `settlement pending`; after the sandbox webhook runs, the ledger should show a settled receipt with a sandbox provider payment ID.

Adapter response shape:

```json
{
  "status": "settled",
  "provider": "circle",
  "providerPaymentId": "provider-transfer-id",
  "providerStatus": "complete",
  "providerReference": "optional-reference",
  "txHash": "optional-chain-or-provider-tx",
  "gatewayAuthorizationHash": "optional-x402-auth",
  "gatewayBatchId": "optional-batch-id",
  "memoId": "optional-provider-memo"
}
```

Webhook shape:

```json
{
  "spendRequestId": "spend_...",
  "status": "settled",
  "provider": "circle",
  "providerPaymentId": "provider-transfer-id",
  "providerStatus": "complete",
  "txHash": "optional-chain-or-provider-tx"
}
```

Webhook calls must include:

```text
Authorization: Bearer REAL_SETTLEMENT_WEBHOOK_SECRET
```

## Optional AI Layer

The spend simulator includes an AI intent builder. With `OPENAI_API_KEY` configured, it uses OpenAI to convert a plain-English autonomous agent goal into a structured spend request. Without a key, it falls back to a deterministic local parser so the demo still works.

The AI layer proposes request fields only. The policy engine still decides whether the request clears automatically, is rejected, or is routed to exception review. In `arc_testnet` mode, those decisions are anchored through the server-side Arc Testnet registry adapter.

## Arc Testnet Contract

ArcAllowance includes a deployable Solidity contract named `ArcAllowanceRegistry`.

Contract purpose:

- Register agent identities for audit proof.
- Store policy hashes and policy budget limits in 6-decimal USDC units.
- Record spend requests.
- Mark spend decisions as approved, rejected, or needs review.

Deployed Arc Testnet contract:

```text
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f
```

Explorer link:

```text
https://testnet.arcscan.app/address/0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f
```

Deploy to Arc Testnet:

```bash
npm install
npx hardhat compile
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network DEPLOYER_PRIVATE_KEY=your_testnet_private_key \
  npx hardhat run scripts/deploy-arcallowance.ts --network arcTestnet
```

After deployment, copy the deployed address into `.env.local`:

```bash
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x...
```

Why the contract does not custody funds:

- It has no payable functions.
- It does not store USDC balances.
- It does not call ERC-20 transfer functions.
- It records audit facts only.

What is real onchain:

- `ArcAllowanceRegistry` deployment on Arc Testnet.
- Agent registration events.
- Policy hash creation events.
- Spend request records.
- Spend decision events.

What remains mocked:

- Gateway/x402 settlement unless `real_settlement` is configured with a live adapter.
- USDC payment receipts unless provider webhooks return real payment IDs.
- Arc transaction hashes shown in the local demo ledger unless produced by a real registry transaction.
- Frontend wallet connection and contract writes.

Gateway/x402 integration later would connect approved policy decisions to real authorization and settlement adapters, then anchor request and decision metadata in `ArcAllowanceRegistry`.

## Arc-Native Roadmap

- Circle developer-controlled wallets for agent wallets.
- Circle Gateway/x402 for gas-free nanopayments.
- Arc transaction memos for payment reconciliation.
- Arc batched transactions for grouped settlements.
- ERC-8004 for agent identity and reputation.
- App Kit, CCTP, and Unified Balance for crosschain USDC funding.
- StableFX later for USDC/EURC agent budgets.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Optional OpenAI intent generation
- Hardhat
- Solidity
- Local seeded data
- Server-backed JSON state for spend requests, approvals, audit events, and receipts
- Mock settlement helpers

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` when needed.

```bash
NEXT_PUBLIC_APP_NAME=ArcAllowance
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_MODE=arc_testnet
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_EXPLORER_URL=https://testnet.arcscan.app
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f
NEXT_PUBLIC_SETTLEMENT_MODE=arc_testnet
NEXT_PUBLIC_DOMAIN=arcallowance.xyz

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5

ARC_ADMIN_TOKEN=
ARC_DATA_DIR=.data
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_PRIVATE_KEY=
DEPLOYER_PRIVATE_KEY=

REAL_SETTLEMENT_ENABLED=false
REAL_SETTLEMENT_PROVIDER=custom
REAL_SETTLEMENT_ADAPTER_URL=
REAL_SETTLEMENT_ADAPTER_TOKEN=
REAL_SETTLEMENT_WEBHOOK_SECRET=
REAL_SETTLEMENT_TIMEOUT_MS=15000
REAL_SETTLEMENT_ANCHOR_ARC_TESTNET=false
```

`ARC_ADMIN_TOKEN` is optional. When set, write APIs require an `x-arc-admin-token` header; without it the app remains publicly writable but rate-limited for demo mode. `ARC_DATA_DIR` stores the server ledger JSON and should not be committed.

## Data Models

The core models live in `src/lib/types.ts`: `Agent`, `Policy`, `Merchant`, `SpendRequest`, `PolicyCheck`, `Receipt`, and `AuditEvent`.

## Folder Structure

```text
src/app                 App Router pages
src/components          Reusable interface components
src/lib                 Seed data, policy engine, settlement helpers, and shared types
contracts               Arc Testnet audit registry contract
scripts                 Hardhat deployment scripts
deployments             Arc Testnet deployment metadata
```

## Deployment Summary

Build with `npm run build`, run with `npm run start`, and deploy behind Nginx on an Ubuntu VPS using PM2. Point `arcallowance.xyz` and `www.arcallowance.xyz` A records to the VPS, then issue HTTPS certificates with Certbot. Full commands are in `DEPLOYMENT.md`.

## Future Improvements

- Persist policies and requests in a database.
- Add real Circle Wallet integration behind a feature flag.
- Add Gateway/x402 authorization adapters.
- Add Arc explorer links for testnet settlements.
- Add team accounts, audit export, and role-based approvals.
