
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import TenantDashboard from "@/components/TenantDashboard";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL, INITIAL_APP_STATE } from '@/lib/consts';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useLocalStorage('user', null); // Can be admin or tenant object
  const [role, setRole] = useLocalStorage('role', null); // 'admin' or 'tenant'
  const [appState, setAppState] = useLocalStorage('appState', INITIAL_APP_STATE);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (credentials) => {
    if (credentials.role === 'admin') {
      if (credentials.username === MOCK_USER_INITIAL.username && credentials.password === MOCK_USER_INITIAL.password) {
        setUser(MOCK_USER_INITIAL);
        setRole('admin');
      } else {
        alert("Invalid admin credentials!");
      }
    } else { // Tenant login
      const tenant = appState.tenants.find(t => t.username === credentials.username && t.phone === credentials.password);
      if (tenant) {
        setUser(tenant);
        setRole('tenant');
      } else {
        alert("Invalid tenant credentials! Use your registered username and phone number as the password.");
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
  };
  
  const renderContent = () => {
      if (isLoading) {
          return <StartupScreen />;
      }
      if (role === 'admin' && user) {
          return <MainApp 
              appState={appState}
              setAppState={setAppState}
              user={user} 
              onLogout={handleLogout} 
          />;
      }
      if (role === 'tenant' && user) {
          return <TenantDashboard
              appState={appState}
              tenant={user}
              onLogout={handleLogout}
          />
      }
      return <Auth onLogin={handleLogin} />;
  }

  return <>{renderContent()}</>;
}
