-- 1. Add Rating and Points columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_pts INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS missions_completed INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION DEFAULT 5.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company TEXT;

-- 2. Create the reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all reviews" ON reviews;
CREATE POLICY "Users can read all reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clients can insert reviews" ON reviews;
CREATE POLICY "Clients can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- 3. Trigger to calculate Driver rating and points upon new review
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS trigger AS $$
DECLARE
  new_avg_rating DOUBLE PRECISION;
  new_total_ratings INTEGER;
  new_missions_completed INTEGER;
  new_total_pts INTEGER;
BEGIN
  -- Count total ratings and calculate average
  SELECT COUNT(*), COALESCE(AVG(rating), 5.0)
  INTO new_total_ratings, new_avg_rating
  FROM reviews
  WHERE driver_id = NEW.driver_id;

  -- Count delivered missions by driver
  SELECT COUNT(*)
  INTO new_missions_completed
  FROM missions
  WHERE driver_id = NEW.driver_id AND status = 'delivered';

  -- Calculate points: 10 points per delivered mission + avg rating * 50
  new_total_pts := (new_missions_completed * 10) + (new_avg_rating * 50);

  -- Update driver profile
  UPDATE profiles
  SET 
    rating = ROUND(new_avg_rating::numeric, 1),
    total_ratings = new_total_ratings,
    missions_completed = new_missions_completed,
    total_pts = new_total_pts
  WHERE id = NEW.driver_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_review();

-- 4. Create Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Ensure only one settings row
  auto_assign_drivers BOOLEAN DEFAULT true,
  require_kyc BOOLEAN DEFAULT true,
  admin_notifications BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default row
INSERT INTO platform_settings (id, auto_assign_drivers, require_kyc, admin_notifications, maintenance_mode) 
VALUES (1, true, true, true, false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read settings" ON platform_settings;
CREATE POLICY "Anyone can read settings"
  ON platform_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON platform_settings;
CREATE POLICY "Admins can update settings"
  ON platform_settings FOR UPDATE
  USING (public.is_admin());

-- 5. Enable Realtime for profiles, reviews, and platform_settings
-- Run this in Supabase SQL editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
-- ALTER PUBLICATION supabase_realtime ADD TABLE platform_settings;
