-- ============================================================================
-- Cayworks WebBuilder Workspace — Supabase / Postgres schema
-- ----------------------------------------------------------------------------
-- Production data layer. The MVP runs on localStorage; to move to Supabase,
-- run this migration, set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, and
-- implement the Supabase adapter behind src/lib/storage.ts (see README).
--
-- Arrays / nested structures are stored as JSONB to mirror the TypeScript types
-- in src/types/index.ts exactly.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---- Enums -----------------------------------------------------------------
do $$ begin
  create type user_role as enum ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'VIEWER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum (
    'new_submission', 'in_review', 'content_generated', 'awaiting_client_approval',
    'approved', 'in_build', 'live', 'needs_revision'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'partial', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type domain_status as enum ('not_needed', 'needed', 'registered', 'connected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hosting_status as enum ('not_started', 'provisioning', 'active');
exception when duplicate_object then null; end $$;

-- ---- Roles lookup (human-readable labels) ----------------------------------
create table if not exists roles (
  key          user_role primary key,
  label        text not null,
  description  text
);
insert into roles (key, label, description) values
  ('SUPER_ADMIN', 'Super Admin', 'Full access incl. settings and master key'),
  ('ADMIN',       'Admin',       'Manage projects, payments and settings'),
  ('EDITOR',      'Editor',      'Edit content and change status'),
  ('VIEWER',      'Viewer',      'Read-only access')
on conflict (key) do nothing;

-- ---- Users -----------------------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text not null,
  role        user_role not null default 'VIEWER',
  created_at  timestamptz not null default now()
);

-- ---- Client submissions (the intake brief) ---------------------------------
create table if not exists client_submissions (
  id                    uuid primary key default gen_random_uuid(),
  client_name           text not null,
  business_name         text not null,
  email                 text not null,
  phone                 text,
  location              text,
  business_description  text,
  industry              text,
  has_domain            boolean not null default false,
  domain                text,
  pages                 jsonb not null default '[]',          -- string[]
  main_goal             text,
  style_preference      text,
  brand_colors          jsonb not null default '[]',          -- string[]
  inspiration_sites     jsonb not null default '[]',          -- string[]
  services              jsonb not null default '[]',          -- string[]
  logo_status           text,
  contact_phone         text,
  contact_email         text,
  logo_url              text,
  image_urls            jsonb not null default '[]',          -- string[]
  social_links          jsonb not null default '[]',          -- {label,url}[]
  timeline              text,
  notes                 text,
  submitted_at          timestamptz not null default now()
);

-- ---- Projects --------------------------------------------------------------
create table if not exists projects (
  id                      uuid primary key default gen_random_uuid(),
  submission_id           uuid not null references client_submissions(id) on delete cascade,
  business_name           text not null,
  industry                text,
  timeline                text,
  status                  project_status not null default 'new_submission',
  assigned_to             text,
  due_date                date,
  launch_date             date,
  package_selected        text not null default '3-Page Static Website',
  package_price           numeric(10,2) not null default 250,
  domain_add_on_required  boolean not null default false,
  domain_add_on_price     numeric(10,2) not null default 0,
  total_quoted            numeric(10,2) not null default 250,
  paid                    boolean not null default false,
  payment_status          payment_status not null default 'unpaid',
  payment_reference       text,
  fygaro_reference        text,
  domain_status           domain_status not null default 'needed',
  hosting_status          hosting_status not null default 'not_started',
  client_approved         boolean not null default false,
  client_approval_note    text,
  approved_at             timestamptz,
  live_url                text,
  checklist               jsonb not null default '[]',        -- {id,label,done}[]
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists projects_status_idx on projects(status);
create index if not exists projects_submission_idx on projects(submission_id);

-- ---- Generated content -----------------------------------------------------
create table if not exists generated_content (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references projects(id) on delete cascade,
  business_summary      text,
  target_audience       text,
  website_objective     text,
  brand_tone            text,
  brand_direction       text,
  visual_direction      text,
  color_palette         jsonb not null default '[]',          -- {name,hex,role}[]
  recommended_structure jsonb not null default '[]',          -- {page,purpose}[]
  hero_headline         text,
  hero_subheadline      text,
  primary_cta           text,
  secondary_cta         text,
  cta_recommendations   jsonb not null default '[]',          -- string[]
  contact_section_text  text,
  footer_content        text,
  image_placement       jsonb not null default '[]',          -- string[]
  design_notes          text,
  inspiration_summary   text,
  edited                boolean not null default false,
  generated_at          timestamptz not null default now(),
  unique (project_id)
);

-- ---- Project pages ---------------------------------------------------------
create table if not exists project_pages (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  slug        text not null,
  title       text not null,
  "order"     int not null default 0,
  sections    jsonb not null default '[]',                    -- {heading,body}[]
  unique (project_id, slug)
);

-- ---- SEO metadata ----------------------------------------------------------
create table if not exists seo_metadata (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  page_slug    text not null,
  page_title   text,
  title        text,
  description  text,
  keywords     jsonb not null default '[]',                   -- string[]
  unique (project_id, page_slug)
);

-- ---- Project assets --------------------------------------------------------
create table if not exists project_assets (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  type        text not null check (type in ('logo','image','document','link')),
  label       text not null,
  url         text not null,
  usage_note  text
);

-- ---- Project notes ---------------------------------------------------------
create table if not exists project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  author      text not null,
  type        text not null check (type in ('internal','client_revision')),
  body        text not null,
  created_at  timestamptz not null default now()
);

