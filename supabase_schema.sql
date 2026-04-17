-- SQL Schema for J'ARRIVE Logistics
-- Paste this into your Supabase SQL Editor

-- 1. Create a table for user profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'particular', -- 'particular', 'pro', 'driver', 'admin'
  company_name TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,   -- Used for driver document verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT role_check CHECK (role IN ('particular', 'pro', 'driver', 'admin'))
);

-- If upgrading from old schema: add is_verified column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- 2. Create a table for vehicles (only for drivers)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'moto', 'van', 'bicycle'
  model TEXT,
  plate_number TEXT,
  color TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create a table for missions (deliveries)
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'
  type TEXT NOT NULL, -- 'package', 'food', 'gas', 'moving'

  origin_address TEXT NOT NULL,
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,

  dest_address TEXT NOT NULL,
  dest_lat DOUBLE PRECISION,
  dest_lng DOUBLE PRECISION,

  price_fcfa INTEGER NOT NULL,
  distance_km DOUBLE PRECISION,
  estimated_time_min INTEGER,

  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid', 'refunded'
  payment_method TEXT DEFAULT 'cash',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  delivered_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT status_check CHECK (status IN ('pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'cancelled'))
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- 5. Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Drop old duplicate policies before recreating
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Clients view own missions" ON missions;
DROP POLICY IF EXISTS "Drivers view available" ON missions;
DROP POLICY IF EXISTS "Admins view all missions" ON missions;
DROP POLICY IF EXISTS "Clients insert missions" ON missions;
DROP POLICY IF EXISTS "Drivers update assigned mission" ON missions;
DROP POLICY IF EXISTS "Admins update any mission" ON missions;

-- 7. Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- 8. Missions Policies
CREATE POLICY "Clients view own missions"
  ON missions FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Drivers view available"
  ON missions FOR SELECT
  USING (status = 'pending' OR driver_id = auth.uid());

CREATE POLICY "Admins view all missions"
  ON missions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Clients insert missions"
  ON missions FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Drivers update assigned mission"
  ON missions FOR UPDATE
  USING (driver_id = auth.uid() OR status = 'pending');

CREATE POLICY "Admins update any mission"
  ON missions FOR UPDATE
  USING (public.is_admin());

-- 9. Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, is_verified)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'role', 'particular'),
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Enable real-time for all tables (run in Supabase dashboard)
-- Publication is usually set via Supabase dashboard: Database > Replication
-- Make sure all three tables are enabled in supabase_realtime publication.
-- You can also run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE missions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
