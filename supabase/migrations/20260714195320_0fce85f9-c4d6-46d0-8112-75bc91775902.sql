
CREATE TABLE public.meta_ads_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  meta_user_id text,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  selected_ad_account_id text,
  selected_ad_account_name text,
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meta_ads_connections TO authenticated;
GRANT ALL ON public.meta_ads_connections TO service_role;

ALTER TABLE public.meta_ads_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own meta connection"
  ON public.meta_ads_connections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER meta_ads_connections_set_updated_at
  BEFORE UPDATE ON public.meta_ads_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
