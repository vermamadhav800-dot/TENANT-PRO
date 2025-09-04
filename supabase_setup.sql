-- Create the table to store user-specific application state
CREATE TABLE public.user_app_state (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) on the table
-- This ensures that users can only access their own data.
ALTER TABLE public.user_app_state ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own app state.
-- This policy grants SELECT access to a row if the user's ID matches the user_id in that row.
CREATE POLICY "Allow individual user read access"
ON public.user_app_state
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy to allow users to create their own app state.
-- This policy grants INSERT access, checking if the new row's user_id matches the creator's ID.
CREATE POLICY "Allow individual user insert access"
ON public.user_app_state
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy to allow users to update their own app state.
-- This policy grants UPDATE access to a row if the user's ID matches the user_id in that row.
CREATE POLICY "Allow individual user update access"
ON public.user_app_state
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
