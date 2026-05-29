-- Per-user RLS for tomato_clock_state
-- Run in Supabase SQL Editor or via CLI migration

ALTER TABLE public.tomato_clock_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own state" ON public.tomato_clock_state;
DROP POLICY IF EXISTS "Users can insert own state" ON public.tomato_clock_state;
DROP POLICY IF EXISTS "Users can update own state" ON public.tomato_clock_state;

CREATE POLICY "Users can read own state"
  ON public.tomato_clock_state
  FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

CREATE POLICY "Users can insert own state"
  ON public.tomato_clock_state
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid()::text);

CREATE POLICY "Users can update own state"
  ON public.tomato_clock_state
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);
