# Sing Sub

A GitOps-based multi-environment configuration distribution console for [sing-box](https://sing-box.sagernet.org/). Manage sing-box profiles through a web UI, store configurations in a private GitHub repo, and distribute subscription links via Cloudflare Workers.

## Features

- **Server-side security** — GitHub PAT is stored in Cloudflare KV, never exposed to the browser. Sessions use httpOnly cookies.
- **GitOps workflow** — Configurations are committed to GitHub, triggering Actions to build and publish to Gist.
- **Subscription proxy** — Worker proxies Gist content at `/sub/{gistId}/{name}.json` with User-Agent filtering (sing-box clients only).
- **Multi-profile** — Manage multiple environments (e.g. `home`, `office`, `travel`) with independent inbound/outbound rules and templates.
- **Auto-deploy** — Push to `main` triggers GitHub Actions to build and deploy to Cloudflare Workers automatically.

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Cloudflare Workers + KV
- **CI/CD**: GitHub Actions

## Prerequisites

1. A **private GitHub repo** with the following structure:

   ```
   your-private-repo/
   ├── rules.json              # Managed by this UI (auto-created on first save)
   ├── templates/
   │   └── default.json        # sing-box config template (JSON format)
   ├── inbounds/
   │   └── home.json           # Inbound node definitions
   ├── outbounds/
   │   └── nodes.json          # Outbound node definitions
   └── .github/workflows/
       └── build.yml           # Action that builds final configs and publishes to Gist
   ```

   - **Template**: A sing-box JSON config with placeholder sections for inbounds/outbounds injection.
   - **Inbounds/Outbounds**: JSON files containing arrays of sing-box inbound/outbound objects.

2. A **GitHub Personal Access Token (PAT)** with these permissions:
   - `repo` (full access to private repos)
   - `gist` (read/write Gists)
   - `workflow` (trigger Actions)

   Create one at: https://github.com/settings/tokens

3. A **GitHub Gist** to host the generated subscription files.
   - Create a Gist at https://gist.github.com (content doesn't matter, it will be overwritten)
   - Copy the Gist ID from the URL: `https://gist.github.com/username/{gist_id}`

4. A **Cloudflare account** (free plan is sufficient).

## Deployment

### 1. Create KV Namespace

- Cloudflare Dashboard → Storage & Databases → KV → Create a namespace
- Name: `sb-node-ui-SESSIONS`
- Copy the Namespace ID and paste it into `wrangler.toml`

### 2. Set GitHub Secrets

- Go to your **sb-node-ui** repo → Settings → Secrets → Actions
- Add `CLOUDFLARE_API_TOKEN`:
  - Create at https://dash.cloudflare.com/profile/api-tokens
  - Use the "Edit Cloudflare Workers" template

### 3. Push to Deploy

```bash
git push origin main
```

GitHub Actions will automatically build and deploy to Cloudflare Workers.

### 4. Custom Domain (Optional)

- Workers & Pages → sb-node-ui → Settings → Domains & Routes → Add Custom Domain

## Usage

1. Open your Worker URL
2. Enter your GitHub owner, repo name, PAT, and Gist ID → Connect
3. Add/edit profiles — each profile specifies a template URL, inbounds/outbounds paths, and filtering rules
4. Save → triggers a commit to `rules.json` and a GitHub Actions build
5. Copy the subscription link for each profile → paste into sing-box client

Subscription URL format: `https://your-domain/sub/{gistId}/{profile_name}.json`

## License

MIT
