-- Trojborg-appen Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  area          TEXT NOT NULL,
  budget        TEXT NOT NULL,
  time          TEXT NOT NULL,
  description   TEXT NOT NULL,
  owner_name    TEXT NOT NULL,
  owner_email   TEXT NOT NULL DEFAULT '',
  owner_phone   TEXT NOT NULL DEFAULT '',
  contact       TEXT NOT NULL DEFAULT 'Kontakt aftales efter accept',
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bids (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  bidder_name   TEXT NOT NULL,
  offer         TEXT NOT NULL,
  message       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast task lookup
CREATE INDEX IF NOT EXISTS idx_bids_task_id ON bids(task_id);
-- Index for filtering out soft-deleted tasks
CREATE INDEX IF NOT EXISTS idx_tasks_not_deleted ON tasks(is_deleted) WHERE is_deleted = FALSE;

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids  ENABLE ROW LEVEL SECURITY;

-- Tasks: anyone can read non-deleted tasks
CREATE POLICY "Public read tasks"
  ON tasks FOR SELECT
  USING (is_deleted = FALSE);

-- Tasks: anyone can insert
CREATE POLICY "Public insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (TRUE);

-- Tasks: only owner or admin can soft-delete (update is_deleted)
CREATE POLICY "Owner or admin soft-delete tasks"
  ON tasks FOR UPDATE
  USING (
    owner_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR owner_email = current_setting('app.current_user_email', true)
    OR current_setting('app.current_user_email', true) = 'jensenhp79@gmail.com'
  )
  WITH CHECK (TRUE);

-- Bids: anyone can read
CREATE POLICY "Public read bids"
  ON bids FOR SELECT
  USING (TRUE);

-- Bids: anyone can insert
CREATE POLICY "Public insert bids"
  ON bids FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- 3. ANON ACCESS (for the JS client with anon key)
-- ============================================================
-- Since this is a public app with no auth, we use the anon key.
-- The RLS policies above allow public read/insert.
-- For soft-delete, we bypass RLS via an RPC function that checks
-- the owner email or admin email passed as a parameter.

-- Drop restrictive update policy (anon can't set JWT claims)
DROP POLICY IF EXISTS "Owner or admin soft-delete tasks" ON tasks;

-- Instead, create a server-side function for soft-delete
CREATE OR REPLACE FUNCTION soft_delete_task(
  p_task_id UUID,
  p_user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_email TEXT;
BEGIN
  SELECT owner_email INTO v_owner_email
  FROM tasks
  WHERE id = p_task_id AND is_deleted = FALSE;

  IF v_owner_email IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_owner_email = p_user_email OR p_user_email = 'jensenhp79@gmail.com' THEN
    UPDATE tasks SET is_deleted = TRUE WHERE id = p_task_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- ============================================================
-- 4. SEED DATA (optional starter tasks)
-- ============================================================

INSERT INTO tasks (title, category, area, budget, time, description, owner_name, owner_email, contact)
VALUES
  ('Hjælp til at luge forhave', 'Have og gård', 'Ved Tordenskjoldsgade', '300 kr.', 'Lørdag formiddag',
   'Et lille bed skal luges og have kørt haveaffald væk. Jeg har handsker og redskaber.',
   'Inge', '', 'Telefon deles efter aftale'),

  ('Indkøb og aflevering', 'Indkøb', 'Niels Juels Gade', '100 kr.', 'I dag efter kl. 16',
   'Jeg mangler hjælp til at hente lidt varer og aflevere dem ved døren.',
   'Sara', '', 'Aftales i appen'),

  ('Luftning af rolig hund', 'Dyr', 'Trøjborgvej', '150 kr.', 'Tirsdag aften',
   'Rolig ældre hund skal luftes i cirka 30 minutter. Snor og poser ligger klar.',
   'Jonas', '', 'Telefon deles efter accept');

-- Add sample bids to first and third task
INSERT INTO bids (task_id, bidder_name, offer, message)
SELECT id, 'Mads', '250 kr.', 'Jeg kan komme lørdag kl. 10.'
FROM tasks WHERE title = 'Hjælp til at luge forhave' LIMIT 1;

INSERT INTO bids (task_id, bidder_name, offer, message)
SELECT id, 'Amina', 'Kan hjælpe', 'Jeg bor tæt på og kan tage turen.'
FROM tasks WHERE title = 'Luftning af rolig hund' LIMIT 1;
