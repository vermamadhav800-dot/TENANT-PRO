
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, CreditCard, Calendar, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import AppLogo from './AppLogo';

export default function PaymentGateway({ isOpen, onOpenChange, plan, onPaymentSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = (event) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center items-center gap-4 mb-4">
            <AppLogo className="w-12 h-12" iconClassName="w-7 h-7" />
            <div>
              <DialogTitle className="text-2xl">Complete Your Purchase</DialogTitle>
              <DialogDescription>
                You are upgrading to the <span className="font-bold text-primary">{plan.name}</span> plan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Plan: {plan.name}</span>
              <span className="font-bold text-lg">{plan.price}{plan.priceSuffix}</span>
            </div>
             <p className="text-sm text-muted-foreground mt-1">Billed monthly. You can cancel anytime.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="card-number" placeholder="0000 0000 0000 0000" className="pl-10" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
               <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="expiry-date" placeholder="MM/YY" className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="cvc" placeholder="123" className="pl-10" required />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full btn-gradient-glow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${plan.price}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
