
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Approvals({ appState, setAppState }) {
  const { pendingApprovals = [], tenants } = appState;
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(null);

  const handleApprove = (approvalId) => {
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (!approval) return;

    // 1. Create a new payment record
    const newPayment = {
      id: Date.now().toString(),
      tenantId: approval.tenantId,
      amount: approval.amount,
      date: approval.date,
      method: 'UPI', 
    };

    // 2. Remove the request from pending approvals
    const updatedApprovals = pendingApprovals.filter(a => a.id !== approvalId);

    // 3. Update the app state
    setAppState(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment],
      pendingApprovals: updatedApprovals,
    }));

    toast({ title: "Payment Approved", description: "The payment has been successfully recorded." });
  };

  const handleReject = (approvalId) => {
    setAppState(prev => ({
      ...prev,
      pendingApprovals: prev.pendingApprovals.filter(a => a.id !== approvalId),
    }));
    toast({ variant: "destructive", title: "Payment Rejected", description: "The approval request has been removed." });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-headline">Payment Approvals</h2>
        <p className="text-muted-foreground">Review and confirm payments submitted by tenants.</p>
      </div>

      {pendingApprovals.length === 0 ? (
         <Card className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
            <Inbox className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p>There are no pending payment approvals right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingApprovals.map(approval => {
            const tenant = tenants.find(t => t.id === approval.tenantId);
            return (
              <Card key={approval.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                     <Avatar className="w-11 h-11 border">
                        <AvatarImage src={tenant?.profilePhotoUrl} alt={tenant?.name} />
                        <AvatarFallback>{tenant?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{tenant?.name || 'Unknown Tenant'}</CardTitle>
                        <CardDescription>Room {tenant?.unitNo}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-2xl font-bold">{approval.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                   <div>
                    <p className="text-sm text-muted-foreground">Date Submitted</p>
                    <p className="font-medium">{format(new Date(approval.date), 'dd MMM, yyyy - hh:mm a')}</p>
                  </div>
                  <div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <img 
                                src={approval.screenshotUrl} 
                                alt="Payment Screenshot" 
                                className="w-full h-auto rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(approval.screenshotUrl)}
                            />
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                             <DialogHeader>
                                <DialogTitle>Payment Screenshot</DialogTitle>
                            </DialogHeader>
                            <img src={selectedImage} alt="Payment Screenshot Full" className="w-full h-auto rounded-md" />
                        </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
                <CardContent className="grid grid-cols-2 gap-2 pt-0">
                    <Button variant="destructive" onClick={() => handleReject(approval.id)}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="btn-gradient-glow" onClick={() => handleApprove(approval.id)}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
