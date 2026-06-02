/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_PUBLIC_SERVICE_URL?: string;
  readonly VITE_DEFAULT_CONTACT_EMAIL?: string;
  readonly VITE_DEFAULT_PHONE?: string;
  readonly VITE_BASE_PACKAGE_PRICE?: string;
  readonly VITE_DOMAIN_ADDON_PRICE?: string;
  readonly VITE_ADS_ENGINE_URL?: string;
  readonly VITE_GOOGLE_TRACKING_ID?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_SUPER_ADMIN_EMAIL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
