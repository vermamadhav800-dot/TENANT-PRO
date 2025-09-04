import { createClient } from '@supabase/supabase-js'
import type { AppState } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// A helper function to get user-specific app state
export const getAppState = async (userId: string): Promise<AppState | null> => {
  const { data, error } = await supabase
    .from('user_app_state')
    .select('state')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found'
    console.error('Error fetching app state:', error.message, 'Details:', error);
    throw error;
  }
  
  return data ? data.state : null;
};

// A helper function to save user-specific app state
export const saveAppState = async (userId: string, state: AppState) => {
  const { error } = await supabase
    .from('user_app_state')
    .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  
  if (error) {
    console.error('Error saving app state:', error);
    throw error;
  }
};
