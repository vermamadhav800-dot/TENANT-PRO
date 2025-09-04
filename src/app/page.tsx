
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL } from '@/lib/consts';
import type { User } from '@/lib/types';
import { supabase } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function Home() {
  const [isClientLoading, setIsClientLoading] = useState(true);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClientLoading(false);
    }, 2000); // Keep startup screen for 2 seconds

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setIsSupabaseLoading(false);
      }
    );

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSupabaseLoading(false);
    });

    return () => {
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const isLoading = isClientLoading || isSupabaseLoading;

  return (
    <>
      {isLoading && <StartupScreen />}
      
      {!isLoading && !session && <Auth />}

      {!isLoading && session && <MainApp session={session} onLogout={handleLogout} />}
    </>
  );
}
