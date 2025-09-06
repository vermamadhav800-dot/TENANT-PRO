
"use client";

import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import PaymentGateway from './PaymentGateway';

const ownerPlanFeatures = [
    { feature: "Tenant & Room Management", standard: true, pro: true, business: true },
    { feature: "Payment Tracking", standard: true, pro: true, business: true },
    { feature: "Tenant Portal", standard: true, pro: true, business: true },
    { feature: "Expense Tracking", standard: true, pro: true, business: true },
    { feature: "Automated Reminders", standard: false, pro: true, business: true },
    { feature: "Advanced Data Exports (PDF, CSV)", standard: false, pro: true, business: true },
    { feature: "AI-Powered Rent Optimization", standard: false, pro: true, business: true },
    { feature: "All Pro Features", standard: false, pro: false, business: true},
    { feature: "Document & Lease Management", standard: false, pro: false, business: true },
    { feature: "AI Financial Analyst Chat", standard: false, pro: false, business: true },
];


const tenantPlanFeatures = [
    { feature: "View Bills & Pay Rent", free: true, plus: true, premium: true },
    { feature: "Submit Maintenance Requests", free: true, plus: true, premium: true },
    { feature: "Access Notice Board", free: true, plus: true, premium: true },
    { feature: "Download Detailed Receipts", free: false, plus: true, premium: true },
    { feature: "View Full Payment History", free: false, plus: true, premium: true },
    { feature: "Access All Your Documents", free: false, pro: false, premium: true },
];

const ownerPlans = {
    standard: { id: 'standard', name: 'Standard', price: 'Free', priceSuffix: '', description: 'Perfect for getting started with basics', cta: 'Get Started', priceAmount: 0 },
    pro: { id: 'pro', name: 'Pro', price: '499', priceSuffix: '/mo', description: 'For property owners needing automation', cta: 'Upgrade to Pro', priceAmount: 499 },
    business: { id: 'business', name: 'Business', price: '999', priceSuffix: '/mo', description: 'Scaling your property business', cta: 'Scale with Business', priceAmount: 999 }
};

const tenantPlans = {
    free: { id: 'free', name: 'Basic', price: 'Free', priceSuffix: '', description: 'Essential features for every tenant.', cta: 'Your Current Plan', priceAmount: 0 },
    plus: { id: 'plus', name: 'Plus', price: '49', priceSuffix: '/mo', description: 'Get better tracking of your payments and documents.', cta: 'Upgrade to Plus', priceAmount: 49 },
    premium: { id: 'premium', name: 'Premium', price: '99', priceSuffix: '/mo', description: 'Unlock all features for the ultimate convenience.', cta: 'Upgrade to Premium', priceAmount: 99 }
};


