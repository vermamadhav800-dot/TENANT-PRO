
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
  const [user, setUser] = useState(undefined); // undefined: auth state unknown, null: logged out, object: logged in
  const [userData, setUserData] = useState(null); // User data from Firestore
  const [role, setRole] = useState(null); // 'owner' or 'tenant'
  const { toast } = useToast();

  useEffect(() => {
    const startupTimer = setTimeout(() => {
      setIsStartupLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Give Firestore a moment to initialize and connect.
        // This is a robust way to prevent the "client is offline" race condition.
        setTimeout(async () => {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData(data);
              setRole(data.role);
              setUser(user); // Set user state only after data is successfully fetched
            } else {
              // User exists in Auth, but not in Firestore. This is an error state.
              console.error("User document not found in Firestore for UID:", user.uid);
              toast({ variant: "destructive", title: "User Data Missing", description: "Your user profile is incomplete. Please contact support." });
              await signOut(auth); // Log out to prevent being stuck.
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            toast({ variant: "destructive", title: "Could not load data", description: "There was an issue loading your profile. Please try again." });
            await signOut(auth);
          }
        }, 500); // A 500ms delay is usually sufficient.
      } else {
        setUser(null);
        setUserData(null);
        setRole(null);
      }
    });

    return () => {
      clearTimeout(startupTimer);
      unsubscribe();
    };
  }, [toast]);


  const handleAuth = async (credentials, action) => {
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, credentials.username, credentials.password);
            // The onAuthStateChanged listener will handle the rest.
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
            
            await setDoc(doc(db, "users", userCredential.user.uid), newUser);
            
            await setDoc(doc(db, "settings", userCredential.user.uid), {
                ownerId: userCredential.user.uid,
                propertyName: credentials.propertyName,
                propertyAddress: credentials.propertyAddress,
                electricityRatePerUnit: 8,
                upiId: '',
            });

            // The onAuthStateChanged listener will pick this up.
            toast({ title: "Registration Successful", description: "Welcome! Your property is set up." });
            return true;
        }
    } catch (error) {
        console.error("Firebase Auth Error:", error.code, error.message);
        let description = "An unexpected error occurred. Please try again.";
        switch (error.code) {
            case 'auth/invalid-credential':
                description = "Invalid email or password. Please check your credentials or create an account.";
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
      // If startup screen is active OR we haven't heard from Firebase auth yet
      if (isStartupLoading || user === undefined) {
          return <StartupScreen />;
      }
      
      // If we have a user and their data is loaded
      if (user && userData) {
          if (role === 'owner') {
             return <MainApp 
                user={user} 
                userData={userData} 
                onLogout={handleLogout} 
              />;
          }
          if (role === 'tenant') {
            // Find the specific tenant data from the full tenants list
            const tenantData = appState.tenants.find(t => t.id === user.uid);
            if(tenantData) {
                 return <TenantDashboard 
                    tenant={tenantData} 
                    onLogout={handleLogout} 
                />;
            }
          }
      }

      // If there's no user, show the login form.
      if (user === null) {
          return <Auth onAuth={handleAuth} />;
      }

      // Fallback: A loading indicator for the brief moment between user object being set and userData being fetched.
      return <StartupScreen />;
  }

  return <>{renderContent()}</>;
}
