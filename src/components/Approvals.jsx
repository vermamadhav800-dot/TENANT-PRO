
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Inbox, UserCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function PaymentApprovals({ appState, setAppState }) {
    const { pendingApprovals = [], tenants } = appState;
    const { toast } = useToast();
    const [selectedImage, setSelectedImage] = useState(null);

    const handleApprove = (approvalId) => {
        const approval = pendingApprovals.find(a => a.id === approvalId);
        if (!approval) return;

        const newPayment = {
            id: Date.now().toString(),
            tenantId: approval.tenantId,
            amount: approval.amount,
            date: approval.date,
            method: 'UPI', 
        };

        const updatedApprovals = pendingApprovals.filter(a => a.id !== approvalId);

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

    if (pendingApprovals.length === 0) {
        return (
            <Card className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                <Inbox className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Pending Payments</h3>
                <p>There are no payment approvals to review right now.</p>
            </Card>
        );
    }

    return (
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
                                <p className="text-2xl font-bold">₹{approval.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                );
            })}
        </div>
    );
}

function UpdateRequests({ appState, setAppState }) {
    const { updateRequests = [], tenants } = appState;
    const { toast } = useToast();

    const handleApprove = (requestId) => {
        const request = updateRequests.find(r => r.id === requestId);
        if (!request) return;

        setAppState(prev => ({
            ...prev,
            tenants: prev.tenants.map(t => 
                t.id === request.tenantId ? { ...t, ...request.requestedChanges } : t
            ),
            updateRequests: prev.updateRequests.filter(r => r.id !== requestId),
        }));

        toast({ title: "Update Approved", description: "Tenant details have been successfully updated." });
    };
    
    const handleReject = (requestId) => {
        setAppState(prev => ({
            ...prev,
            updateRequests: prev.updateRequests.filter(r => r.id !== requestId),
        }));
        toast({ variant: "destructive", title: "Update Rejected", description: "The update request has been removed." });
    };

    if (updateRequests.length === 0) {
        return (
            <Card className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                <Inbox className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Update Requests</h3>
                <p>There are no pending profile update requests from tenants.</p>
            </Card>
        );
    }
    
    return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updateRequests.map(request => {
                const tenant = tenants.find(t => t.id === request.tenantId);
                const changes = Object.entries(request.requestedChanges).filter(([key, value]) => value !== tenant[key]);
                
                if (!tenant) return null;

                return (
                    <Card key={request.id} className="glass-card">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border">
                                    <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                                    <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                                    <CardDescription>Room {tenant.unitNo}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <p className="text-sm text-muted-foreground">Submitted: {format(new Date(request.submittedAt), 'dd MMM, yyyy')}</p>
                           {changes.map(([key, value]) => (
                               <div key={key}>
                                   <p className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                                   <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground line-through">{tenant[key]}</span>
                                        <ArrowRight className="h-4 w-4 text-primary"/>
                                        <span className="font-medium">{value}</span>
                                   </div>
                               </div>
                           ))}
                        </CardContent>
                        <CardContent className="grid grid-cols-2 gap-2 pt-0">
                            <Button variant="destructive" onClick={() => handleReject(request.id)}>
                                <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button className="btn-gradient-glow" onClick={() => handleApprove(request.id)}>
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
         </div>
    )
}


function MaintenanceRequests({ appState, setAppState }) {
    const { maintenanceRequests = [], tenants } = appState;
    const { toast } = useToast();

    const handleStatusChange = (requestId, newStatus) => {
        setAppState(prev => ({
            ...prev,
            maintenanceRequests: prev.maintenanceRequests.map(req => 
                req.id === requestId ? { ...req, status: newStatus } : req
            ),
        }));
        toast({ title: "Status Updated", description: `Request status has been changed to ${newStatus}.` });
    };
    
    if (maintenanceRequests.length === 0) {
        return (
            <Card className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                <Inbox className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-xl font-semibold mb-2">All Clear!</h3>
                <p>There are no maintenance requests at the moment.</p>
            </Card>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenanceRequests.map(request => {
                const tenant = tenants.find(t => t.id === request.tenantId);
                return (
                    <Card key={request.id} className="glass-card">
                         <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-11 h-11 border">
                                    <AvatarImage src={tenant?.profilePhotoUrl} alt={tenant?.name} />
                                    <AvatarFallback>{tenant?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{tenant?.name || 'Unknown Tenant'}</CardTitle>
                                    <CardDescription>Room {request?.unitNo}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="font-semibold">{request.category}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p>{request.description}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Submitted</p>
                                <p className="font-medium">{format(new Date(request.submittedAt), 'dd MMM, yyyy - hh:mm a')}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 pt-0">
                           <div className="w-full">
                                <p className="text-sm text-muted-foreground mb-1">Status: <span className="font-semibold">{request.status}</span></p>
                                <select 
                                    className="w-full p-2 border rounded-md"
                                    value={request.status}
                                    onChange={(e) => handleStatusChange(request.id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}


export default function Approvals({ appState, setAppState }) {
  const pendingApprovalsCount = appState.pendingApprovals?.length || 0;
  const pendingMaintenanceCount = appState.maintenanceRequests?.filter(r => r.status === 'Pending').length || 0;
  const pendingUpdateRequestsCount = appState.updateRequests?.length || 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-headline">Requests & Approvals</h2>
        <p className="text-muted-foreground">Manage payment approvals and maintenance requests.</p>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payments">
                Payment Approvals
                {pendingApprovalsCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{pendingApprovalsCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="maintenance">
                Maintenance
                {pendingMaintenanceCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{pendingMaintenanceCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="updates">
                Update Requests
                {pendingUpdateRequestsCount > 0 && <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{pendingUpdateRequestsCount}</span>}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-6">
            <PaymentApprovals appState={appState} setAppState={setAppState} />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-6">
            <MaintenanceRequests appState={appState} setAppState={setAppState} />
        </TabsContent>
        <TabsContent value="updates" className="mt-6">
            <UpdateRequests appState={appState} setAppState={setAppState} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
