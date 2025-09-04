-- supabase_setup.sql
-- This script sets up the database schema for the EstateFlow application.
-- It creates tables for rooms, tenants, payments, and electricity readings,
-- and establishes relationships between them. It also enables Row Level Security (RLS)
-- and creates policies to ensure that users can only access their own data.

-- 1. Create the 'rooms' table
-- This table stores information about each room or unit.
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "number" TEXT NOT NULL,
    capacity INT NOT NULL,
    rent NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    UNIQUE(user_id, "number") -- Each room number must be unique per user
);

-- 2. Create the 'tenants' table
-- This table stores information about each tenant.
-- It links to the 'rooms' table via the 'room_id'.
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    rent_amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    aadhaar TEXT NOT NULL,
    aadhaar_card_url TEXT,
    profile_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Create the 'payments' table
-- This table records all payments made by tenants.
-- It links to the 'tenants' table via the 'tenant_id'.
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('Cash', 'UPI', 'Bank Transfer')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Create the 'electricity_readings' table
-- This table tracks electricity usage for each room.
-- It links to the 'rooms' table via the 'room_id'.
CREATE TABLE IF NOT EXISTS electricity_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
    previous_reading NUMERIC NOT NULL,
    current_reading NUMERIC NOT NULL,
    rate_per_unit NUMERIC NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS) for all tables
-- This is a crucial security step to ensure data privacy.
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_readings ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- These policies ensure that users can only see and manage their own data.
-- Drop existing policies first to avoid errors on re-running the script.
DROP POLICY IF EXISTS "Users can manage their own rooms" ON rooms;
CREATE POLICY "Users can manage their own rooms" ON rooms
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own tenants" ON tenants;
CREATE POLICY "Users can manage their own tenants" ON tenants
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own payments" ON payments;
CREATE POLICY "Users can manage their own payments" ON payments
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own electricity readings" ON electricity_readings;
CREATE POLICY "Users can manage their own electricity readings" ON electricity_readings
    FOR ALL USING (auth.uid() = user_id);

-- Note: The logic for handling user-specific defaults (like electricityRatePerUnit)
-- can be managed on the client-side or by creating a separate 'user_settings' table
-- if more complex settings are required in the future.
-- For now, the application will continue to manage this within its state.
