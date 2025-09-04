
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL, INITIAL_APP_STATE } from '@/lib/consts';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useLocalStorage('appState', INITIAL_APP_STATE);
  const [user, setUser] = useLocalStorage('user', MOCK_USER_INITIAL);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Keep startup screen for 2 seconds

    // Simple check if user is "logged in"
    const loggedIn = window.localStorage.getItem('isAuthenticated');
    if (loggedIn === 'true') {
        setIsAuthenticated(true);
    }

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (credentials) => {
    // This is a mock login. In a real app, you'd validate against a server.
    if (credentials.username === MOCK_USER_INITIAL.username && credentials.password === MOCK_USER_INITIAL.password) {
      setIsAuthenticated(true);
       window.localStorage.setItem('isAuthenticated', 'true');
    } else {
      alert("Invalid credentials!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.localStorage.removeItem('isAuthenticated');
  };

  return (
    <>
      {isLoading ? (
        <StartupScreen />
      ) : isAuthenticated ? (
        <MainApp 
          appState={appState}
          setAppState={setAppState}
          user={user} 
          onLogout={handleLogout} 
        />
      ) : (
        <Auth onLogin={handleLogin} />
      )}
    </>
  );
}
