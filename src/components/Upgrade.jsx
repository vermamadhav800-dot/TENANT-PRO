
"use client";

import { useState } from 'react';
import { Check, Star, X, Building, FileText, FolderArchive, ArrowRight, Wallet, Zap, MinusCircle } from 'lucide-react';
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
    { feature: "Tenant & Room Management", standard: true, pro: true, business: true },
    { feature: "Payment Tracking", standard: true, pro: true, business: true },
    { feature: "Tenant Portal", standard: true, pro: true, business: true },
    { feature: "Expense Tracking", standard: false, pro: true, business: true },
    { feature: "Automated Reminders", standard: false, pro: true, business: true },
    { feature: "Advanced Data Exports (PDF, CSV)", standard: false, pro: true, business: true },
    { feature: "Document & Lease Management", standard: false, pro: false, business: true },
    { feature: "Multiple Property Management", standard: false, pro: false, business: true },
];

const plans = {
    standard: {
        id: 'standard',
        name: 'Standard',
        price: 'Free',
        priceSuffix: '',
        description: 'Perfect for getting started with basic management needs.',
        cta: 'Your Current Plan',
        maxProperties: 1,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '₹499',
        priceSuffix: '/mo',
        description: 'For property owners who need advanced tools and automation.',
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


    const handlePlanActionClick = (plan) => {
        setSelectedPlan(plan);
        setIsConfirmModalOpen(true);
    };

    const confirmPlanChange = () => {
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
            title: "Plan Changed Successfully!",
            description: `You are now on the ${selectedPlan.name} plan.`,
        });

        setIsConfirmModalOpen(false);
        setSelectedPlan(null);
        if (selectedPlan.id !== 'standard') {
            setActiveTab('dashboard');
        }
    }
    
    const getActionForPlan = (plan, isCurrent) => {
        if (isCurrent) {
            return {
                text: "Your Current Plan",
                variant: "outline",
                disabled: true,
                onClick: () => {}
            };
        }
        
        // If current plan is higher than this plan, it's a downgrade
        const planOrder = { standard: 1, pro: 2, business: 3 };
        if (planOrder[currentPlanId] > planOrder[plan.id]) {
             return {
                text: "Change Plan",
                variant: "secondary",
                disabled: false,
                onClick: () => handlePlanActionClick(plan),
                icon: <MinusCircle className="mr-2 h-4 w-4" />
            };
        }

        // Otherwise, it's an upgrade
        return {
            text: plan.cta,
            variant: "default",
            className: "btn-gradient-glow",
            disabled: false,
            onClick: () => handlePlanActionClick(plan),
            icon: <ArrowRight className="ml-2 h-4 w-4" />
        };
    };

    const renderPlanCard = (plan) => {
        const isCurrent = plan.id === currentPlanId;
        const action = getActionForPlan(plan, isCurrent);

        return (
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
                        className={cn("w-full", action.className)}
                        variant={action.variant}
                        onClick={action.onClick} 
                        disabled={action.disabled}
                    >
                        {action.icon && action.text !== "Upgrade to Pro" && action.icon}
                        {action.text}
                        {action.icon && action.text === "Upgrade to Pro" && action.icon}
                        {action.icon && action.text === "Upgrade to Business" && action.icon}
                    </Button>
                </CardFooter>
            </Card>
        )
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Choose the plan that's right for you</h1>
                <p className="text-muted-foreground mt-2">Unlock powerful features to manage your properties like a pro.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
               {Object.values(plans).map(plan => renderPlanCard(plan))}
            </div>

            <AlertDialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to change your plan to <strong>{selectedPlan?.name}</strong>
                        {selectedPlan?.price !== 'Free' && ` for ${selectedPlan?.price}${selectedPlan?.priceSuffix}`}. 
                        This action will simulate a successful transaction and update your subscription.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPlan(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmPlanChange}>
                        Confirm & Proceed
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
