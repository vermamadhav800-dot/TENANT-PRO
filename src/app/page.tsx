"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import { useLocalStorage } from "@/lib/hooks";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("estateflow_isLoggedIn", false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <StartupScreen />;
  }

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainApp onLogout={handleLogout} />;
}
