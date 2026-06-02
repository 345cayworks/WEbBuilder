# Testing checklist

## Automated

```bash
npm run typecheck     # no TypeScript errors
npm run build         # production build succeeds
npm run test:smoke    # generation pipeline asserts pass (Caytech brief)
```

`test:smoke` verifies: 4 seeded projects, correct CTA from goal, Blue→#2563EB
palette mapping, Home/About/Contact ordering, services overview on Home, SEO
length limits, and a well-formed build prompt + A–M package.

## Manual — auth & access

- [ ] Visiting any route while signed out redirects to `/login`.
- [ ] Sign in as **Editor** → no "SuperAdmin Settings" link; `/settings` shows a
      no-access state.
- [ ] Sign in as **Viewer** → content fields are read-only; no status changer.
- [ ] Sign in as **SuperAdmin** (`info@cayworks.com`) → Settings visible; master
      key reveal works.
- [ ] Set a master key in Settings → sign out → SuperAdmin sign-in now requires it.

## Manual — dashboard

- [ ] Stats show Total / New / In progress / Awaiting approval / Live counts.
- [ ] Clicking the **New**, **Awaiting approval**, **Live** stat filters the table.
- [ ] Search by business name and by industry both work.
- [ ] Status / industry / timeline filters work and combine; **Clear** resets.
- [ ] Clicking a row opens the project workspace.

## Manual — intake

- [ ] Submitting empty form shows validation errors and scrolls to top.
- [ ] Invalid email is rejected (both client email and on-site email).
- [ ] "Has domain = Yes" requires a domain value.
- [ ] Page chips toggle; services/colours tag inputs add & remove.
- [ ] Add/remove inspiration URLs, image URLs and social links.
- [ ] **Prefill example** fills the Caytech brief; **Create project** navigates to
      the new workspace with `new_submission` status.

## Manual — workspace

- [ ] **Generate content** populates Brand, Copy, Pages, SEO, Design tabs and sets
      status to `content_generated`.
- [ ] Editing a copy field and clicking away persists (reload to confirm).
- [ ] **Regenerate** warns it overwrites edits; brief/notes/assets/payments survive.
- [ ] Pages: edit a section, add a section, remove a section, **Copy page**.
- [ ] Assets: existing logo + image show; add and remove an asset; edit usage note.
- [ ] SEO: char counters update; **Copy meta tags** works; keywords editable.
- [ ] Deployment: toggle checklist items; progress bar updates; add/remove item.
- [ ] Approval: add internal note + client revision note; **Mark approved** sets
      status and records sign-off; **Request revision** sets `needs_revision`.
- [ ] Overview: change assigned/due date/prices/payment status/domain/hosting and
      confirm Total quoted recomputes.
- [ ] **Mark live** modal sets status `live`, live URL, domain connected, hosting
      active.

## Manual — handoff & export

- [ ] **Copy Claude Build Prompt** (header + Handoff tab) copies the full prompt.
- [ ] **Download Markdown** / **Download JSON** download the build package.
- [ ] Package includes sections A–M and the embedded build prompt (M).
- [ ] Generated site instructions include responsive, accessibility, SEO, Netlify
      Forms and analytics placeholders.

## Manual — settings & data

- [ ] Editing a setting and **Save** persists (reload to confirm).
- [ ] Changing default pricing/checklist affects **new** projects.
- [ ] **Reset settings** restores defaults; **Reset demo data** rebuilds samples.

## Manual — responsiveness / a11y

- [ ] Usable at 360px (mobile sidebar drawer), 768px, 1280px.
- [ ] Keyboard: tab through forms; Escape closes modals; focus states visible.
