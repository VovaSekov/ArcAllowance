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

7. Copy the contract address into `.env.local` or your VPS environment:

```bash
NEXT_PUBLIC_ARC_ALLOWANCE_REGISTRY_ADDRESS=0x...
```

8. Build the app:

```bash
npm run build
```

9. Restart the app:

```bash
pm2 restart arcallowance
```

Security rules:

- Never commit `.env`.
- Never commit private keys.
- Never use a mainnet wallet.
- Never claim real funds moved.
- Use only a fresh testnet wallet.
- Keep Gateway/x402 settlement mocked unless a real integration is intentionally added later.

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

## Troubleshooting

- `nginx -t` fails: check the server block syntax and confirm the symlink points to the correct file.
- Site returns 502: confirm PM2 is running with `pm2 status` and the app is listening on port `3030`.
- Certbot fails: confirm DNS A records point to the VPS and port 80 is reachable.
- Build fails: run `npm run typecheck` and `npm run lint` locally, fix errors, then redeploy.
- Environment mismatch: ensure `.env.local` mirrors `.env.example` and keeps settlement mode set to `mock`.