export default function Upgrade({ appState, setAppState, setActiveTab, userType = 'owner', currentTenant, onUpgradeSuccess }) {
    const { toast } = useToast();
    const plans = userType === 'owner' ? ownerPlans : tenantPlans;
    const planFeatures = userType === 'owner' ? ownerPlanFeatures : tenantPlanFeatures;
    
    const currentPlanId = userType === 'owner' ? (appState.defaults.subscriptionPlan || 'standard') : (currentTenant?.subscriptionPlan || 'free');

    const [isGatewayOpen, setIsGatewayOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);


    const handlePlanActionClick = (plan) => {
        if (plan.priceAmount === 0) { // Downgrade to free
             if (userType === 'owner') {
                setAppState(prev => ({
                    ...prev,
                    defaults: { ...prev.defaults, subscriptionPlan: 'standard' }
                }));
            } else {
                 setAppState(prev => ({
                    ...prev,
                    tenants: prev.tenants.map(t => t.id === currentTenant.id ? { ...t, subscriptionPlan: 'free' } : t)
                }));
            }
            toast({
                title: "Plan Changed Successfully!",
                description: `You have changed to the ${plan.name} plan.`,
            });
            if (onUpgradeSuccess) onUpgradeSuccess();

        } else { // Upgrade
            setSelectedPlan(plan);
            setIsGatewayOpen(true);
        }
    };

    const handlePaymentSuccess = () => {
        if (!selectedPlan) return;

         if (userType === 'owner') {
            setAppState(prev => ({
                ...prev,
                defaults: { ...prev.defaults, subscriptionPlan: selectedPlan.id }
            }));
        } else {
            setAppState(prev => ({
                ...prev,
                tenants: prev.tenants.map(t => t.id === currentTenant.id ? { ...t, subscriptionPlan: selectedPlan.id } : t)
            }));
        }

        toast({
            title: "Payment Successful & Plan Upgraded!",
            description: `You are now on the ${selectedPlan.name} plan.`,
        });

        setIsGatewayOpen(false);
        setSelectedPlan(null);
        if (onUpgradeSuccess) onUpgradeSuccess();
    }
    
    const getButtonForPlan = (plan, isCurrent) => {
        const planOrder = { standard: 1, pro: 2, business: 3, free: 1, plus: 2, premium: 3 };

        if (isCurrent) {
            return (
                <Button className="w-full text-lg py-6" variant="outline" disabled>
                   Your Current Plan
                </Button>
            );
        }
        
        let buttonClass = '';
        if (plan.id === 'standard' || plan.id === 'free') buttonClass = 'btn-gradient-green';
        if (plan.id === 'pro' || plan.id === 'plus') buttonClass = 'btn-gradient-blue';
        if (plan.id === 'business' || plan.id === 'premium') buttonClass = 'btn-gradient-orange';

        return (
            <Button className={cn("w-full text-lg py-6", buttonClass)} onClick={() => handlePlanActionClick(plan)}>
                {plan.cta}
            </Button>
        );
    };

    const renderPlanCard = (plan) => {
        const isCurrent = plan.id === currentPlanId;
        const isHighlighted = plan.id === 'pro' || plan.id === 'plus';

        return (
             <Card key={plan.id} className={cn(
                "flex flex-col bg-[#111118]/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-4 relative overflow-hidden shadow-lg border border-white/10",
                 isHighlighted && "ring-2 ring-primary/60 ring-offset-2 ring-offset-black",
                 plan.id === 'business' && "ring-2 ring-red-500/50 ring-offset-2 ring-offset-black",
                 plan.id === 'standard' && "ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-black"
            )}>
                 {isHighlighted && (
                    <div className="absolute top-4 -right-12 rotate-45 bg-primary text-primary-foreground text-xs font-bold px-12 py-1.5">Popular</div>
                 )}
                <CardHeader className="text-center pt-8">
                    <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-6">
                    <div className="text-center flex items-baseline justify-center">
                        <span className={cn(
                            "text-5xl font-extrabold", 
                            plan.price === 'Free' ? 'text-green-400' : 'text-foreground'
                        )}>
                            {plan.price !== 'Free' ? `₹${plan.price}` : 'Free'}
                        </span>
                        {plan.price !== 'Free' && <span className="text-muted-foreground self-end mb-1 ml-1">{plan.priceSuffix}</span>}
                    </div>
                    
                    <ul className="space-y-3 text-sm text-left">
                        {planFeatures.map((item, i) => {
                             const planKey = Object.keys(item).find(key => key === plan.id);
                             if (!planKey || !item[planKey]) return null;

                            return(
                                <li key={i} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-green-400 shrink-0"/>
                                    <span className="text-foreground">
                                        {item.feature}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>
                <CardFooter className="pt-6 px-6 pb-8 mt-auto">
                    {getButtonForPlan(plan, isCurrent)}
                </CardFooter>
            </Card>
        )
    };

    return (
        <div className="w-full min-h-screen dark-bg-futuristic text-white py-12">
            <div className="max-w-7xl mx-auto space-y-12 p-4">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold font-headline">Choose the plan that’s right for you</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Unlock powerful features to manage your properties like a pro.
                    </p>
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
        </div>
    );
}