-- ---- Status history --------------------------------------------------------
create table if not exists project_status_history (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  from_status   project_status,
  to_status     project_status not null,
  changed_by    text not null,
  note          text,
  changed_at    timestamptz not null default now()
);

-- ---- Payment records -------------------------------------------------------
create table if not exists payment_records (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  amount      numeric(10,2) not null,
  type        text not null check (type in ('package','domain','other')),
  reference   text,
  method      text,
  paid_at     timestamptz
);

-- ---- System settings (single row) ------------------------------------------
create table if not exists system_settings (
  id                            int primary key default 1 check (id = 1),
  company_name                  text,
  public_service_url            text,
  default_contact_email         text,
  default_phone                 text,
  default_base_package_price    numeric(10,2) default 250,
  default_domain_add_on_price   numeric(10,2) default 50,
  google_tracking_id            text,
  meta_pixel_id                 text,
  super_admin_email             text,
  -- NOTE: never expose the master key to the client. Prefer storing it only as
  -- a server-side env var. This column exists for self-hosted setups; protect
  -- it with RLS so only the service role can read it.
  superadmin_master_key         text,
  cayworks_ads_engine_url       text,
  default_footer_branding       text,
  default_deployment_platform   text,
  default_checklist_items       jsonb not null default '[]',  -- string[]
  updated_at                    timestamptz not null default now()
);

-- ---- Audit log -------------------------------------------------------------
create table if not exists audit_logs (
  id      uuid primary key default gen_random_uuid(),
  actor   text not null,
  action  text not null,
  target  text,
  meta    jsonb,
  at      timestamptz not null default now()
);
create index if not exists audit_logs_at_idx on audit_logs(at desc);

-- ---- updated_at trigger ----------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists projects_updated_at on projects;
create trigger projects_updated_at before update on projects
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Enable RLS on every table. Define policies that match your auth model (e.g.
-- authenticated staff can read/write project data; only the service role can
-- read system_settings.superadmin_master_key). Start strict, then open up.
-- ============================================================================
alter table users                  enable row level security;
alter table client_submissions     enable row level security;
alter table projects               enable row level security;
alter table generated_content      enable row level security;
alter table project_pages          enable row level security;
alter table seo_metadata           enable row level security;
alter table project_assets         enable row level security;
alter table project_notes          enable row level security;
alter table project_status_history enable row level security;
alter table payment_records        enable row level security;
alter table system_settings        enable row level security;
alter table audit_logs             enable row level security;

-- Example policy (adjust to your needs): authenticated users can do everything
-- with project data. Lock down system_settings separately.
-- create policy "staff full access" on projects
--   for all to authenticated using (true) with check (true);
