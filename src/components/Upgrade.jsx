
"use client";

import { Check, Star, X, Building, FileText, FolderArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

const planFeatures = [
    { feature: "Manage Unlimited Tenants & Rooms", free: true, pro: true },
    { feature: "Payment & Expense Tracking", free: true, pro: true },
    { feature: "Tenant & Owner Portals", free: true, pro: true },
    { feature: "Automated Reminders", free: true, pro: true },
    { feature: "Advanced Data Exports (PDF, CSV)", free: false, pro: true, icon: FileText },
    { feature: "Multiple Property Management", free: false, pro: true, icon: Building },
    { feature: "Document & Lease Management", free: false, pro: true, icon: FolderArchive },
    { feature: "AI-Powered Insights", free: false, pro: true, soon: true, icon: Star },
];

export default function Upgrade({ appState, setAppState, setActiveTab }) {
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
        setActiveTab('dashboard');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Choose the plan that's right for you</h1>
                <p className="text-muted-foreground mt-2">Unlock powerful features to manage your properties like a pro.</p>
            </div>
            
            <Card className="border-2 border-primary shadow-lg shadow-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Feature List Column */}
                    <div className="col-span-1 p-6 space-y-4 hidden md:block">
                        <h3 className="text-lg font-semibold">&nbsp;</h3>
                        <div className="text-lg font-semibold text-right pr-4 mt-16">Features</div>
                        <Separator />
                        <ul className="space-y-5 text-right pr-4">
                             {planFeatures.map((item, i) => (
                                <li key={i} className="font-medium h-8 flex justify-end items-center gap-2">
                                    {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                                    <span>{item.feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Plans Columns */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2">
                        {/* Standard Plan */}
                        <div className="p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-center">Standard</h3>
                            <div className="text-center mt-4">
                                <span className="text-4xl font-bold">Free</span>
                            </div>
                            <Button variant="outline" className="w-full mt-6" disabled={!isPro}>
                                Your Current Plan
                            </Button>
                            <Separator className="my-6" />
                             <ul className="space-y-5 text-center flex-grow">
                                {planFeatures.map((item, i) => (
                                    <li key={i} className="h-8 flex justify-center items-center">
                                        <span className="md:hidden text-xs text-muted-foreground mr-2">{item.feature}: </span>
                                        {item.free ? <Check className="h-6 w-6 text-green-500" /> : <X className="h-6 w-6 text-muted-foreground" />}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-6 flex flex-col bg-primary/5 rounded-r-2xl border-l">
                            <h3 className="text-xl font-bold text-center text-primary">Pro</h3>
                             <div className="text-center mt-4">
                                <span className="text-4xl font-bold">₹499</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                             <Button className="w-full mt-6 btn-gradient-glow" onClick={handleUpgrade} disabled={isPro}>
                                {isPro ? <><Check className="mr-2"/> Subscribed</> : <> <Star className="mr-2 h-4 w-4"/> Upgrade to Pro</>}
                             </Button>
                            <Separator className="my-6" />
                             <ul className="space-y-5 text-center flex-grow">
                                {planFeatures.map((item, i) => (
                                    <li key={i} className="h-8 flex justify-center items-center">
                                         <span className="md:hidden text-xs text-muted-foreground mr-2">{item.feature}: </span>
                                        {item.pro ? <Check className="h-6 w-6 text-primary" /> : <X className="h-6 w-6 text-muted-foreground" />}
                                        {item.soon && <span className="text-xs text-primary ml-2">(Soon)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
