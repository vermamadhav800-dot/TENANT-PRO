"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import { useLocalStorage } from "@/lib/hooks";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("estateflow_isLoggedIn", false);

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {isLoading && <StartupScreen />}
      
      {!isLoading && !isLoggedIn && <Auth onLoginSuccess={handleLoginSuccess} />}

      {!isLoading && isLoggedIn && <MainApp onLogout={handleLogout} />}
    </ThemeProvider>
  );
}
