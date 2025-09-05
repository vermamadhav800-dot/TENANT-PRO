
"use client";

import { useState } from "react";
import { Building2, User as UserIcon, Lock, Eye, EyeOff, LoaderCircle, Shield, User, Phone as PhoneIcon, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const OwnerLoginForm = ({ onAuth, role }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast({ variant: "destructive", title: "Error", description: "Please enter username and password." });
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
                        className="pl-10 py-6"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 py-6"
                        required
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                </a>
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
                <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 py-6" required />
            </div>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="email" placeholder="Email Address" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 py-6" required />
            </div>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 py-6" required />
            </div>
             <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Property Name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="pl-10 py-6" required />
            </div>
             <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Property Address" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="pl-10 py-6" required />
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
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!phone) {
            toast({ variant: "destructive", title: "Error", description: "Please enter your phone number." });
            return;
        }
        setIsLoading(true);

        const loginSuccess = await onAuth({ username: phone, role }, 'login');
        if (!loginSuccess) {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="space-y-2">
                <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="tel"
                        placeholder="Enter your Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 py-6"
                        required
                    />
                </div>
                 <CardDescription className="text-center text-xs pt-2">
                    Your phone number is your key. The owner must register your number before you can log in.
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
        <div className="min-h-screen w-full flex items-center justify-center dark-bg-grid p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-scale glass-card">
                <CardHeader className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-white h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-headline">Welcome to EstateFlow</CardTitle>
                    <CardDescription>
                         Sign in or create an account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg mb-6">
                        <button onClick={() => { setRole('tenant'); setAuthMode('login'); }} className={cn("py-2.5 rounded-md text-sm font-medium transition-colors", role === 'tenant' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-background/50')}>
                            <User className="inline-block mr-2 h-4 w-4" /> I'm a Tenant
                        </button>
                        <button onClick={() => setRole('owner')} className={cn("py-2.5 rounded-md text-sm font-medium transition-colors", role === 'owner' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-background/50')}>
                            <Shield className="inline-block mr-2 h-4 w-4" /> I'm an Owner
                        </button>
                    </div>
                    {role === 'owner' ? renderOwnerForm() : <TenantLoginForm onAuth={onAuth} role="tenant" />}
                </CardContent>
            </Card>
        </div>
    );
}
