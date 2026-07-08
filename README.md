# ExploitYard

A gamified cyber range / CTF platform, visually inspired by [CrackTheLab](https://crackthelab.com/):
read short write-ups on real attack techniques in **Learn**, then solve the matching challenges
(crypto, forensics, web, misc) for points, race a live leaderboard, and — for `LIVE`-type
challenges — spin up your own disposable, isolated Docker container to attack directly. Logged-out
visitors land on a marketing homepage; logged-in users land on the challenge dashboard.

## Architecture

```
apps/
  web/            React + Vite + TS frontend
  api/            Express + TS REST API + Socket.io (auth, challenges, submissions, leaderboard)
  orchestrator/   Node + TS service that creates/destroys challenge containers via dockerode
packages/
  shared/         zod schemas + TS types shared across apps
infra/
  prisma/         Prisma schema, migrations, seed script
challenges/        Challenge content: metadata + the vulnerable apps/Dockerfiles for LIVE challenges
```

`api` and `orchestrator` are separate processes: the orchestrator is the only thing with Docker
socket access (it's what's allowed to create containers), while `api` owns auth/scoring/content.
They share the same Postgres database via `@crackthelab/db`; `api` calls the orchestrator's
internal HTTP API (bearer-token protected) to start/stop instances.

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres/Redis via `docker compose`, and for the orchestrator to actually run
  live-challenge containers). Confirm it's running with `docker version`.

## Setup

```bash
npm install
cp .env.example .env      # adjust secrets if you like; defaults work for local dev
npm run docker:up         # starts Postgres + Redis
npm run db:migrate        # applies the Prisma schema
npm run db:seed           # seeds all 15 sample challenges + 13 Learn write-ups
```

Build the live-challenge images (only needed once, or whenever their source changes):

```bash
docker build -t crackthelab/sqli-101:latest challenges/sqli-101
docker build -t crackthelab/idor-much:latest challenges/idor-much
docker build -t crackthelab/broken-auth:latest challenges/broken-auth
docker build -t crackthelab/cross-origin-chaos:latest challenges/cross-origin-chaos
```

## Running

```bash
npm run dev
```

This starts `apps/api` on `:4000`, `apps/web` on `:5173`, and `apps/orchestrator` on `:4100`. Open
http://localhost:5173, register an account, and:

- Visit **Learn** first for short write-ups on each technique (SQL injection, IDOR, JWT attacks,
  classical/Vigenère/XOR ciphers, RSA factoring, metadata & encoding forensics, log analysis, CORS
  misconfiguration, recon basics, TLS) — each links straight to the challenge that lets you try it.
- Solve the static challenges — **Caesar's Secret**, **Base Instincts**, **XOR Marks the Spot**,
  **Small Factors**, **Key of Hearts** (crypto), **Hidden in Plain Sight**, **Null Byte Noise**,
  **Binary Whispers**, **Needle in the Access Log** (forensics), **View Source**,
  **Know Your Protocols** (misc) — by submitting the decoded flag.
- Open **SQLi 101**, click "Start instance", then visit the returned URL and try a classic
  injection in the login form's username field (e.g. `admin' --`) to get the flag.
- Open **IDOR Much?**, start an instance, log in with the demo account shown on the page
  (`guest` / `guest123`), then change the profile ID in the URL to view another user's flag.
- Open **Broken Auth**, start an instance, log in with the demo account (`guest` / `guest123`),
  then forge a JWT with `alg: "none"` and `role: "admin"` and send it to `/admin` to get the flag.
- Open **Cross Origin Chaos**, start an instance, log in with the demo account via curl, then
  replay the request to `/api/secret` with a spoofed `Origin` header and see it get reflected back
  alongside `Access-Control-Allow-Credentials: true`.
- Watch the leaderboard update in real time as flags are submitted, and track your level/XP as you
  solve more challenges.

Live instances auto-expire after `INSTANCE_TTL_MINUTES` (default 45 min); you can also stop one
early from the challenge page.

## Tests

```bash
npm run test --workspace=apps/api
```

Runs API integration tests (auth + flag submission) against the local Postgres instance started by
`docker compose` — make sure it's up and migrated first.
