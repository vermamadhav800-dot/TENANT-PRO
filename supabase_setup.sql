-- EstateFlow Supabase Setup Script
-- This script sets up the necessary database table and security policies
-- for the EstateFlow application.

-- 1. Create the user_app_state table
-- This table will store the entire application state for each user as a JSONB object.
-- - user_id is the primary key and links to the authenticated user.
-- - state holds all the application data (rooms, tenants, payments, etc.).
-- - updated_at automatically tracks the last modification time.

CREATE TABLE IF NOT EXISTS public.user_app_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add a comment to the table for clarity
COMMENT ON TABLE public.user_app_state IS 'Stores the entire application state for each user.';


-- 2. Enable Row Level Security (RLS)
-- This is a crucial security step. It ensures that, by default, no one can
-- access any rows in this table unless a specific policy allows them to.

ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

-- Add a comment explaining RLS
COMMENT ON TABLE public.user_app_state IS 'Row Level Security is enabled to protect user data.';


-- 3. Create Security Policies
-- These policies define the rules for who can access or modify data.

-- 3.1. Policy for SELECT (Read)
-- Allows a user to select (read) ONLY their own row.
-- The `auth.uid()` function returns the ID of the currently logged-in user.
DROP POLICY IF EXISTS "Allow individual user read access" ON public.user_app_state;
CREATE POLICY "Allow individual user read access"
ON public.user_app_state FOR SELECT
USING (auth.uid() = user_id);

-- 3.2. Policy for INSERT (Create)
-- Allows a user to insert (create) a new row for themselves.
DROP POLICY IF EXISTS "Allow individual user insert access" ON public.user_app_state;
CREATE POLICY "Allow individual user insert access"
ON public.user_app_state FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3.3. Policy for UPDATE (Modify)
-- Allows a user to update ONLY their own row.
DROP POLICY IF EXISTS "Allow individual user update access" ON public.user_app_state;
CREATE POLICY "Allow individual user update access"
ON public.user_app_state FOR UPDATE
USING (auth.uid() = user_id);


-- 4. Automatically update the `updated_at` timestamp
-- This function and trigger will automatically update the `updated_at` column
-- whenever a user's state is modified.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_app_state_update ON public.user_app_state;
CREATE TRIGGER on_user_app_state_update
BEFORE UPDATE ON public.user_app_state
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- End of script. You can now run this in your Supabase SQL Editor.
