# ArcAllowance Submission

## Project

ArcAllowance

## One-Liner

ArcAllowance is an Arc Testnet audit and policy-control layer that makes AI agent USDC spending governable before autonomous payments are enabled.

## Links

- Live app: https://arcallowance.xyz
- Guided demo: https://arcallowance.xyz/demo
- GitHub: https://github.com/VovaSekov/ArcAllowance
- X / Twitter: https://x.com/arcallowans
- Arcscan contract: https://testnet.arcscan.app/address/0x3c82F7aD5b78e09c6Aa7020402f85662e7248A8f

## Problem

Autonomous AI agents should not get unlimited wallets. Before agents can safely spend USDC on APIs, data, compute, research, or tools, teams need budget limits, merchant allowlists, purpose checks, autonomy thresholds, exception review, and an auditable decision trail.

## Solution

ArcAllowance lets an AI agent request a USDC spend, then evaluates the request before any settlement action can happen. The policy engine checks merchant allowlists, amount limits, daily budget, purpose, blocked purposes, merchant risk, and autonomy thresholds. The decision becomes one of three outcomes:

- approved
- rejected
- needs review

Every outcome is recorded in the app ledger. In production mode, spend requests and decisions are anchored to `ArcAllowanceRegistry` on Arc Testnet as audit proof.

## Why Arc

ArcAllowance uses Arc Testnet as the audit layer for agent spend governance. The deployed registry records agent registrations, policy hashes, spend requests, and final spend decisions. This gives the project a clear path toward Arc-native agent payments with transaction memos, batched settlement, Circle Wallets, and Gateway/x402-style authorization.

## What Is Live

- Next.js production app at `arcallowance.xyz`.
- `ArcAllowanceRegistry` deployed on Arc Testnet.
- Server-side Arc Testnet registry writes for spend requests and decisions.
- Seeded agents, merchants, policies, requests, receipts, and audit events.
- Spend simulator with approved, rejected, and review-required paths.
- Review queue for above-threshold spend.
- Ledger with request status, receipt details, memo IDs, and audit trail.
- Optional OpenAI intent builder with deterministic fallback.

## Safety Boundary

ArcAllowance is non-custodial in its current production mode.

- No mainnet funds move.
- The contract does not custody balances.
- The contract does not transfer USDC.
- The frontend never receives private keys.
- Real USDC settlement requires a separate server-side provider adapter.

## Demo Path

1. Open https://arcallowance.xyz/demo.
2. Run the approved scenario:
   `ResearchAgent -> MarketData API -> 0.03 USDC -> cpi_dataset_query`
3. Run the rejected scenario:
   `TradingAgent -> Unknown Alpha Group -> 250 USDC -> private_alpha_signal`
4. Run the review scenario:
   `OpsAgent -> LLM Inference Hub -> 45 USDC -> weekly_compute_budget`
5. Open `/approvals` and approve the review item.
6. Open `/ledger` and inspect the receipt/audit trail.
7. Open `/contract` and the Arcscan link for Arc Testnet proof.

## Suggested Submission Pitch

ArcAllowance is budgets before autonomy: a control layer for AI agents spending USDC on Arc. Agents can request payments, but policies enforce merchant allowlists, limits, purposes, risk checks, and review thresholds before anything clears. Each approved, rejected, or review-required decision is saved in a ledger and anchored to Arc Testnet through `ArcAllowanceRegistry`. The current version is testnet-safe and non-custodial, with a clear upgrade path to Circle Wallets and Gateway/x402 settlement.
