# ArcAllowance Deployment

## VPS Requirements

- Ubuntu 22.04 or newer.
- Node.js 20 LTS or newer.
- Nginx.
- PM2.
- A domain pointed to the VPS: `arcallowance.xyz`.
- Current temporary HTTPS URL before domain purchase: `https://arcallowance.109.206.243.135.sslip.io`.

## SSH Access Assumptions

Current VPS:

```text
109.206.243.135
```

Replace `YOUR_REPO_URL` with the GitHub SSH or HTTPS URL if setting up a fresh server.

```bash
ssh root@109.206.243.135
```

## Install System Dependencies

```bash
apt update && apt upgrade -y
apt install -y curl git nginx certbot python3-certbot-nginx
```

## Install Node.js

Using NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

Using nvm is also acceptable if your VPS standardizes on nvm-managed Node versions.

## Clone And Install

```bash
git clone YOUR_REPO_URL arcallowance
cd arcallowance
npm install
```

## Build

```bash
npm run build
```

## Arc Testnet Contract Deployment

The registry is an onchain audit layer only. It does not custody funds and does not perform real USDC transfers.

1. Create a fresh testnet wallet. Do not reuse a mainnet wallet.

2. Add Arc Testnet to the wallet:

```text
RPC: https://rpc.testnet.arc.network
Chain ID: 5042002
Symbol: USDC
Explorer: https://testnet.arcscan.app
```

3. Fund the wallet from the Circle faucet:

```text
https://faucet.circle.com
```

4. Set deployment environment variables:

```bash
export ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
export ARC_TESTNET_PRIVATE_KEY=your_testnet_private_key
export DEPLOYER_PRIVATE_KEY=your_testnet_private_key
```

5. Compile the contract:

```bash
npx hardhat compile
```

6. Deploy to Arc Testnet:

```bash
npx hardhat run scripts/deploy-arcallowance.ts --network arcTestnet
```

The script writes deployment metadata to `deployments/arc-testnet.json`.

7. Bootstrap the seeded ArcAllowance agents and policies into the deployed registry:

```bash
npm run contracts:bootstrap:arc
```

The bootstrap command updates `deployments/arc-testnet.json` with `seededRegistry` IDs used by the runtime API.

8. Copy the contract address and testnet mode into `.env.local` or your VPS environment:

```bash
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_MODE=arc_testnet
NEXT_PUBLIC_SETTLEMENT_MODE=arc_testnet
ARC_DATA_DIR=/root/arcallowance/.data
ARC_ADMIN_TOKEN=
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_PRIVATE_KEY=your_fresh_testnet_operator_private_key
```

Leave `ARC_ADMIN_TOKEN` blank for a public testnet demo. Set it only when the frontend is configured to send `x-arc-admin-token`; otherwise simulator and approvals writes will be rejected.

9. Build the app:

```bash
npm run build
```

10. Restart the app:

```bash
pm2 restart arcallowance
```

Security rules:

- Never commit `.env`.
- Never commit private keys.
- Never use a mainnet wallet.
- Never claim mainnet funds moved.
- Use only a fresh testnet wallet.
- Gateway/x402 and USDC transfer execution remain separate from the ArcAllowanceRegistry audit layer.
- `OPENAI_API_KEY` is optional. If set, it powers AI intent generation only; it must not approve or settle payments.

## Real Settlement Mode

Real settlement is separate from Arc Testnet audit mode. Use it only after a funded wallet provider or Gateway/x402 adapter is deployed server-side. The browser must never receive wallet API keys, private keys, entity secrets, or custody credentials.

Required environment:

```bash
NEXT_PUBLIC_SETTLEMENT_MODE=real_settlement
REAL_SETTLEMENT_ENABLED=true
REAL_SETTLEMENT_PROVIDER=custom
REAL_SETTLEMENT_ADAPTER_URL=https://your-settlement-adapter.example.com/settle
REAL_SETTLEMENT_ADAPTER_TOKEN=replace_with_adapter_bearer_token
REAL_SETTLEMENT_WEBHOOK_SECRET=replace_with_long_random_webhook_secret
REAL_SETTLEMENT_TIMEOUT_MS=15000
REAL_SETTLEMENT_ANCHOR_ARC_TESTNET=false
```

Set `REAL_SETTLEMENT_PROVIDER` to `circle`, `gateway_x402`, or `custom`. ArcAllowance calls the adapter after policy approval or after a budget owner authorizes an exception.

Adapter request:

```json
{
  "idempotencyKey": "settle:spend_id:memo_id",
  "spendRequestId": "spend_id",
  "agent": {
    "id": "agent_research",
    "name": "ResearchAgent",
    "walletAddress": "0x..."
  },
  "merchant": {
    "id": "merchant_market_data",
    "name": "MarketData API",
    "walletAddress": "0x...",
    "x402Endpoint": "/api/mock/market-data"
  },
  "transfer": {
    "amountUSDC": 0.03,
    "currency": "USDC",
    "paymentType": "x402",
    "purpose": "cpi_dataset_query",
    "memoId": "ARC-..."
  },
  "policy": {
    "riskScore": 10,
    "checks": []
  },
  "arcAudit": {
    "onchainRequestId": "optional",
    "recordTxHash": "optional",
    "decisionTxHash": "optional"
  },
  "callbackUrl": "https://arcallowance.xyz/api/settlement/webhook"
}
```

