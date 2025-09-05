
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import TenantDashboard from "@/components/TenantDashboard";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL, INITIAL_APP_STATE } from '@/lib/consts';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useLocalStorage('user', null); // Can be owner or tenant object
  const [role, setRole] = useLocalStorage('role', null); // 'owner' or 'tenant'
  const [appState, setAppState] = useLocalStorage('appState', INITIAL_APP_STATE);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleAuth = (credentials, action) => {
    if (credentials.role === 'owner') {
      if (action === 'login') {
        // In a real app, you'd fetch this from a DB.
        // For now, we compare against the single stored owner.
        const ownerUser = appState.MOCK_USER_INITIAL || MOCK_USER_INITIAL;
        if (credentials.username === ownerUser.username && credentials.password === ownerUser.password) {
            setUser(ownerUser);
            setRole('owner');
            return true;
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: "Invalid owner credentials." });
            return false;
        }
      } else { // Register
        const newOwner = {
          name: credentials.name,
          username: credentials.username,
          password: credentials.password,
        };
        const newDefaults = {
            ...appState.defaults,
            propertyName: credentials.propertyName,
            propertyAddress: credentials.propertyAddress
        };
        
        // In this mock setup, registering a new owner overwrites the previous one.
        setAppState(prev => ({ ...prev, MOCK_USER_INITIAL: newOwner, defaults: newDefaults }));
        setUser(newOwner);
        setRole('owner');
        toast({ title: "Registration Successful", description: "Welcome! You can now manage your property." });
        return true;
      }
    } else { // Tenant login using phone number
        const tenant = appState.tenants.find(t => t.phone === credentials.username);
        if (tenant) {
            setUser(tenant);
            setRole('tenant');
            return true;
        } else {
            toast({ variant: "destructive", title: "Login Failed", description: "This phone number is not registered. Please contact your property owner." });
            return false;
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
      if (role === 'owner' && user) {
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
              setAppState={setAppState}
              tenant={user}
              onLogout={handleLogout}
          />
      }
      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
