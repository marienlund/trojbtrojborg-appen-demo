-- Subscriptions table for interest notifications
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Public can update own subscription" ON subscriptions FOR UPDATE USING (true);
