-- This script sets up the database schema and policies for the EstateFlow application.
--
-- How to use:
-- 1. Go to your Supabase project dashboard.
-- 2. Navigate to the "SQL Editor" section.
-- 3. Copy and paste the entire content of this file into the editor.
-- 4. Click "Run" to execute the script.
--
-- To restrict authentication to specific users:
-- 1. In your Supabase Dashboard, go to Authentication -> Providers and disable "Email".
-- 2. Go to Authentication -> Users and click "Add user" to create your authorized user.


-- 1. Create the 'rooms' table
-- This table stores information about each room or unit in the property.
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  rent NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, number)
);
COMMENT ON TABLE rooms IS 'Stores information about each room or unit.';

-- 2. Create the 'tenants' table
-- This table stores information about each tenant. It links to a room.
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  rent_amount NUMERIC(10, 2) NOT NULL,
  due_date TIMESTAMPTZ,
  aadhaar TEXT,
  aadhaar_card_url TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE tenants IS 'Stores information about each tenant.';

-- 3. Create the 'payments' table
-- This table logs all payments made by tenants.
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  method TEXT CHECK (method IN ('Cash', 'UPI', 'Bank Transfer')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE payments IS 'Logs all payments made by tenants.';

-- 4. Create the 'electricity_readings' table
-- This table stores electricity meter readings for each room.
CREATE TABLE IF NOT EXISTS electricity_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  previous_reading NUMERIC(10, 2) NOT NULL,
  current_reading NUMERIC(10, 2) NOT NULL,
  units_consumed NUMERIC(10, 2) NOT NULL,
  rate_per_unit NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE electricity_readings IS 'Stores electricity meter readings for rooms.';


-- 5. Enable Row Level Security (RLS) for all tables
-- This is a crucial security step to ensure users can only access their own data.
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_readings ENABLE ROW LEVEL SECURITY;


-- 6. Create RLS policies for each table
-- These policies enforce the rule that users can only interact with their own data.

-- Rooms policies
DROP POLICY IF EXISTS "Users can manage their own rooms" ON rooms;
CREATE POLICY "Users can manage their own rooms" ON rooms
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tenants policies
DROP POLICY IF EXISTS "Users can manage their own tenants" ON tenants;
CREATE POLICY "Users can manage their own tenants" ON tenants
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;
CREATE POLICY "Users can manage their own payments" ON payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Electricity readings policies
DROP POLICY IF EXISTS "Users can manage their own electricity readings" ON electricity_readings;
CREATE POLICY "Users can manage their own electricity readings" ON electricity_readings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 7. Create a table for user-specific defaults
-- This is a simplified approach, an alternative is to add a 'defaults' column to the auth.users table's metadata.
CREATE TABLE IF NOT EXISTS user_defaults (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  defaults JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE user_defaults IS 'Stores user-specific default settings.';

-- Enable RLS and create policies for user_defaults
ALTER TABLE user_defaults ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own defaults" ON user_defaults;
CREATE POLICY "Users can manage their own defaults" ON user_defaults
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- This single-table state is now deprecated in favor of a relational schema.
-- The table is kept for archival purposes but should not be used for new development.
-- It can be safely deleted if no longer needed.
CREATE TABLE IF NOT EXISTS user_app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB,
  updated_at TIMESTAMPTZ
);
COMMENT ON TABLE user_app_state IS 'DEPRECATED: Stores the entire app state as a single JSON object for each user.';

-- Enable RLS and create policies for the deprecated table
ALTER TABLE user_app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own app state" ON user_app_state;
CREATE POLICY "Users can manage their own app state" ON user_app_state
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

