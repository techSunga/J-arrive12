-- 1. Create the withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 1000),
  phone_momo TEXT NOT NULL, 
  status TEXT DEFAULT 'pending', 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES profiles(id),
  admin_note TEXT,

  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

-- Ensure columns if table existed
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS phone_momo TEXT;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS amount INTEGER;

-- 2. Enable RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- 3. Reset Policies
DROP POLICY IF EXISTS "Drivers can view their own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Drivers can request withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view and update all withdrawals" ON withdrawals;

-- 4. Recreate Policies
CREATE POLICY "Drivers can view their own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can request withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Admins can view and update all withdrawals"
  ON withdrawals FOR ALL
  USING (public.is_admin());

-- 4. Enable Realtime
-- ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;
