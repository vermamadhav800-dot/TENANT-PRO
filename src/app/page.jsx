
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
  // appState now stores data per owner, keyed by owner's username
  const [appState, setAppState] = useLocalStorage("appState_v2", {}); 
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
        const ownerData = appState[credentials.username];
        if (ownerData) {
            // Mock login: only check if owner exists, not password
            setAuth({ user: ownerData.MOCK_USER_INITIAL, role: 'owner' });
            toast({ title: "Login Successful", description: "Welcome back!" });
            return true;
        }
      } else { // Tenant login
        // Tenant login needs to check across all owners' data
        for (const ownerKey in appState) {
          const ownerData = appState[ownerKey];
          if (ownerData && ownerData.tenants) { // Check if ownerData and tenants array exist
            const tenant = ownerData.tenants.find(t => t.phone === credentials.username);
            if (tenant) {
              // We need to know which owner this tenant belongs to for data updates
              setAuth({ user: tenant, role: 'tenant', ownerId: ownerKey }); 
              toast({ title: "Login Successful", description: `Welcome, ${tenant.name}!` });
              return true;
            }
          }
        }
      }
    } else { // Register Owner
      if (appState[credentials.username]) {
         toast({ variant: "destructive", title: "Registration Failed", description: "An account with this email already exists." });
         return false;
      }

      const newOwner = {
        name: credentials.name,
        username: credentials.username,
        password: credentials.password,
      };
      
      // Create a new data "box" for this owner
      const newOwnerState = {
        ...INITIAL_APP_STATE,
        MOCK_USER_INITIAL: newOwner,
        defaults: {
          ...INITIAL_APP_STATE.defaults,
          propertyName: credentials.propertyName,
          propertyAddress: credentials.propertyAddress,
        }
      };
      
      setAppState(prev => ({
        ...prev,
        [credentials.username]: newOwnerState
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
             // Pass only the data for the currently logged-in owner
             const ownerData = appState[auth.user.username];
             if (!ownerData) {
                // Data for this owner was deleted, so log out.
                handleLogout();
                return <Auth onAuth={handleAuth} />;
             }
             return <MainApp 
                ownerState={ownerData} 
                setAppState={setAppState} // Pass the main setter
                onLogout={handleLogout} 
                user={auth.user} 
              />;
          }
          if (auth.role === 'tenant') {
            // Find the tenant and their owner's data
            const ownerData = appState[auth.ownerId];
            if (!ownerData) {
              handleLogout(); // Owner data was deleted, log out tenant.
              return <Auth onAuth={handleAuth} />;
            }
            const tenant = ownerData.tenants.find(t => t.id === auth.user.id);
            if (!tenant) {
              handleLogout(); // Tenant data was deleted, so log out.
              return <Auth onAuth={handleAuth} />;
            }
            return <TenantDashboard 
                ownerState={ownerData} 
                setAppState={setAppState} // Pass the main setter
                tenant={tenant}
                onLogout={handleLogout} 
                ownerId={auth.ownerId}
            />;
          }
      }

      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
