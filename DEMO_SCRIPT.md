# ArcAllowance Live Walkthrough

## 1. Open With The Product Story

Start on `/` or `/demo`.

Say:

> ArcAllowance is the control layer between autonomous AI agents and USDC spend. Agents can request payments, but budgets, merchant allowlists, purpose rules, risk checks, and approval thresholds decide what clears.

Point to:

- AI spend request
- Policy engine
- Arc Testnet audit proof
- Receipt ledger

## 2. Show The Dashboard

Open `/dashboard`.

Say:

> This is the control room. It shows agent budget, spend activity, requests waiting for exception review, blocked attempts, policy health, and the current settlement/audit mode.

Point to:

- Total agent budget
- Pending review
- Blocked attempts
- How ArcAllowance works
- Arc Testnet contract status

## 3. Explain Who Reviews Exceptions

Open `/approvals`.

Say:

> Routine in-policy spend does not need manual approval. The review queue exists for the budget owner or operator when a request crosses the autonomy threshold. It is a safety brake for larger or riskier spend, not a required step for every payment.

## 4. Approved Nanopayment

Open `/simulate?scenario=approved`.

Click `Run policy check`.

Expected request:

```text
ResearchAgent -> MarketData API
0.03 USDC
cpi_dataset_query
x402
```

Say:

> This passes the merchant allowlist, amount cap, daily budget, purpose, blocked-purpose, merchant-risk, and autonomy-threshold checks. In Arc Testnet mode, ArcAllowance records the request and decision in the registry audit layer and creates a receipt for the ledger. No mainnet funds move.

Point to:

- Approved status
- Rule-by-rule policy result
- Arc Testnet tx / receipt details

## 5. Blocked Unsafe Spend

Open `/simulate?scenario=rejected`.

Click `Run policy check`.

Expected request:

```text
TradingAgent -> Unknown Alpha Group
250 USDC
private_alpha_signal
usdc_transfer
```

Say:

> This request is rejected before settlement because the merchant is not allowlisted, the amount exceeds limits, the purpose is blocked, and the merchant is high risk. Rejected requests do not create settlement receipts.

Point to:

- Rejected status
- Failed hard rules
- Timeline showing settlement stopped

## 6. Threshold Exception Review

Open `/simulate?scenario=review`.

Click `Run policy check`.

Expected request:

```text
OpsAgent -> LLM Inference Hub
45 USDC
weekly_compute_budget
batch
```

Say:

> This passes hard controls but is above the autonomy threshold. ArcAllowance routes it to review so a budget owner can approve or reject the exception.

Open `/approvals`, approve the request.

Say:

> Approving the exception records the decision, creates the audit trail, and lets the ledger show exactly why this higher spend was allowed.

## 7. Inspect The Ledger

Open `/ledger`.

Say:

> The ledger is the reconciliation surface. It shows approved, rejected, review-required, pending, settled, and failed requests. Receipt details include memo IDs, settlement mode, registry hashes, provider references when configured, and the audit trail.

Filter statuses and open a receipt detail.

## 8. Show Arc Testnet Proof

Open `/contract`.

Say:

> The product currently proves the control and audit layer on Arc Testnet. The registry records agent registrations, policy hashes, spend requests, and spend decisions. It does not custody funds and does not transfer USDC.

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

## 9. Explain Real Settlement

Open `/architecture`.

Say:

> ArcAllowance already separates control from settlement. The current production mode is Arc Testnet audit proof. Real USDC movement requires a server-side settlement adapter such as Circle Wallets or Gateway/x402. That adapter owns funded wallets, provider credentials, balances, payment failures, retries, webhooks, and reconciliation. ArcAllowance owns policy, review, audit, and receipts.

Final line:

> ArcAllowance is budgets before autonomy: AI agents can request spend, but policy decides what clears.
