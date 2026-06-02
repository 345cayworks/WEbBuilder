# Cayworks WebBuilder Workspace

An internal workspace for **NB Solutions / Cayworks** that turns client website
briefs into ready-to-build static website packages.

When a client submits a brief, the workspace organises the submission, generates
a clean website plan and copy, prepares page content, manages assets, and
produces a **Website Build Package** + a **Claude/Codex build prompt** that can
be reviewed, edited, approved, and handed to a developer or AI to build the
actual site.

> Public service it supports: **https://websites.cayworks.com/** — fast,
> affordable 3‑page websites from **$250/year**, personalised domain add‑on from
> **$50**. Cayman Islands based · info@cayworks.com · 345 324 9000 · checkout via
> Fygaro.

---

## ✨ What it does

- **Capture** client website briefs with a validated intake form.
- **Convert** each brief into a structured website production project.
- **Generate** (offline, no API key required):
  client summary, target audience, objective, brand tone & direction, colour
  palette, recommended site structure, page‑by‑page copy, CTAs, SEO title + meta
  per page, hero headline/subheadline/button text, contact + footer text, image
  placement notes, design direction, and a developer handoff prompt.
- **Review & edit** every piece of generated material inline.
- **Track status** across the full lifecycle (8 states).
- **Manage** assets, notes, client approval, payments, domain & hosting.
- **Export** everything as Markdown or JSON, copy the **Claude Build Prompt**,
  and download the **Website Build Package** (sections A–M).
- **Configure** company defaults, analytics placeholders, integrations and
  security from a SuperAdmin Settings page.

---

## 🧱 Tech stack

| Layer        | Choice                                             |
|--------------|----------------------------------------------------|
| Framework    | React 18 + Vite 5 + TypeScript                     |
| Styling      | Tailwind CSS 3                                      |
| Routing      | React Router 6                                      |
| Icons        | lucide-react                                        |
| Data (MVP)   | Repository abstraction over **localStorage**       |
| Data (prod)  | **Supabase / Postgres** (schema included)          |
| Deploy       | **Netlify** (`netlify.toml` included)              |

The MVP runs with **zero backend setup** — open it and the Caytech Global sample
project is already there. The data layer (`src/lib/storage.ts`) is a small
interface so it can be swapped for Supabase without touching the UI.

---

## 🚀 Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + production build to /dist
npm run preview      # serve the production build
npm run typecheck    # tsc --noEmit
npm run test:smoke   # runs the generation pipeline against the Caytech brief
```

### Demo login

The MVP uses passwordless demo login backed by local storage. On the login
screen, click one of the seeded accounts:

| Email                 | Role        |
|-----------------------|-------------|
| `info@cayworks.com`   | Super Admin |
| `admin@cayworks.com`  | Admin       |
| `editor@cayworks.com` | Editor      |

The **SuperAdmin** account additionally requires the `SUPERADMIN_MASTER_KEY`
**if one is configured** in Settings. Out of the box no key is set, so you can
sign in to bootstrap, then set a key in **SuperAdmin Settings → Security**.

> In production, replace this with Supabase Auth / Netlify Identity and keep the
> master key server‑side (see **Security**).

---

## 🗂️ Project structure

```
.
├── index.html
├── netlify.toml                 # Netlify build + SPA redirect + headers
├── .env.example                 # all env vars (VITE_ = public, rest = secret)
├── supabase/migrations/
│   └── 0001_init.sql            # full production schema + RLS scaffold
├── scripts/smoke.ts             # generation pipeline smoke test
├── docs/
│   ├── ARCHITECTURE.md
│   └── TESTING_CHECKLIST.md
└── src/
    ├── types/index.ts           # all domain types (the data model)
    ├── lib/
    │   ├── constants.ts         # statuses, roles+permissions, colours, defaults
    │   ├── storage.ts           # KeyValueStore abstraction (localStorage)
    │   ├── projectFactory.ts    # submission -> project + assets + history
    │   ├── seed.ts              # sample data (Caytech Global + 3 more)
    │   ├── download.ts          # clipboard + file download helpers
    │   └── generation/
    │       ├── generateContent.ts   # brief -> copy / SEO / brand / pages
    │       ├── handoffPrompt.ts     # developer/Claude build prompt
    │       ├── buildPackage.ts      # Website Build Package (Markdown + JSON)
    │       └── text.ts              # NLP-ish text helpers
    ├── context/
    │   ├── SettingsContext.tsx
    │   ├── DataContext.tsx      # central store + all CRUD/workflow actions
    │   └── AuthContext.tsx      # roles + permission gating
    ├── components/
    │   ├── ui/                  # Button, Card, Field, Tabs, Modal, TagInput…
    │   ├── layout/             # Sidebar, Topbar, AppLayout, route guards
    │   └── workspace/          # one component per workspace tab
    └── pages/
        ├── LoginPage.tsx
        ├── DashboardPage.tsx
        ├── IntakePage.tsx
        ├── ProjectWorkspacePage.tsx
        ├── SettingsPage.tsx
        └── NotFoundPage.tsx
