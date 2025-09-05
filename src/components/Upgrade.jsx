
"use client";

import { useState } from 'react';
import { Check, Star, X, Building, FileText, FolderArchive, ArrowRight, Wallet, Zap, MinusCircle, BrainCircuit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import PaymentGateway from './PaymentGateway';

const planFeatures = [
    { feature: "Tenant & Room Management", standard: true, pro: true, business: true },
    { feature: "Payment Tracking", standard: true, pro: true, business: true },
    { feature: "Tenant Portal", standard: true, pro: true, business: true },
    { feature: "Expense Tracking", standard: false, pro: true, business: true, icon: Wallet },
    { feature: "Automated Reminders", standard: false, pro: true, business: true, icon: Zap },
    { feature: "Advanced Data Exports (PDF, CSV)", standard: false, pro: true, business: true, icon: FileText },
    { feature: "Document & Lease Management", standard: false, pro: false, business: true, icon: FolderArchive },
];

const plans = {
    standard: {
        id: 'standard',
        name: 'Standard',
        price: 'Free',
        priceSuffix: '',
        description: 'Perfect for getting started with basic management needs.',
        cta: 'Your Current Plan',
        priceAmount: 0,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '499',
        priceSuffix: '/mo',
        description: 'For property owners who need advanced tools and automation.',
        cta: 'Upgrade to Pro',
        priceAmount: 499,
    },
    business: {
        id: 'business',
        name: 'Business',
        price: '999',
        priceSuffix: '/mo',
        description: 'The ultimate solution for scaling your property business.',
        cta: 'Upgrade to Business',
        priceAmount: 999,
    }
}

export default function Upgrade({ appState, setAppState, setActiveTab }) {
    const { toast } = useToast();
    const currentPlanId = appState.defaults.subscriptionPlan || 'standard';
    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);


    const handlePlanActionClick = (plan) => {
        if (plan.id === 'standard') { // Downgrade to free
            setAppState(prev => ({
                ...prev,
                defaults: {
                    ...prev.defaults,
                    subscriptionPlan: 'standard',
                }
            }));
            toast({
                title: "Plan Changed Successfully!",
                description: `You have changed to the Standard plan.`,
            });
        } else { // Upgrade
            setSelectedPlan(plan);
            setIsGatewayOpen(true);
        }
    };

    const handlePaymentSuccess = () => {
        if (!selectedPlan) return;

        setAppState(prev => ({
            ...prev,
            defaults: {
                ...prev.defaults,
                subscriptionPlan: selectedPlan.id,
            }
        }));

        toast({
            title: "Payment Successful & Plan Upgraded!",
            description: `You are now on the ${selectedPlan.name} plan.`,
        });

        setIsGatewayOpen(false);
        setSelectedPlan(null);
        setActiveTab('dashboard');
    }
    
    const getActionForPlan = (plan, isCurrent) => {
        if (isCurrent) {
             if (plan.id === 'standard') {
                return {
                    text: "Your Current Plan",
                    variant: "outline",
                    disabled: true,
                    onClick: () => {}
                };
             }
             // For Pro/Business, we render a badge instead of a button.
             return null; 
        }
        
        const planOrder = { standard: 1, pro: 2, business: 3 };
        if (planOrder[currentPlanId] > planOrder[plan.id]) {
             return {
                text: "Downgrade Plan",
                variant: "secondary",
                disabled: false,
                onClick: () => handlePlanActionClick(plan),
                icon: <MinusCircle className="mr-2 h-4 w-4" />
            };
        }

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
        const isPro = plan.id === 'pro';
        const isPremium = plan.id === 'pro' || plan.id === 'business';
        const action = getActionForPlan(plan, isCurrent);

        return (
             <Card key={plan.id} className={cn(
                "flex flex-col glass-card transition-all duration-300 hover:border-primary/80 hover:shadow-primary/20 relative overflow-hidden",
                isCurrent && "border-2 border-primary shadow-lg shadow-primary/20",
                isCurrent && isPremium && "bg-gradient-to-br from-card to-primary/10",
                isPro && !isCurrent && "border-2 border-transparent lg:scale-105"
            )}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                    <div className="text-center flex items-baseline justify-center">
                        <span className="text-4xl font-extrabold">{plan.price !== 'Free' ? `₹${plan.price}` : 'Free'}</span>
                        {plan.price !== 'Free' && <span className="text-muted-foreground self-end mb-1 ml-1">{plan.priceSuffix}</span>}
                    </div>
                    <Separator className="bg-white/10"/>
                    <ul className="space-y-4 text-sm">
                        {planFeatures.map((item, i) => {
                            const FeatureIcon = item.icon || Check;
                            const isAvailable = item[plan.id] ?? false;
                            return(
                                <li key={i} className="flex items-center gap-3">
                                    {isAvailable ? 
                                        <FeatureIcon className="h-5 w-5 text-green-400" style={{filter: 'drop-shadow(0 0 5px currentColor)'}}/> : 
                                        <X className="h-5 w-5 text-muted-foreground/50" />
                                    }
                                    <span className={cn(!isAvailable && "text-muted-foreground/60")}>
                                        {item.feature}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>
                <CardFooter>
                     {action ? (
                        <Button 
                            className={cn("w-full", action.className)}
                            variant={action.variant}
                            onClick={action.onClick} 
                            disabled={action.disabled}
                        >
                            {action.icon && action.text !== "Upgrade to Pro" && action.text !== "Upgrade to Business" && action.icon}
                            {action.text}
                            {(action.text === "Upgrade to Pro" || action.text === "Upgrade to Business") && action.icon}
                        </Button>
                     ) : (
                        <div className="w-full h-10 flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold shadow-lg shadow-primary/20">
                           <Star className="mr-2 h-4 w-4 text-amber-300" /> Current Royalty Plan
                        </div>
                     )}
                </CardFooter>
            </Card>
        )
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold font-headline gradient-text">Choose the plan that’s right for you</h1>
                <p className="text-muted-foreground text-lg">Unlock powerful features to manage your properties like a pro.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
               {Object.values(plans).map(plan => renderPlanCard(plan))}
            </div>

            {selectedPlan && (
                <PaymentGateway
                    isOpen={isGatewayOpen}
                    onOpenChange={setIsGatewayOpen}
                    plan={selectedPlan}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
