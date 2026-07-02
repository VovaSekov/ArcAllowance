# ArcAllowance Project Brief

## Product Concept

ArcAllowance is a USDC spend-control layer for autonomous AI agents on Arc. It proves that agent wallets need policy enforcement before autonomy: budgets, allowlists, thresholds, purpose controls, and auditable receipts.

## Target Users

- Builders creating AI agents that pay for APIs, data, compute, and tooling.
- Web3 teams exploring stablecoin-native agent commerce.
- Operators who need a visible approval and audit flow before allowing autonomous spend.

## Core User Stories

- As a builder, I can inspect seeded agents and understand what each agent is allowed to buy.
- As an operator, I can simulate a spend request and see exactly why it passed, failed, or needs approval.
- As an approver, I can approve a threshold-triggered payment and receive a mock settlement receipt.
- As a demo viewer, I can understand why Arc memos, USDC, Circle Wallets, Gateway/x402, and agent identity matter.

## Main Demo Scenarios

- Approved nanopayment: ResearchAgent pays `0.03 USDC` to MarketData API for `cpi_dataset_query`.
- Blocked unsafe spend: TradingAgent tries to pay `250 USDC` to Unknown Alpha Group for `private_alpha_signal`.
- Needs approval: OpsAgent tries to pay `45 USDC` to LLM Inference Hub for `weekly_compute_budget`.
- Batch-style usage: multiple API calls total `0.42 USDC` and are represented as one mock Gateway settlement.

## Product Principles

- Budgets before autonomy.
- Make every autonomous payment explainable.
- Clearly separate mock settlement from real money movement.
- Use serious fintech language and interface patterns.
- Optimize for demo clarity without making false production claims.

## What Is Mock Mode

Mock mode is a local-only simulation. It produces memo IDs, mock Gateway authorization hashes, mock Arc transaction hashes, and receipt records without touching private keys, custody infrastructure, mainnet, or testnet funds.

## What Should Become Arc-Native Later

- Arc Testnet registry transactions can anchor audit proof for agent registrations, policy hashes, spend requests, and decisions.
- Circle developer-controlled wallets for agent wallets.
- Circle Gateway/x402 authorization for nanopayments.
- Arc transaction memos and batched settlement.
- ERC-8004 identity and reputation records for agents.
- App Kit, CCTP, Unified Balance, and StableFX integrations.

## Intentionally Out Of Scope

- Real private keys.
- Real custody.
- Production compliance claims.
- Mainnet transactions.
- Real money movement.
- Escrow marketplace behavior.
- Invoice-review clone behavior.
- Generic faucet, swap, or token dashboard behavior.
