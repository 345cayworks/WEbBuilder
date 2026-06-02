# Architecture

## Layers

```
 UI (pages + components)
        │  hooks: useData / useSettings / useAuth
 Context layer (state + actions)
   ├── SettingsContext   → SystemSettings (localStorage)
   ├── DataContext       → Dataset + all CRUD / workflow actions (localStorage)
   └── AuthContext       → current user, roles, permission gating
        │
 Domain logic (pure, framework-free)
   ├── lib/generation/*  → brief → content / pages / SEO / prompt / package
   ├── lib/projectFactory→ submission → project + assets + history
   └── lib/seed          → sample dataset
        │
 Storage abstraction (lib/storage.ts: KeyValueStore)
        │
 localStorage (MVP)   ⇄   Supabase/Postgres (production, schema provided)
```

**Why this shape**

- The **domain logic is pure** and has no React/DOM dependencies, so it is unit
  testable (`npm run test:smoke`) and portable to a serverless function or a
  real LLM wrapper later.
- The **storage abstraction** means the MVP runs with zero backend, but the
  exact same UI can be backed by Supabase by implementing one adapter.
- **One central `DataContext`** owns the whole `Dataset` and persists on every
  mutation. For an internal tool with modest data volume this is simpler and
  less bug-prone than many small stores, and keeps actions (status changes,
  generation, payments, audit) in one auditable place.

## Data flow: a brief becomes a build package

1. **Intake** (`IntakePage`) → `createSubmission()` builds a `ClientSubmission`,
   then `projectFactory` derives a `Project` (+ assets from logo/images, + a
   status-history entry). Status starts at `new_submission`.
2. **Generate** (`generateForProject`) → `generateProjectContent()` returns
   `GeneratedContent`, `ProjectPage[]`, `SeoMetadata[]`; status advances to
   `content_generated`.
3. **Review/edit** → tab components patch content/pages/SEO via `DataContext`.
4. **Approve / build / launch** → `setStatus`, `markApproved`, `markLive`.
5. **Handoff** → `buildHandoffPrompt()` + `buildPackageMarkdown()/Json()` produce
   the copy-paste prompt and downloadable package.

## Key decisions & assumptions (Phase 1)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data store for MVP | localStorage behind an interface | Runs instantly, no infra; clean upgrade path to Supabase |
| AI generation | Deterministic, brief-aware engine | Works offline/free; pluggable to a real LLM behind one type |
| Auth for MVP | Passwordless, role-based, local | Demonstrates roles/permissions without a backend; documented to replace |
| One submission ↔ one project | Auto-create project on intake | Matches "turn each brief into a project"; simplest mental model |
| Master key | Stored in settings, never in `VITE_`, gated reveal | Honours "don't expose master keys on the frontend" for the MVP; production moves it server-side |
| Currency | USD, whole dollars | Matches the $250 / $50 pricing in the brief |

**Open questions left as sensible defaults** (easy to change in Settings/code):

- Exact role→permission boundaries (current matrix in `constants.ts`).
- Whether multiple projects per client are needed (currently 1:1).
- Real payment reconciliation vs. manual status (manual + optional payment
  records now; Fygaro webhook is a future enhancement).
- Whether inspiration sites should be fetched/screenshotted (currently
  summarised by domain only — deliberately, to avoid copying protected designs).
