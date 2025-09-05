
"use client";

import { useState, useEffect } from "react";
import StartupScreen from "@/components/StartupScreen";
import Auth from "@/components/Auth";
import MainApp from "@/components/MainApp";
import TenantDashboard from "@/components/TenantDashboard";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";


export default function Home() {
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null); // Firebase user object
  const [userData, setUserData] = useState(null); // User data from Firestore
  const [role, setRole] = useState(null); // 'owner' or 'tenant'
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsStartupLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setRole(data.role);
        } else {
          // This case might happen during registration right before doc is created.
          // Or if a user exists in Auth but not in Firestore.
          setRole(null); 
        }
      } else {
        setUser(null);
        setUserData(null);
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
        if (action === 'login') {
            const userCredential = await signInWithEmailAndPassword(auth, credentials.username, credentials.password);
            toast({ title: "Login Successful", description: "Welcome back!" });
            return true;
        } else { // Register
            const userCredential = await createUserWithEmailAndPassword(auth, credentials.username, credentials.password);
            
            const newUser = {
                uid: userCredential.user.uid,
                name: credentials.name,
                email: credentials.username,
                role: 'owner',
            };
            
            // Create user document in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), newUser);
            
            // Create a default settings document for the new owner
            await setDoc(doc(db, "settings", userCredential.user.uid), {
                ownerId: userCredential.user.uid,
                propertyName: credentials.propertyName,
                propertyAddress: credentials.propertyAddress,
                electricityRatePerUnit: 8,
                upiId: '',
            });

            setUserData(newUser);
            setRole('owner');

            toast({ title: "Registration Successful", description: "Welcome! You can now manage your property." });
            return true;
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
      if (isStartupLoading || authLoading) {
          return <StartupScreen />;
      }
      
      if (role === 'owner' && user && userData) {
          return <MainApp 
              user={user} // Firebase auth user
              userData={userData} // Firestore user data
              onLogout={handleLogout} 
          />;
      }
      // Tenant login will be handled via a separate flow, likely involving phone auth
      // For now, the auth form handles owner login/registration
      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