Adapter response:

```json
{
  "status": "settled",
  "provider": "circle",
  "providerPaymentId": "provider-transfer-id",
  "providerStatus": "complete",
  "providerReference": "optional-reference",
  "txHash": "optional-chain-or-provider-tx",
  "gatewayAuthorizationHash": "optional-x402-auth",
  "gatewayBatchId": "optional-batch-id"
}
```

If the provider is asynchronous, return:

```json
{
  "status": "pending",
  "provider": "circle",
  "providerPaymentId": "provider-transfer-id",
  "providerStatus": "pending"
}
```

Then finalize through:

```bash
curl -X POST https://arcallowance.xyz/api/settlement/webhook \
  -H "Authorization: Bearer $REAL_SETTLEMENT_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "spendRequestId": "spend_...",
    "status": "settled",
    "provider": "circle",
    "providerPaymentId": "provider-transfer-id",
    "providerStatus": "complete",
    "txHash": "provider-or-chain-reference"
  }'
```

Fail-closed behavior:

- If real settlement is enabled without an adapter URL, approved spend returns an error.
- If the adapter returns `failed`, no receipt is created.
- If the adapter returns `pending`, the request stays `settlement_pending` until webhook finalization.
- If webhook authorization is wrong, ArcAllowance rejects the update.

Readiness check:

```bash
curl -fsS https://arcallowance.xyz/api/settlement/readiness
```

This endpoint returns booleans for adapter URL, adapter token, webhook secret, provider, Arc audit toggle, and missing setup items. It never returns secret values.

## Sandbox Settlement Adapter

ArcAllowance ships with an internal sandbox adapter:

```text
POST /api/settlement/sandbox-adapter
```

This adapter is for integration testing only. It never moves funds. It validates `REAL_SETTLEMENT_ADAPTER_TOKEN`, returns provider-like IDs, and can call `/api/settlement/webhook` after a short delay.

Local or staging test config:

```bash
NEXT_PUBLIC_APP_URL=https://arcallowance.xyz
NEXT_PUBLIC_SETTLEMENT_MODE=real_settlement
REAL_SETTLEMENT_ENABLED=true
REAL_SETTLEMENT_PROVIDER=custom
REAL_SETTLEMENT_ADAPTER_URL=https://arcallowance.xyz/api/settlement/sandbox-adapter
REAL_SETTLEMENT_ADAPTER_TOKEN=replace_with_long_random_adapter_token
REAL_SETTLEMENT_WEBHOOK_SECRET=replace_with_long_random_webhook_secret
SANDBOX_SETTLEMENT_ADAPTER_ENABLED=true
SANDBOX_SETTLEMENT_ADAPTER_RESULT=pending_then_settled
SANDBOX_SETTLEMENT_WEBHOOK_DELAY_MS=1500
```

Expected test result:

1. Submit the ResearchAgent `0.03 USDC` scenario.
2. The request becomes `settlement_pending`.
3. The sandbox adapter calls the webhook.
4. The request becomes `settled`.
5. The ledger shows a receipt with `sandbox_pay_...` as provider payment ID.

Important: disable `SANDBOX_SETTLEMENT_ADAPTER_ENABLED` before presenting the app as real settlement. Real settlement requires an external funded wallet/Gateway provider.

## PM2 Setup

ArcAllowance currently runs on port `3030` behind Nginx.

```bash
npm install -g pm2
PORT=3030 pm2 start npm --name arcallowance -- start
pm2 save
pm2 startup
```

If PM2 prints an additional startup command, run that command exactly.

## Nginx Config

Create `/etc/nginx/sites-available/arcallowance`:

```nginx
server {
    listen 80;
    server_name arcallowance.xyz www.arcallowance.xyz;

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/arcallowance /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## DNS A Records

Point both records to the VPS public IP:

```text
arcallowance.xyz      A      109.206.243.135
www.arcallowance.xyz  A      109.206.243.135
```

Wait for DNS propagation before issuing certificates.

## Certbot HTTPS Setup

```bash
certbot --nginx -d arcallowance.xyz -d www.arcallowance.xyz
```

## Restart And Update Commands

```bash
cd /root/arcallowance
git pull --ff-only
npm run build
pm2 restart arcallowance
```

## Optional OpenAI Setup

The simulator works without OpenAI. To enable real AI intent generation, add the key to `/root/arcallowance/.env.local` and restart the app:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

Do not expose the key as a `NEXT_PUBLIC_` variable.

## Troubleshooting

- `nginx -t` fails: check the server block syntax and confirm the symlink points to the correct file.
- Site returns 502: confirm PM2 is running with `pm2 status` and the app is listening on port `3030`.
- Certbot fails: confirm DNS A records point to the VPS and port 80 is reachable.
- Build fails: run `npm run typecheck` and `npm run lint` locally, fix errors, then redeploy.
- Environment mismatch: ensure `.env.local` mirrors `.env.example` and keeps production settlement mode set to `arc_testnet`.
