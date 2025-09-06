
"use client";

import { useState } from "react";
import { Building2, User as UserIcon, Lock, Eye, EyeOff, LoaderCircle, Shield, User, Phone as PhoneIcon, Mail, MapPin, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AppLogo from "./AppLogo";

const OwnerLoginForm = ({ onAuth, role }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!username) {
            toast({ variant: "destructive", title: "Error", description: "Please enter your email." });
            return;
        }
        setIsLoading(true);

        const loginSuccess = await onAuth({ username, password, role }, 'login');
        
        if (!loginSuccess) {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="space-y-2">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="email"
                        placeholder="Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 py-6 text-base"
                        required
                        disabled={isLoading}
                    />
                </div>
                 <CardDescription className="text-center text-xs pt-2">
                    For demo purposes, any password will work for registered owners.
                </CardDescription>
            </div>

            <Button type="submit" className="w-full py-6 text-lg btn-gradient-glow" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    "Sign In as Owner"
                )}
            </Button>
        </form>
    );
};

const OwnerRegisterForm = ({ onAuth, role, setAuthMode }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!name || !username || !password || !propertyName || !propertyAddress) {
            toast({ variant: "destructive", title: "Error", description: "Please fill out all fields." });
            return;
        }
        setIsLoading(true);

        const registerSuccess = await onAuth({ name, username, password, propertyName, propertyAddress, role }, 'register');
        if (!registerSuccess) {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuthAction} className="space-y-4">
             <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 py-6 text-base" required />
            </div>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="email" placeholder="Email Address" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 py-6 text-base" required />
            </div>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 py-6 text-base" required />
            </div>
             <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Property Name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="pl-10 py-6 text-base" required />
            </div>
             <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Property Address" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="pl-10 py-6 text-base" required />
            </div>

            <Button type="submit" className="w-full py-6 text-lg btn-gradient-glow" disabled={isLoading}>
                {isLoading ? <><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Registering...</> : "Create Account"}
            </Button>
            <Button variant="link" className="w-full" onClick={() => setAuthMode('login')}>
                Already have an account? Sign In
            </Button>
        </form>
    );
};


const TenantLoginForm = ({ onAuth, role }) => {
    const [phone, setPhone] = useState("");
    const [tenantId, setTenantId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!phone || !tenantId) {
            toast({ variant: "destructive", title: "Error", description: "Please enter your phone number and login ID." });
            return;
        }
        setIsLoading(true);

        const loginSuccess = await onAuth({ username: phone, tenantId, role }, 'login');
        if (!loginSuccess) {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuthAction} className="space-y-4">
            <div className="space-y-2">
                <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="tel"
                        placeholder="Enter your Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 py-6 text-base"
                        required
                    />
                </div>
            </div>
             <div className="space-y-2">
                <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Enter your Login ID"
                        value={tenantId}
                        onChange={(e) => setTenantId(e.target.value)}
                        className="pl-10 py-6 text-base"
                        required
                    />
                </div>
                 <CardDescription className="text-center text-xs pt-2">
                    Your phone number is your username and the Login ID is your password, provided by the owner.
                </CardDescription>
            </div>
            <Button type="submit" className="w-full py-6 text-lg btn-gradient-glow" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    "Sign In as Tenant"
                )}
            </Button>
        </form>
    );
};


export default function Auth({ onAuth }) {
    const [role, setRole] = useState('tenant');
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    const renderOwnerForm = () => {
        if (authMode === 'login') {
            return (
                <>
                    <OwnerLoginForm onAuth={onAuth} role="owner" />
                     <Button variant="link" className="w-full mt-4" onClick={() => setAuthMode('register')}>
                        Don't have an account? Create one
                    </Button>
                </>
            );
        }
        return <OwnerRegisterForm onAuth={onAuth} role="owner" setAuthMode={setAuthMode} />;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center dark-bg-futuristic p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-scale glass-card">
                <CardHeader className="text-center">
                    <AppLogo className="w-16 h-16 mx-auto mb-4" iconClassName="w-9 h-9"/>
                    <CardTitle className="text-2xl md:text-3xl font-headline">Welcome to EstateFlow</CardTitle>
                    <CardDescription>
                         Your modern solution for property management.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-lg mb-6">
                        <button onClick={() => { setRole('tenant'); setAuthMode('login'); }} className={cn("py-2.5 rounded-md text-sm font-medium transition-all duration-300", role === 'tenant' ? 'bg-card shadow-md' : 'text-muted-foreground hover:bg-white/5')}>
                            <User className="inline-block mr-2 h-4 w-4" /> I'm a Tenant
                        </button>
                        <button onClick={() => setRole('owner')} className={cn("py-2.5 rounded-md text-sm font-medium transition-all duration-300", role === 'owner' ? 'bg-card shadow-md' : 'text-muted-foreground hover:bg-white/5')}>
                            <Shield className="inline-block mr-2 h-4 w-4" /> I'm an Owner
                        </button>
                    </div>
                    {role === 'owner' ? renderOwnerForm() : <TenantLoginForm onAuth={onAuth} role="tenant" />}
                </CardContent>
            </Card>
        </div>
    );
}
