# ArcAllowance

USDC spend controls for autonomous AI agents on Arc.

## Problem

Agents should not get unlimited wallets. Before autonomous systems can safely pay for APIs, data, compute, research, and tools, teams need budgets, merchant allowlists, approval thresholds, policy checks, and auditable receipts.

## Solution

ArcAllowance is a mock-first spend-control layer for AI agents. It lets a user create and inspect agents, assign policy-driven USDC budgets, simulate Gateway/x402-style payments, and see whether each request is approved, rejected, or requires human approval.

## Why Arc / USDC / Circle

ArcAllowance is designed around stablecoin-native agent spending. Arc transaction memos make reconciliation clear, USDC keeps budgets denominated in a predictable unit, and Circle Wallets plus Gateway/x402-style authorization give a path toward controlled agent payments without exposing private keys in the app.

## Features

- Agent profiles with wallet addresses, risk tiers, and capabilities.
- Optional AI intent builder that converts a natural-language agent goal into a spend request.
- Seeded policies with merchant allowlists, daily limits, purpose controls, and approval thresholds.
- Spend simulator for x402, USDC transfer, and batch-style payments.
- Policy-check trace with pass, warning, and fail results.
- Human approval queue for threshold-triggered payments.
- Mock Gateway authorization hash, mock Arc transaction hash, memoId, and receipt ledger.
- Architecture page showing the local MVP and Arc-native roadmap.

## Demo Flow

1. Open the landing page and use the dashboard CTA.
2. Review agents and seeded policies.
3. Use the AI intent builder on `/simulate` to turn an agent goal into a structured spend request.
4. Run the approved ResearchAgent nanopayment scenario.
5. Run the blocked TradingAgent unsafe spend scenario.
6. Run the OpsAgent threshold scenario, approve it in the approvals page, and inspect the receipt in the ledger.
7. Show the architecture page to explain how mock mode maps to a future Arc-native implementation.
8. Show `/contract` and the Arcscan link for real Arc Testnet registry proof.

For a live walkthrough flow, see `DEMO_SCRIPT.md`.

## Mock Mode

ArcAllowance does not move real funds. Mock mode generates deterministic-looking receipts, Gateway authorization hashes, Arc transaction hashes, and batch identifiers for product demonstration only. No private keys, custody, compliance claim, mainnet transaction, or real settlement is included.

## Optional AI Layer

The spend simulator includes an AI intent builder. With `OPENAI_API_KEY` configured, it uses OpenAI to convert a plain-English autonomous agent goal into a structured spend request. Without a key, it falls back to a deterministic local parser so the demo still works.

The AI layer proposes request fields only. The local policy engine still decides whether the request is approved, rejected, or routed to human approval, and settlement remains mocked.

## Arc Testnet Contract

ArcAllowance includes a deployable Solidity contract named `ArcAllowanceRegistry`.

Contract purpose:

- Register agent identities for audit proof.
- Store policy hashes and policy budget limits in 6-decimal USDC units.
- Record spend requests.
- Mark spend decisions as approved, rejected, or needs approval.

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

- Gateway/x402 settlement.
- USDC payment receipts.
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
- Browser localStorage state
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
NEXT_PUBLIC_CHAIN_MODE=mock
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_EXPLORER_URL=https://testnet.arcscan.app
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f
NEXT_PUBLIC_SETTLEMENT_MODE=mock
NEXT_PUBLIC_DOMAIN=arcallowance.xyz

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5

ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
DEPLOYER_PRIVATE_KEY=
```

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
