
"use client";

import { useState } from 'react';
import { Check, Star, X, Building, FileText, FolderArchive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const planFeatures = [
    { feature: "Manage Unlimited Tenants & Rooms", standard: true, pro: true, business: true },
    { feature: "Payment & Expense Tracking", standard: true, pro: true, business: true },
    { feature: "Tenant & Owner Portals", standard: true, pro: true, business: true },
    { feature: "Automated Reminders", standard: true, pro: true, business: true },
    { feature: "Advanced Data Exports (PDF, CSV)", standard: false, pro: true, business: true, icon: FileText },
    { feature: "Document & Lease Management", standard: false, pro: false, business: true, icon: FolderArchive },
    { feature: "Multiple Property Management", standard: false, pro: false, business: true, icon: Building },
];

const plans = {
    standard: {
        id: 'standard',
        name: 'Standard',
        price: 'Free',
        priceSuffix: '',
        description: 'Perfect for getting started and managing a single property efficiently.',
        cta: 'Your Current Plan',
        maxProperties: 1,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '₹499',
        priceSuffix: '/mo',
        description: 'For property owners who need advanced tools and reporting.',
        cta: 'Upgrade to Pro',
        maxProperties: 1,
    },
    business: {
        id: 'business',
        name: 'Business',
        price: '₹999',
        priceSuffix: '/mo',
        description: 'The ultimate solution for managing multiple properties seamlessly.',
        cta: 'Upgrade to Business',
        maxProperties: 10,
    }
}

export default function Upgrade({ appState, setAppState, setActiveTab }) {
    const { toast } = useToast();
    const currentPlanId = appState.defaults.subscriptionPlan || 'standard';
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);


    const handleUpgradeClick = (plan) => {
        setSelectedPlan(plan);
        setIsConfirmModalOpen(true);
    };

    const confirmUpgrade = () => {
        if (!selectedPlan) return;

        setAppState(prev => ({
            ...prev,
            defaults: {
                ...prev.defaults,
                subscriptionPlan: selectedPlan.id,
                maxProperties: selectedPlan.maxProperties,
            }
        }));

        toast({
            title: "Upgrade Successful!",
            description: `You are now subscribed to the ${selectedPlan.name} plan.`,
        });

        setIsConfirmModalOpen(false);
        setSelectedPlan(null);
        setActiveTab('dashboard');
    }

    const renderPlanCard = (plan, isCurrent) => (
        <Card key={plan.id} className={cn(
            "flex flex-col",
            isCurrent ? "border-2 border-primary shadow-lg shadow-primary/20" : "border-gray-200 dark:border-gray-800"
        )}>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div className="text-center">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.priceSuffix}</span>
                </div>
                <Separator />
                <ul className="space-y-4 text-sm">
                    {planFeatures.map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                            {item[plan.id] ? 
                                <Check className="h-5 w-5 text-green-500" /> : 
                                <X className="h-5 w-5 text-muted-foreground" />
                            }
                            <span className={cn(!item[plan.id] && "text-muted-foreground")}>
                                {item.feature}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                 <Button 
                    className={cn("w-full", isCurrent ? "" : "btn-gradient-glow")}
                    variant={isCurrent ? "outline" : "default"}
                    onClick={() => handleUpgradeClick(plan)} 
                    disabled={isCurrent}
                >
                    {isCurrent ? "Your Current Plan" : plan.cta}
                    {!isCurrent && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Choose the plan that's right for you</h1>
                <p className="text-muted-foreground mt-2">Unlock powerful features to manage your properties like a pro.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {Object.values(plans).map(plan => renderPlanCard(plan, plan.id === currentPlanId))}
            </div>

            <AlertDialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Your Upgrade</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to upgrade to the <strong>{selectedPlan?.name}</strong> plan for <strong>{selectedPlan?.price}{selectedPlan?.priceSuffix}</strong>. 
                        This action will simulate a successful payment and update your subscription.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPlan(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmUpgrade}>
                        Confirm &amp; Pay
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
