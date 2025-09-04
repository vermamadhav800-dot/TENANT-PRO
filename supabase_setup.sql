-- EstateFlow Supabase Setup Script
-- This script sets up the necessary tables and policies for the EstateFlow application.
-- Run this script in your Supabase SQL Editor.

-- IMPORTANT: MANUAL STEPS FOR THE USER
-- To restrict login to a specific user (e.g., vermamadhav800@gmail.com), you must do two things
-- in your Supabase project dashboard:
-- 1. Navigate to Authentication > Users and manually create the user with the email and password you want.
-- 2. Navigate to Authentication > Providers and disable the "Email" provider to prevent new user sign-ups.
-- This script CANNOT create users or change auth settings.

-- 1. CREATE TABLES

-- Table for Rooms/Units
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "number" TEXT NOT NULL,
    capacity INT NOT NULL,
    rent NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, "number")
);
COMMENT ON TABLE rooms IS 'Stores information about each room or property unit.';

-- Table for Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    rent_amount NUMERIC(10, 2) NOT NULL,
    due_date TIMESTAMPTZ,
    aadhaar TEXT,
    profile_photo_url TEXT,
    aadhaar_card_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE tenants IS 'Stores information about each tenant.';

-- Table for Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    method TEXT CHECK (method IN ('Cash', 'UPI', 'Bank Transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE payments IS 'Records all payments made by tenants.';

-- Table for Electricity Readings
CREATE TABLE IF NOT EXISTS electricity_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    previous_reading NUMERIC(10, 2) NOT NULL,
    current_reading NUMERIC(10, 2) NOT NULL,
    rate_per_unit NUMERIC(10, 2) NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE electricity_readings IS 'Stores electricity meter readings for each room.';


-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- This is a critical security step. It ensures users can only access their own data.
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_readings ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES
-- These policies enforce the data access rules.

-- Policies for 'rooms' table
DROP POLICY IF EXISTS "Users can manage their own rooms" ON rooms;
CREATE POLICY "Users can manage their own rooms" ON rooms
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'tenants' table
DROP POLICY IF EXISTS "Users can manage their own tenants" ON tenants;
CREATE POLICY "Users can manage their own tenants" ON tenants
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'payments' table
DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;
CREATE POLICY "Users can manage their own payments" ON payments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for 'electricity_readings' table
DROP POLICY IF EXISTS "Users can manage their own electricity readings" ON electricity_readings;
CREATE POLICY "Users can manage their own electricity readings" ON electricity_readings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 4. (OPTIONAL) ADD A TABLE FOR USER DEFAULTS
CREATE TABLE IF NOT EXISTS user_defaults (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    state JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE user_defaults IS 'Stores user-specific default settings like electricity rate.';

-- Enable RLS for user_defaults
ALTER TABLE user_defaults ENABLE ROW LEVEL SECURITY;

-- Policies for 'user_defaults' table
DROP POLICY IF EXISTS "Users can manage their own defaults" ON user_defaults;
CREATE POLICY "Users can manage their own defaults" ON user_defaults
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- End of Script
-- After running this, your database will be ready for the application.
-- Remember to set up your user manually in the Supabase Dashboard as instructed at the top.
