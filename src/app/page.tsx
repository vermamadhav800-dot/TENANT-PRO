
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL } from '@/lib/consts';
import type { User } from '@/lib/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("estateflow_isLoggedIn", false);
  const [user, setUser] = useLocalStorage<User>("estateflow_user", MOCK_USER_INITIAL);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Keep startup screen for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoading && <StartupScreen />}
      
      {!isLoading && !isLoggedIn && <Auth onLoginSuccess={handleLoginSuccess} user={user} />}

      {!isLoading && isLoggedIn && <MainApp onLogout={handleLogout} user={user} setUser={setUser} />}
    </>
  );
}
