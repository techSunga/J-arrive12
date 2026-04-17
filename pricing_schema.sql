-- Add pricing columns to platform_settings
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS base_fee INTEGER DEFAULT 1000;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS price_per_km INTEGER DEFAULT 500;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS commission_rate INTEGER DEFAULT 15; -- in %
