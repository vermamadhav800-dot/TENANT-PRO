
"use client";

import { useState } from "react";
import { Building2, User as UserIcon, Lock, Eye, EyeOff, LoaderCircle, Shield, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const LoginForm = ({ onLogin, role }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleAuthAction = (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast({ variant: "destructive", title: "Error", description: "Please enter username and password." });
            return;
        }
        setIsLoading(true);

        setTimeout(() => {
            const loginSuccess = onLogin({ username, password, role });
            if (!loginSuccess) {
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <form onSubmit={handleAuthAction} className="space-y-6">
            <div className="space-y-2">
                <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 py-6"
                        required
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
            <Button type="submit" className="w-full py-6 text-lg gradient-primary text-white" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    `Sign In as ${role === 'admin' ? 'Admin' : 'Tenant'}`
                )}
            </Button>
        </form>
    );
};

const SignUpForm = ({ onSignUp, onSwitchTab }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSignUpAction = (e) => {
        e.preventDefault();
        if (!name || !username || !password || !phone) {
            toast({ variant: "destructive", title: "Error", description: "Please fill all fields." });
            return;
        }
        setIsLoading(true);

        setTimeout(() => {
            const signUpSuccess = onSignUp({ name, username, password, phone });
            setIsLoading(false);
            if(signUpSuccess) {
                onSwitchTab('signin');
            }
        }, 1000);
    };
    
    return (
        <form onSubmit={handleSignUpAction} className="space-y-6">
            <div className="space-y-2">
                 <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 py-6" required/>
                </div>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 py-6" required/>
                </div>
                 <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 py-6" required/>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 py-6" required/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <Button type="submit" className="w-full py-6 text-lg gradient-primary text-white" disabled={isLoading}>
                {isLoading ? (
                    <><LoaderCircle className="mr-2 h-5 w-5 animate-spin" />Creating Account...</>
                ) : ( "Create Account" )}
            </Button>
        </form>
    );
};

export default function Auth({ onLogin, onSignUp }) {
    const [role, setRole] = useState('tenant');
    const [activeTab, setActiveTab] = useState('signin');

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-scale">
                <CardHeader className="text-center">
                    <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-white h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-headline">Welcome to EstateFlow</CardTitle>
                    <CardDescription>
                         {activeTab === 'signin' ? 'Sign in to your account' : 'Create a new tenant account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        <TabsContent value="signin" className="pt-6">
                            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg mb-6">
                                <button onClick={() => setRole('tenant')} className={cn("py-2.5 rounded-md text-sm font-medium transition-colors", role === 'tenant' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-background/50')}>
                                    <User className="inline-block mr-2 h-4 w-4" /> I'm a Tenant
                                </button>
                                <button onClick={() => setRole('admin')} className={cn("py-2.5 rounded-md text-sm font-medium transition-colors", role === 'admin' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-background/50')}>
                                    <Shield className="inline-block mr-2 h-4 w-4" /> I'm an Admin
                                </button>
                            </div>
                            <LoginForm onLogin={onLogin} role={role} />
                        </TabsContent>
                        <TabsContent value="signup" className="pt-6">
                             <SignUpForm onSignUp={onSignUp} onSwitchTab={setActiveTab} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
