
"use client";

import { Check, Star, Building, FileText, FolderArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

const proFeatures = [
    { text: "Advanced Data Exports (PDF, CSV)", icon: FileText },
    { text: "Multiple Property Management", icon: Building },
    { text: "Document & Lease Management", icon: FolderArchive },
    { text: "AI-Powered Insights (Coming Soon)", icon: Star },
];

const freeFeatures = [
    "Manage Unlimited Tenants & Rooms",
    "Payment & Expense Tracking",
    "Tenant & Owner Portals",
    "Automated Reminders",
];

export default function Upgrade({ appState, setAppState }) {
    const { toast } = useToast();
    const isPro = appState.defaults.subscriptionPlan === 'pro';

    const handleUpgrade = () => {
        setAppState(prev => ({
            ...prev,
            defaults: {
                ...prev.defaults,
                subscriptionPlan: 'pro',
            }
        }));
        toast({
            title: "Upgrade Successful!",
            description: "You have unlocked all Pro features. Welcome to EstateFlow Pro!",
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Choose Your Plan</h1>
                <p className="text-muted-foreground mt-2">Unlock powerful features to manage your properties like a pro.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Free Plan Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle className="text-2xl">Standard</CardTitle>
                        <CardDescription>Perfect for managing a single property with all the essential tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><span className="text-4xl font-bold">₹0</span> / month</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {freeFeatures.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                         <Button variant="outline" className="w-full" disabled={!isPro}>
                            Your Current Plan
                         </Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan Card */}
                <Card className={cn(
                    "border-2 relative overflow-hidden",
                     isPro ? "border-green-500" : "border-primary"
                )}>
                    <div className={cn(
                        "absolute top-0 right-0 text-xs font-semibold text-white px-4 py-1 rounded-bl-lg",
                        isPro ? "bg-green-500" : "bg-primary"
                    )}>
                        {isPro ? "Current Plan" : "Recommended"}
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl">Pro Plan</CardTitle>
                        <CardDescription>For serious property owners who need advanced tools and analytics.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><span className="text-4xl font-bold">₹499</span> / month</p>
                         <ul className="space-y-2 text-sm">
                            {proFeatures.map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 font-medium">
                                    <feature.icon className="h-4 w-4 text-primary" />
                                    <span>{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full btn-gradient-glow" onClick={handleUpgrade} disabled={isPro}>
                            {isPro ? 'You are on Pro' : 'Upgrade to Pro'}
                         </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
