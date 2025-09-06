
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
    "Automated Payment Reminders",
    "Advanced Data Exports (PDF, CSV)",
    "Financial Insights & Trends",
    "Electricity Bill Management",
    "Full Data Backup",
];

const UpgradeAd = ({ isOpen, onOpenChange, onUpgrade, onContinue }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 border-0 bg-transparent shadow-none" closeButton={false}>
                <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 bg-card">
                    <div className="absolute inset-0 dark-bg-futuristic opacity-50"></div>
                    <div className="relative p-8 text-center text-white">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Upgrade to Pro</DialogTitle>
                        </DialogHeader>
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                            <Star className="text-black h-12 w-12" />
                        </div>

                        <h2 className="text-3xl font-bold font-headline mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                            Unlock Your Property's Full Potential
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Go beyond the basics. Upgrade to the Pro plan to access powerful features that save you time and maximize your profit.
                        </p>

                        <div className="space-y-3 text-left mb-8">
                            {PRO_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <Check className="h-5 w-5 text-green-400 shrink-0" />
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button size="lg" className="w-full text-lg h-12 font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105" onClick={onUpgrade}>
                                Upgrade to Pro Now
                            </Button>
                            <Button variant="link" className="text-muted-foreground" onClick={onContinue}>
                                Continue to Free Version
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeAd;
