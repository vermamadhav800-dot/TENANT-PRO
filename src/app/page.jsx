
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import TenantDashboard from "@/components/TenantDashboard";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/lib/hooks";
import { INITIAL_APP_STATE } from "@/lib/consts";

export default function Home() {
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [auth, setAuth] = useLocalStorage("auth", { user: null, role: null });
  const [appState, setAppState] = useLocalStorage("appState", INITIAL_APP_STATE);
  const { toast } = useToast();

  useEffect(() => {
    const startupTimer = setTimeout(() => {
      setIsStartupLoading(false);
    }, 2000); 

    return () => clearTimeout(startupTimer);
  }, []);

  const handleAuth = (credentials, action) => {
    if (action === 'login') {
      if (credentials.role === 'owner') {
        if (!appState.MOCK_USER_INITIAL) {
            toast({ variant: "destructive", title: "Login Error", description: "No owner account found. Please register first." });
            return false;
        }
        if (credentials.username === appState.MOCK_USER_INITIAL.username && credentials.password === appState.MOCK_USER_INITIAL.password) {
          setAuth({ user: appState.MOCK_USER_INITIAL, role: 'owner' });
          toast({ title: "Login Successful", description: "Welcome back!" });
          return true;
        }
      } else { // Tenant login
        const tenant = appState.tenants.find(t => t.phone === credentials.username);
        if (tenant) {
          setAuth({ user: tenant, role: 'tenant' });
          toast({ title: "Login Successful", description: `Welcome, ${tenant.name}!` });
          return true;
        }
      }
    } else { // Register
      const newOwner = {
        name: credentials.name,
        username: credentials.username,
        password: credentials.password,
      };
      setAppState(prev => ({
        ...prev,
        MOCK_USER_INITIAL: newOwner, // This is the corrected part
        defaults: {
          ...prev.defaults,
          propertyName: credentials.propertyName,
          propertyAddress: credentials.propertyAddress,
        }
      }));
      setAuth({ user: newOwner, role: 'owner' });
      toast({ title: "Registration Successful", description: "Welcome! Your property is set up." });
      return true;
    }

    toast({ variant: "destructive", title: "Authentication Failed", description: "Invalid credentials. Please try again." });
    return false;
  };

  const handleLogout = () => {
    setAuth({ user: null, role: null });
  };
  
  const renderContent = () => {
      if (isStartupLoading) {
          return <StartupScreen />;
      }
      
      if (auth.user) {
          if (auth.role === 'owner') {
             return <MainApp 
                appState={appState} 
                setAppState={setAppState} 
                onLogout={handleLogout} 
                user={auth.user} 
              />;
          }
          if (auth.role === 'tenant') {
            const tenant = appState.tenants.find(t => t.id === auth.user.id);
            if (!tenant) {
              handleLogout(); // Tenant data was deleted, so log out.
              return <Auth onAuth={handleAuth} />;
            }
            return <TenantDashboard 
                appState={appState} 
                setAppState={setAppState}
                tenant={tenant}
                onLogout={handleLogout} 
            />;
          }
      }

      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
