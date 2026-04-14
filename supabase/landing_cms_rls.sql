-- RLS policy: allow public (anon) read access to LANDING_* settings only
-- Run this in the Supabase SQL Editor after enabling RLS on settings table

-- Enable RLS if not already enabled
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop policy if it already exists (safe to re-run)
DROP POLICY IF EXISTS "Public read LANDING_ settings" ON settings;

-- Allow anyone to read settings whose key starts with LANDING_
CREATE POLICY "Public read LANDING_ settings"
ON settings
FOR SELECT
TO anon, authenticated
USING (key LIKE 'LANDING_%');
