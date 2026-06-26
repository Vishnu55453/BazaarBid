# Running Frontend Portals — BazaarBid

This document describes how to run all frontend portals (main-site, buyer, seller, retail) concurrently, why we use `concurrently`, the exact script used, and the dedicated ports assigned for each portal.

---

## Overview

We have four separate Vite + React portals under `frontend/`:

- `main-site` — public landing site
- `buyer-portal` — normal buyer SPA
- `seller-portal` — seller management SPA
- `retail-portal` — retail/bulk buyer SPA

Each portal is a standalone Vite project with its own `package.json` and local `node_modules`.

---

## Dedicated Ports

To run all portals at the same time without port conflicts, we assigned fixed ports:

- Buyer Portal: `http://localhost:5173`
- Seller Portal: `http://localhost:5174`
- Retail Portal: `http://localhost:5175`
- Main Site: `http://localhost:5176`
- Admin Portal: `http://localhost:5177`
- Delivery Portal: `http://localhost:5178`

These are set by updating each portal's `dev` script to pass `--port <port>` to Vite.

---

## Why use `concurrently`?

`concurrently` is a small npm utility that runs multiple commands in parallel in a single terminal. We use it for the following reasons:

- Starts all portals with one command (`npm run dev` at `frontend/`) so developers don't need multiple terminals.
- Keeps each portal's processes separate (each portal still uses its local `node_modules`).
- Adds helpful prefixes and colors to identify output from each service in the same terminal.

Alternatives include `npm-run-all`, npm workspaces + separate terminals, or using a process manager; `concurrently` is simple and cross-platform for local development.

---

## Root `frontend/package.json` (dev script)

We created a small `package.json` in `frontend/` that defines a `dev` script which starts each portal using `npm --prefix` so each portal uses its own dependencies. The script we used is:

concurrently "npm --prefix ./buyer-portal run dev" "npm --prefix ./main-site run dev" "npm --prefix ./seller-portal run dev" "npm --prefix ./retail-portal run dev" --names "buyer,main,seller,retail" --prefix-colors "bgBlue.bold,bgGreen.bold,bgYellow.bold,bgMagenta.bold"

Notes on this string:
- `npm --prefix ./<folder> run dev` runs the `dev` script defined in that folder's `package.json` without changing the current working directory.
- `--names` gives short labels to each process in the terminal output.
- `--prefix-colors` colors the labels to make logs easier to scan. These two options are optional.

---

## How to install and run (PowerShell)

1) From the `frontend` folder, install the root dev dependency (`concurrently`):

```powershell
cd C:\BazaarBid\frontend
npm install
```

This installs `concurrently` because it is declared in `frontend/package.json`.

2) Install dependencies for each portal (run once per portal):

```powershell
npm --prefix .\buyer-portal install
npm --prefix .\main-site install
npm --prefix .\seller-portal install
npm --prefix .\retail-portal install
```

3) Start all portals together (from `frontend`):

```powershell
cd C:\BazaarBid\frontend
npm run dev
```

You should see four colored process logs and the portals available at the assigned ports.

---

## Troubleshooting & Tips

- If a port is already in use, change the port in the portal's `package.json` `dev` script (e.g. `vite --port 5180`) and update this document accordingly.
- If you prefer a single-install workflow, we can convert the repo to use npm workspaces or `pnpm` workspaces so a single `npm install` at repo root installs everything.
- Editor lint errors complaining about `@tailwind` are normal until you run the build tooling (PostCSS + Tailwind) and are not runtime errors.

---

## Reference: portal `dev` scripts used

- `buyer-portal/package.json` scripts.dev: `vite --port 5173`
- `seller-portal/package.json` scripts.dev: `vite --port 5174`
- `retail-portal/package.json` scripts.dev: `vite --port 5175`
- `main-site/package.json` scripts.dev: `vite --port 5176`

---

If you want, I can:

- Convert to npm workspaces and update root `package.json` so a single `npm install` handles all packages.
- Remove colors/prefix options in the concurrently command if your terminal doesn't render them nicely.
- Start the servers here and report logs (if allowed to run commands).

