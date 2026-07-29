REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon;

CREATE POLICY "No user inserts on subscriptions" ON public.subscriptions
  FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No user updates on subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No user deletes on subscriptions" ON public.subscriptions
  FOR DELETE TO authenticated USING (false);