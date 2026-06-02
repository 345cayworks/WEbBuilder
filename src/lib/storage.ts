// ============================================================================
// Storage abstraction
// ----------------------------------------------------------------------------
// The MVP persists to localStorage so the workspace runs with zero backend
// setup. The interface below is intentionally small so it can be swapped for a
// Supabase-backed adapter (see supabase/migrations + README) without touching
// the rest of the app.
// ============================================================================

export interface KeyValueStore {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const memory = new Map<string, string>();

const hasLocalStorage = (() => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const probe = "__cw_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
})();

export const STORAGE_PREFIX = "cw_wb_v1:";

export const localStore: KeyValueStore = {
  get<T>(key: string, fallback: T): T {
    const fullKey = STORAGE_PREFIX + key;
    try {
      const raw = hasLocalStorage
        ? window.localStorage.getItem(fullKey)
        : memory.get(fullKey) ?? null;
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    const fullKey = STORAGE_PREFIX + key;
    const raw = JSON.stringify(value);
    try {
      if (hasLocalStorage) window.localStorage.setItem(fullKey, raw);
      else memory.set(fullKey, raw);
    } catch {
      memory.set(fullKey, raw);
    }
  },
  remove(key: string): void {
    const fullKey = STORAGE_PREFIX + key;
    try {
      if (hasLocalStorage) window.localStorage.removeItem(fullKey);
      else memory.delete(fullKey);
    } catch {
      memory.delete(fullKey);
    }
  },
};

// Storage keys used by the data layer. The MVP persists the whole dataset as a
// single blob under `dataset`; the per-collection names map 1:1 to the Supabase
// tables in supabase/migrations and are kept here for reference / migration.
export const KEYS = {
  dataset: "dataset",
  settings: "system_settings",
  session: "session",
  seeded: "seeded_flag",
  // Supabase table names (used by the Supabase adapter, see README):
  tables: {
    submissions: "client_submissions",
    projects: "projects",
    content: "generated_content",
    pages: "project_pages",
    seo: "seo_metadata",
    assets: "project_assets",
    notes: "project_notes",
    history: "project_status_history",
    payments: "payment_records",
    settings: "system_settings",
    audit: "audit_logs",
    users: "users",
  },
} as const;
