
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import TenantDashboard from "@/components/TenantDashboard";
import { useLocalStorage } from "@/lib/hooks";
import { MOCK_USER_INITIAL, INITIAL_APP_STATE } from '@/lib/consts';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { LoaderCircle } from "lucide-react";


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null); // Firebase user object
  const [role, setRole] = useState(null); // 'owner' or 'tenant'
  const [appState, setAppState] = useLocalStorage('appState', INITIAL_APP_STATE);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Here you would typically fetch user role from your database (Firestore)
        // For now, we'll make an assumption. If email is not a phone number, they are owner.
        // This logic will be replaced later.
        if (user.email) {
            setUser(user);
            setRole('owner');
        } else if (user.phoneNumber) {
            // Logic for tenant will be added here
            setUser(user);
            setRole('tenant');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleAuth = async (credentials, action) => {
    try {
        if (credentials.role === 'owner') {
            if (action === 'login') {
                await signInWithEmailAndPassword(auth, credentials.username, credentials.password);
                toast({ title: "Login Successful", description: "Welcome back!" });
                return true;
            } else { // Register
                const userCredential = await createUserWithEmailAndPassword(auth, credentials.username, credentials.password);
                // In a real app, you'd create a corresponding user document in Firestore here.
                const newOwner = {
                    uid: userCredential.user.uid,
                    name: credentials.name,
                    email: credentials.username,
                };
                const newDefaults = {
                    ...appState.defaults,
                    propertyName: credentials.propertyName,
                    propertyAddress: credentials.propertyAddress
                };
                setAppState(prev => ({ ...prev, defaults: newDefaults }));
                toast({ title: "Registration Successful", description: "Welcome! You can now manage your property." });
                return true;
            }
        } else { // Tenant login
            // Tenant login logic with Firebase Phone Auth will be implemented next.
            toast({ variant: "destructive", title: "Coming Soon", description: "Tenant login via phone is being connected to the backend." });
            return false;
        }
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        toast({ variant: "destructive", title: "Authentication Failed", description: error.message });
        return false;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  const renderContent = () => {
      if (isLoading || authLoading) {
          return <StartupScreen />;
      }
      
      const ownerUser = {
          name: user?.displayName || appState.MOCK_USER_INITIAL.name,
          username: user?.email,
      };

      if (role === 'owner' && user) {
          return <MainApp 
              appState={appState}
              setAppState={setAppState}
              user={ownerUser} 
              onLogout={handleLogout} 
          />;
      }
      if (role === 'tenant' && user) {
          // This will be fleshed out with real tenant data from firestore
          const tenantUser = appState.tenants.find(t => t.phone === user.phoneNumber) || { name: 'Tenant', phone: user.phoneNumber };
          return <TenantDashboard
              appState={appState}
              setAppState={setAppState}
              tenant={tenantUser}
              onLogout={handleLogout}
          />
      }
      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
