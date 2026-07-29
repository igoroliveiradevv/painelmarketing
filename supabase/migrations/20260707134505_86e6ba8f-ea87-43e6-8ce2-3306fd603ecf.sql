
ALTER TABLE public.theme_settings
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS meta_ads_connected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meta_ads_account_id text;
