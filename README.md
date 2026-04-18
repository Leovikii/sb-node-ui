# Sing Sub

Edge-based multi-environment configuration distribution console for [sing-box](https://sing-box.sagernet.org/). Manage sing-box profiles through a web UI, store configurations in a private GitHub repo, and distribute subscription links via Cloudflare Workers.

## Features

- **Zero Trust auth** — Cloudflare Access protects the management UI. No passwords or cookies to manage.
- **Server-side security** — GitHub PAT stored in Cloudflare KV, never exposed to the browser.
- **Edge config building** — Worker fetches templates and nodes from GitHub, merges them on the fly, and caches in KV. No GitHub Actions or Gist needed.
- **Subscription distribution** — `/sub/{token}/{name}.json` with User-Agent filtering (sing-box clients only).
- **Multi-profile** — Manage multiple environments (e.g. `home`, `office`, `travel`) with independent inbound/outbound rules and templates.
- **Auto-deploy** — Push to `main` triggers GitHub Actions to deploy the Worker automatically.

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Cloudflare Workers + KV
- **Auth**: Cloudflare Zero Trust (Access)
- **CI/CD**: GitHub Actions (deploy only)

## Prerequisites

1. A **private GitHub repo** with your sing-box data:

   ```
   your-private-repo/
   ├── sing-sub/
   │   └── rules.json          # Managed by this UI (auto-created on first save)
   ├── outbounds.json           # Outbound node definitions
   └── inbounds.json            # Inbound node definitions (optional)
   ```

   Templates can be hosted anywhere as public URLs (e.g. raw GitHub links).

2. A **GitHub Personal Access Token (PAT)** with `repo` permission (read/write private repos).

   Create one at: https://github.com/settings/tokens

3. A **Cloudflare account** with a custom domain.

## Deployment

### 1. Create KV Namespace

- Cloudflare Dashboard → Storage & Databases → KV → Create a namespace
- Copy the Namespace ID and update `wrangler.toml`

### 2. Configure Zero Trust

Create two Access Applications in Cloudflare Zero Trust dashboard:

**Application 1 — Protect management UI:**
- Type: Self-hosted
- Domain: `your-domain.com`
- Policy: Allow, selector = Emails, value = your email

**Application 2 — Bypass subscription endpoint:**
- Type: Self-hosted
- Domain: `your-domain.com`, Path: `sub`
- Policy: Bypass, selector = Everyone

### 3. Set GitHub Secrets

- Go to your repo → Settings → Secrets → Actions
- Add `CLOUDFLARE_API_TOKEN` (use the "Edit Cloudflare Workers" template)

### 4. Push to Deploy

```bash
git push origin main
```

## Usage

1. Open your domain → Cloudflare Access login (email verification)
2. First visit: configure GitHub repo, PAT, and custom subscription token
3. Add/edit profiles — each profile specifies a template URL, node file paths, and filtering rules
4. Save → commits `sing-sub/rules.json` to GitHub and builds all configs on the edge
5. Copy the subscription link → paste into sing-box client

Subscription URL format: `https://your-domain/sub/{token}/{profile_name}.json`

## License

MIT
