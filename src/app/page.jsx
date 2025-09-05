
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
  const [user, setUser] = useLocalStorage('user', null); // Can be admin or tenant object
  const [role, setRole] = useLocalStorage('role', null); // 'admin' or 'tenant'
  const [appState, setAppState] = useLocalStorage('appState', INITIAL_APP_STATE);
  const { toast } = useToast();

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
        return true;
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: "Invalid admin credentials!" });
        return false;
      }
    } else { // Tenant login
      const tenant = appState.tenants.find(t => t.username === credentials.username && t.password === credentials.password);
      if (tenant) {
        setUser(tenant);
        setRole('tenant');
        return true;
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: "Invalid username or password for tenant." });
        return false;
      }
    }
  };

  const handleSignUp = (newTenantData) => {
    const existingTenant = appState.tenants.find(t => t.username === newTenantData.username);
    if(existingTenant) {
        toast({ variant: "destructive", title: "Sign Up Failed", description: "Username already exists." });
        return false;
    }

    const newTenant = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...newTenantData,
        // Admin will need to assign these later
        unitNo: null, 
        rentAmount: 0,
        dueDate: null,
        aadhaar: "",
        profilePhotoUrl: `https://picsum.photos/seed/${Date.now()}/200`,
    };

    setAppState(prev => ({
        ...prev,
        tenants: [...prev.tenants, newTenant]
    }));

    toast({ title: "Sign Up Successful", description: "You can now log in with your new account." });
    return true;
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
      return <Auth onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return <>{renderContent()}</>;
}
