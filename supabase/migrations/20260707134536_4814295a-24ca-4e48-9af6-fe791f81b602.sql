
DROP POLICY IF EXISTS "Read logos" ON storage.objects;
CREATE POLICY "Read logos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'logos');

DROP POLICY IF EXISTS "Users upload own logo" ON storage.objects;
CREATE POLICY "Users upload own logo" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users update own logo" ON storage.objects;
CREATE POLICY "Users update own logo" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users delete own logo" ON storage.objects;
CREATE POLICY "Users delete own logo" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = auth.uid()::text);
