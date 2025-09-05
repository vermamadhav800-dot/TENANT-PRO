
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
  const [user, setUser] = useState(undefined); // undefined indicates auth state is not yet known
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
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleAuth = async (credentials, action) => {
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, credentials.username, credentials.password);
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
        console.error("Firebase Auth Error:", error.code, error.message);
        let description = "An unexpected error occurred. Please try again.";
        switch (error.code) {
            case 'auth/invalid-credential':
                description = "Invalid email or password. Please check your credentials or create an account.";
                break;
            case 'auth/user-not-found':
                description = "No account found with this email. Please register first.";
                break;
            case 'auth/wrong-password':
                description = "Incorrect password. Please try again.";
                break;
            case 'auth/email-already-in-use':
                description = "This email address is already registered. Please log in instead.";
                break;
            case 'auth/weak-password':
                description = "The password is too weak. Please use at least 6 characters.";
                break;
            case 'auth/invalid-email':
                 description = "Please enter a valid email address.";
                 break;
            default:
                description = error.message;
                break;
        }
        toast({ variant: "destructive", title: "Authentication Failed", description });
        return false;
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  const renderContent = () => {
      // Show startup screen if the timer hasn't finished or if we haven't heard from Firebase auth yet.
      if (isStartupLoading || user === undefined) {
          return <StartupScreen />;
      }
      
      if (role === 'owner' && user && userData) {
          return <MainApp 
              user={user} // Firebase auth user
              userData={userData} // Firestore user data
              onLogout={handleLogout} 
          />;
      }
      
      // If there's no user and auth is resolved, show the login form.
      return <Auth onAuth={handleAuth} />;
  }

  return <>{renderContent()}</>;
}