```

---

## 🧠 The generation workflow

`src/lib/generation/generateContent.ts` is a **deterministic, brief‑aware**
engine. It analyses the brief's goal, style, industry, services, colours and
inspiration to produce agency‑quality output — with **no external API calls**,
so the workspace works offline and out of the box.

Business rules implemented:

- Default pages are **Home**, **Services or About**, **Contact**.
- If the client selected Home/About/Contact, those pages are generated.
- If services are listed but there is **no dedicated Services page**, the **Home**
  page introduces the services and the **About** page includes a services
  preview.
- Home and a Contact path are always ensured.
- Goal drives the CTAs (e.g. *"Get calls / inquiries"* → **Call Now** /
  **Request a Quote**); style drives tone & layout; brand colour names map to a
  hex palette (primary/secondary/accent + neutrals).

### Swapping in a real LLM

The engine returns a typed `GenerationResult` (`content`, `pages`, `seo`). To use
a real model, implement an async function with the same return shape (call your
LLM, map the JSON response into these types) and call it from
`DataContext.generateForProject`. Nothing else in the app needs to change.

---

## 🧭 The client workspace (per project)

Eleven tabs: **Overview · Brief · Brand Direction · Generated Copy · Pages ·
Assets · SEO · Design Notes · Deployment · Client Approval · Developer Handoff.**

Key actions: **Generate / Regenerate content**, inline editing everywhere,
**status changer**, **Mark approved**, **Mark live**, **Copy Claude Build
Prompt**, **Download Website Package** (Markdown/JSON), notes & revision
requests, deployment checklist, and payment/domain/hosting tracking.

### Website Build Package (sections A–M)

`A` Client Info · `B` Business Summary · `C` Brand Direction · `D` Site Map ·
`E` Page Copy · `F` SEO Metadata · `G` Assets · `H` Contact Info ·
`I` Domain Info · `J` Design Inspiration · `K` Required Features ·
`L` Deployment Checklist · `M` Claude/Codex Build Prompt.

---

## 🔐 Security & roles

Four roles with a permission matrix (`src/lib/constants.ts → roleCan`):

| Permission        | SuperAdmin | Admin | Editor | Viewer |
|-------------------|:---------:|:-----:|:------:|:------:|
| View              | ✅ | ✅ | ✅ | ✅ |
| Edit content      | ✅ | ✅ | ✅ | — |
| Change status     | ✅ | ✅ | ✅ | — |
| Manage payments   | ✅ | ✅ | — | — |
| Manage settings   | ✅ | ✅ | — | — |
| Reveal master key | ✅ | — | — | — |
| Delete            | ✅ | ✅ | — | — |

- Protected routes via `RequireAuth` / `RequirePermission`.
- The **master key is never read from a `VITE_` variable** and is never shown to
  non‑SuperAdmins.
- **Production hardening:** move secrets (`SUPERADMIN_MASTER_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`) into Netlify env vars / serverless functions,
  enable Supabase **RLS**, and use real auth. The in‑browser storage used by the
  MVP is for internal/local convenience only.

---

## ⚙️ Environment variables

See `.env.example`. **`VITE_`‑prefixed values are bundled into the frontend** —
only put non‑secret config there.

| Variable | Public? | Purpose |
|----------|:------:|---------|
| `VITE_COMPANY_NAME`, `VITE_PUBLIC_SERVICE_URL` | ✅ | Branding |
| `VITE_DEFAULT_CONTACT_EMAIL`, `VITE_DEFAULT_PHONE` | ✅ | Default contact |
| `VITE_BASE_PACKAGE_PRICE`, `VITE_DOMAIN_ADDON_PRICE` | ✅ | Pricing defaults |
| `VITE_GOOGLE_TRACKING_ID`, `VITE_META_PIXEL_ID` | ✅ | Analytics placeholders |
| `VITE_ADS_ENGINE_URL` | ✅ | Cayworks Ads Engine hook |
| `VITE_SUPER_ADMIN_EMAIL` | ✅ | Identifies the SuperAdmin account |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | ✅* | Supabase (use with RLS) |
| `SUPER_ADMIN_EMAIL`, `SUPERADMIN_MASTER_KEY` | ❌ | **Server‑only** secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | **Server‑only** secret |

Settings entered in **SuperAdmin Settings** override env defaults at runtime.

---

## 🐘 Moving to Supabase (production)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`).
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Implement a Supabase adapter that satisfies the `KeyValueStore`‑style contract
   (or a per‑table repository) and point `DataContext` at it.
5. Add RLS policies (the migration enables RLS and includes an example policy).
6. Lock down `system_settings.superadmin_master_key` to the service role.

The table names already match `KEYS.tables` in `src/lib/storage.ts`.

---

## ☁️ Deploy to Netlify

`netlify.toml` is included (build `npm run build`, publish `dist`, SPA redirect,
security headers).

**Option A — Git (recommended)**
1. Push this repo to GitHub.
2. Netlify → *Add new site → Import from Git* → pick the repo.
3. Build command `npm run build`, publish directory `dist` (auto‑detected).
4. Add env vars (Site settings → Environment variables) from `.env.example`.
5. Deploy.

**Option B — CLI**
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

> The websites you *generate* are separate static sites. The Developer Handoff
> tab's prompt already includes Netlify‑ready instructions (Netlify Forms,
> redirects, analytics placeholders) for those builds.

---

## ✅ Testing

See **`docs/TESTING_CHECKLIST.md`**. Quick automated check:

```bash
npm run test:smoke   # asserts the Caytech brief generates correct copy/SEO/pages/package
```

---

## 🔮 Future enhancements

- Real auth (Supabase Auth / Netlify Identity) + per‑user audit attribution.
- Pluggable LLM generation (Claude) behind the existing `GenerationResult` type,
  with prompt caching.
- File uploads to Supabase Storage (instead of pasted URLs).
- Email the build package / approval link to clients; Fygaro webhook to auto‑mark
  paid.
- One‑click deploy of the generated site via the Netlify API.
- Cayworks Ads Engine two‑way integration (campaign creation from a live site).
- Live preview/screenshot of inspiration sites; richer design tokens export.

---

Built for NB Solutions / Cayworks. Internal use.
