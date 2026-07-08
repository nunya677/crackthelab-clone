# Deploying ExploitYard

Two pieces, deployed separately:
- **Backend** (api + orchestrator + Postgres + Redis + Docker-based live challenges) → a real VM with Docker. This is non-negotiable — the orchestrator needs the actual Docker socket to spin up challenge containers, which rules out serverless/PaaS hosts.
- **Frontend** (static Vite build) → Vercel or Cloudflare Pages, free tier.

This runbook uses **Oracle Cloud's Always Free tier** for the VM (genuinely free forever, not a trial) and **Vercel** for the frontend. Swap providers if you prefer — the compose file and Dockerfiles don't care which VM host you use.

## 0. Put this project in its own git repo

Right now `crackthelab-clone` is untracked content sitting inside your home-directory's git repo, not its own repository. Both Vercel and the VM need something to `git clone`/deploy from, so first:

```powershell
cd C:\Users\user\projects\crackthelab-clone
git init
git add .
git commit -m "Initial commit"
```

Then create a new repo on GitHub and push it there (`git remote add origin <url> && git push -u origin main`). Do this yourself — I won't push code to a remote on your behalf without you asking explicitly in the moment.

## 1. Provision the VM

1. Sign up for [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) (card verification required even for the free tier — this is normal, they don't charge unless you explicitly upgrade).
2. Create an **Always Free** compute instance — Ubuntu 22.04, the free Ampere A1 shape (4 OCPU / 24GB RAM total available across your free instances) or a free AMD micro shape if Ampere capacity isn't available in your region.
3. In the instance's **Security List** (Networking → Virtual Cloud Network → your VCN → Security Lists), add ingress rules for:
   - TCP `80`, `443` (the reverse proxy)
   - TCP `32768-60999` (Docker's default ephemeral port range — this is what live challenge instances get published on; see "Known limitations" below)
4. SSH in, then install Docker:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER
   # log out and back in for the group change to apply
   ```

## 2. Deploy the backend

```bash
git clone <your-repo-url> exploityard
cd exploityard
cp .env.production.example .env.production
nano .env.production   # fill in real secrets — see comments in the file
```

Generate strong secrets: `openssl rand -hex 32` (run it once per secret — `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ORCHESTRATOR_INTERNAL_TOKEN`, `POSTGRES_PASSWORD`).

Set `PUBLIC_HOST` to the VM's public IP (or a domain, once you've pointed one at it) — this is what gets embedded in every live challenge's URL, so get it right or challenge instances will be unreachable.

Edit `Caddyfile` and replace `api.yourdomain.com` with your real subdomain.

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Run migrations and seed the challenge content (one-off, inside the running api container):

```bash
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy --schema=/repo/infra/prisma/schema.prisma
docker compose -f docker-compose.prod.yml exec api npx tsx /repo/infra/prisma/seed.ts
```

You'll also need to build and push the challenge target images (`crackthelab/sqli-101`, `crackthelab/idor-much`, `crackthelab/broken-auth`, `crackthelab/cross-origin-chaos`) to a registry the VM can pull from, or build them locally on the VM from the `challenges/` folder — the orchestrator's `pullImageIfMissing` will try to pull by name if they're not already present locally.

## 3. DNS

Point `api.yourdomain.com` (an A record) at the VM's public IP. Caddy will automatically request a Let's Encrypt certificate for it the first time it receives traffic — no manual cert setup.

## 4. Deploy the frontend

On [vercel.com](https://vercel.com), import the GitHub repo, set the root directory to `apps/web`, and add these environment variables:

```
VITE_API_URL=https://api.yourdomain.com
VITE_PAYPAL_CLIENT_ID=<your PayPal client id>
VITE_PAYPAL_PLAN_ID=<your PayPal subscription plan id>
```

Deploy. Vercel gives you a URL like `exploityard.vercel.app` (or wire up a custom domain later).

## 5. Close the loop

Go back to `.env.production` on the VM and set `WEB_ORIGIN` to the exact Vercel URL from step 4 (CORS will reject anything that doesn't match exactly), then:

```bash
docker compose -f docker-compose.prod.yml up -d --build api
```

## Known limitations, being upfront about them

- **Mixed content on live-instance iframes**: the frontend is served over HTTPS (Vercel), but live challenge instances are plain `http://<VM-IP>:<random-port>` — some browsers will block the in-page iframe embed as mixed content, even though the "Open in new tab ↗" link still works fine (top-level navigation isn't blocked the same way). Fixing the iframe case properly means dynamic per-instance TLS (e.g. Caddy on-demand certs + wildcard DNS), which is real additional work, not a config tweak.
- **Single VM, no horizontal scaling**: this is one Docker host. Fine for a small/medium user base; it won't survive a traffic spike the way a multi-region setup would.
- **Ephemeral port range**: opening `32768-60999` in the firewall is broad. You can narrow Docker's published-port range and the firewall rule together later if you want tighter security.
- **Oracle Free Tier capacity**: some regions occasionally show "out of capacity" for the free Ampere shape — retry later or try a different availability domain if you hit this.
