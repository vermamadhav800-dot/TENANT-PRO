
"use client";

import { useState, useMemo, useEffect } from 'react';
import { Home, IndianRupee, User, Menu, X, Sun, Moon, LogOut, FileText, BadgeCheck, BadgeAlert, QrCode, ExternalLink, Upload, Zap, Bell, MessageSquare, Wrench, Megaphone, Clock, Star, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format, formatDistanceToNow } from 'date-fns';
import AppLogo from './AppLogo';
import { useToast } from "@/hooks/use-toast";
import RentReceipt from './RentReceipt';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';


const TenantProfile = ({ tenant }) => (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Your personal information on record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                        <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-xl font-semibold">{tenant.name}</h3>
                        <p className="text-muted-foreground">{tenant.username}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                        <span className="font-semibold">Phone Number</span>
                        <span>{tenant.phone}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold">Aadhaar Number</span>
                        <span>XXXX-XXXX-{tenant.aadhaar.slice(-4)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="ml-auto">Request Update</Button>
            </CardFooter>
        </Card>
    </div>
);

const RentAndPayments = ({ tenant, payments, setAppState, room, appState }) => {
    const { toast } = useToast();
    const [showReceipt, setShowReceipt] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentView, setPaymentView] = useState('default'); // 'default', 'qr'

    const { upiId: adminUpiId } = appState.defaults || {};
    const ownerDetails = appState.MOCK_USER_INITIAL || {};
    const adminQrCodeUrl = appState.defaults?.qrCodeUrl;


    const { electricityBillShare, totalCharges, paidThisMonth, amountDue } = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        if (!room) return { electricityBillShare: 0, totalCharges: tenant.rentAmount, paidThisMonth: 0, amountDue: tenant.rentAmount };

        const monthlyCharges = (tenant.otherCharges || [])
            .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
            .reduce((sum, c) => sum + c.amount, 0);

        const charges = tenant.rentAmount + monthlyCharges;
        
        const currentMonthPayments = payments
          .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
          .reduce((sum, p) => sum + p.amount, 0);
        
        const finalAmountDue = charges - currentMonthPayments;

        return {
            electricityBillShare: monthlyCharges, // Assuming otherCharges is just electricity for now
            totalCharges: charges,
            paidThisMonth: currentMonthPayments,
            amountDue: finalAmountDue > 0 ? finalAmountDue : 0,
        };

    }, [room, tenant, payments, appState.defaults]);

    useEffect(() => {
        if(amountDue > 0) {
            setPaymentAmount(amountDue.toFixed(2));
        } else {
            setPaymentAmount('');
        }
    }, [amountDue]);

    const combinedPayments = useMemo(() => {
        const approved = payments
            .filter(p => p.tenantId === tenant.id)
            .map(p => ({...p, status: 'Approved'}));

        const pending = (appState.pendingApprovals || [])
            .filter(p => p.tenantId === tenant.id)
            .map(p => ({...p, status: 'Processing'}));

        return [...approved, ...pending].sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [payments, appState.pendingApprovals, tenant.id]);


    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentScreenshot(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentScreenshotPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmPayment = () => {
        if (!paymentScreenshot) {
            toast({
                variant: "destructive",
                title: "Screenshot Required",
                description: "Please upload a screenshot of your payment confirmation.",
            });
            return;
        }
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please enter a valid payment amount.",
            });
            return;
        }


        const newApprovalRequest = {
            id: Date.now().toString(),
            tenantId: tenant.id,
            amount: Number(paymentAmount),
            date: new Date().toISOString(),
            screenshotUrl: paymentScreenshotPreview, // In a real app, this would be an uploaded URL
        };

        setAppState(prev => ({
            ...prev,
            pendingApprovals: [...(prev.pendingApprovals || []), newApprovalRequest]
        }));
        
        setIsPaymentModalOpen(false);
        setPaymentScreenshot(null);
        setPaymentScreenshotPreview(null);
        setPaymentAmount('');
        setPaymentView('default');

        toast({
            title: "Submitted for Approval!",
            description: "Your payment has been submitted to the owner for verification. It will reflect once approved.",
        });
    };
    
    if (showReceipt) {
        return <RentReceipt receiptDetails={showReceipt} onBack={() => setShowReceipt(null)} appState={appState} />;
    }

    const upiLink = adminUpiId && amountDue > 0 ? `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(ownerDetails.name)}&am=${amountDue.toFixed(2)}&tn=${encodeURIComponent(`Rent for ${format(new Date(), 'MMMM yyyy')} for Room ${tenant.unitNo}`)}` : null;

    const renderPaymentDialogContent = () => {
        if (paymentView === 'qr') {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>Pay with QR Code</DialogTitle>
                         <DialogDescription>
                           Scan the code below, or use the button to pay directly with a UPI app. Then, take a screenshot and upload it for approval.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 text-center">
                        {adminQrCodeUrl ? 
                            <img src={adminQrCodeUrl} alt="Payment QR Code" className="w-64 h-64 mx-auto border rounded-lg" />
                            : <div className="w-64 h-64 mx-auto border rounded-lg flex items-center justify-center bg-muted text-muted-foreground">The owner has not provided a QR code.</div>
                        }
                        <p className="font-bold text-xl">Amount Due: ₹{amountDue.toFixed(2)}</p>
                        {upiLink && (
                            <a href={upiLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button size="lg" className="w-full">
                                    <ExternalLink className="mr-2 h-5 w-5" />
                                    Redirect to UPI App
                                </Button>
                            </a>
                        )}
                        <Button variant="link" onClick={() => setPaymentView('default')}>Back</Button>
                    </div>
                </>
            );
        }

        return (
            <>
                <DialogHeader>
                    <DialogTitle>Complete Your Payment</DialogTitle>
                    <DialogDescription>
                       Step 1: Use an option below or your preferred method to pay.
                       Step 2: Enter the amount you paid and take a screenshot.
                       Step 3: Upload the screenshot here and submit for approval.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {upiLink ? (
                            <a href={upiLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button size="lg" className="w-full h-full">
                                    <ExternalLink className="mr-2 h-5 w-5" />
                                    Pay via UPI App
                                </Button>
                            </a>
                        ) : <div className="p-4 bg-muted rounded-md text-center text-sm text-muted-foreground">UPI App payment not configured.</div>}
                        <Button size="lg" variant="outline" className="w-full h-full" onClick={() => setPaymentView('qr')} disabled={!adminQrCodeUrl}>
                           <QrCode className="mr-2 h-5 w-5" />
                           Pay with QR Code
                       </Button>
                    </div>
                    {(!adminQrCodeUrl && !upiLink) && (
                         <p className="text-amber-600 text-center text-sm bg-amber-50 p-2 rounded-md">The owner has not configured any online payment methods.</p>
                    )}

                    <div className="space-y-2 pt-4">
                        <Label htmlFor="payment-amount">Amount Paid (₹)</Label>
                        <Input 
                            id="payment-amount" 
                            type="number" 
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="payment-screenshot">Upload Payment Screenshot</Label>
                        <Input id="payment-screenshot" type="file" accept="image/*" onChange={handleFileChange} />
                        {paymentScreenshotPreview && (
                            <div className="mt-2 text-center">
                                <img src={paymentScreenshotPreview} alt="Payment screenshot preview" className="max-h-48 mx-auto rounded-md border" />
                                <p className="text-xs text-muted-foreground mt-1">Screenshot ready for upload.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <DialogFooter>
                    <Button onClick={handleConfirmPayment} className="w-full" disabled={!paymentScreenshot || !paymentAmount}>
                        Submit for Approval
                    </Button>
                </DialogFooter>
            </>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>This Month's Bill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                         <div>
                            <p className="text-sm text-muted-foreground">Base Rent</p>
                            <p className="text-lg font-bold">₹{tenant.rentAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="h-4 w-4"/> Other Charges</p>
                            <p className="text-lg font-bold">₹{electricityBillShare.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><BadgeCheck className="h-4 w-4 text-green-500"/> Amount Paid</p>
                            <p className="text-lg font-bold text-green-600">₹{paidThisMonth.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                         <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><BadgeAlert className="h-4 w-4 text-red-500"/> Total Charges</p>
                            <p className="text-lg font-bold">₹{totalCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <p className="text-lg font-semibold">Final Amount Due</p>
                        <p className="text-3xl font-bold text-primary">₹{amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                </CardContent>
                <CardFooter>
                     {amountDue > 0 ? (
                        <Dialog open={isPaymentModalOpen} onOpenChange={(isOpen) => {
                            setIsPaymentModalOpen(isOpen);
                            if (!isOpen) setPaymentView('default'); // Reset view on close
                        }}>
                             <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto ml-auto btn-gradient-glow">
                                    Pay Amount Due
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                {renderPaymentDialogContent()}
                            </DialogContent>
                        </Dialog>
                    ) : (
                         <div className="w-full text-center font-semibold text-green-600 border border-green-500 bg-green-50 rounded-lg p-3">
                            All dues for this month have been cleared!
                        </div>
                    )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>A record of all your approved payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status / Method</TableHead>
                                <TableHead className="text-right">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {combinedPayments.length > 0 ? (
                                combinedPayments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), 'dd MMMM, yyyy')}</TableCell>
                                        <TableCell className="font-medium">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                        <TableCell>
                                            {payment.status === 'Processing' ? (
                                                <span className="flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                   <Clock className="mr-2 h-3 w-3" />
                                                   Processing
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{payment.method}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setShowReceipt({ payment, tenant, room })}
                                                disabled={payment.status === 'Processing'}
                                            >
                                                <FileText className="h-4 w-4 mr-2" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="text-center h-24 text-muted-foreground">
                                        You haven't made any payments yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const TenantHome = ({ tenant, payments, room, appState }) => {
    const { amountDue } = useMemo(() => {
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        if (!room) return { amountDue: tenant.rentAmount };

        const monthlyCharges = (tenant.otherCharges || [])
            .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
            .reduce((sum, c) => sum + c.amount, 0);

        const totalCharges = tenant.rentAmount + monthlyCharges;

        const paidThisMonth = payments
            .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
            .reduce((sum, p) => sum + p.amount, 0);
        
        const finalAmountDue = totalCharges - paidThisMonth;
        
        return {
            amountDue: finalAmountDue > 0 ? finalAmountDue : 0,
        };

    }, [room, tenant, payments]);

    const rentStatus = useMemo(() => {
        if (amountDue <= 0) return { label: 'Paid', color: "text-green-500", Icon: BadgeCheck };
        
        const dueDate = tenant.dueDate ? parseISO(tenant.dueDate) : new Date();
        const daysDiff = differenceInDays(new Date(), dueDate);
        
        if (daysDiff > 0) return { label: 'Overdue', color: "text-red-500", Icon: BadgeAlert };
        
        return { label: 'Upcoming', color: "text-yellow-500", Icon: BadgeAlert };
    }, [tenant.dueDate, amountDue]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Welcome back, {tenant.name ? tenant.name.split(' ')[0] : ''}!</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Rent Status</CardTitle>
                        <rentStatus.Icon className={cn("h-5 w-5", rentStatus.color)} />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", rentStatus.color)}>{rentStatus.label}</div>
                        <p className="text-xs text-muted-foreground">For {format(new Date(), 'MMMM yyyy')}</p>
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Next Due Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{amountDue ? amountDue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
                        <p className="text-xs text-muted-foreground">Due on: {tenant.dueDate ? format(parseISO(tenant.dueDate), 'dd MMMM yyyy') : 'Not Set'}</p>
                    </CardContent>
                </Card>
                 <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Lease Period</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-semibold">Room {tenant.unitNo || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                            {tenant.leaseStartDate ? format(parseISO(tenant.leaseStartDate), 'dd MMM yyyy') : 'N/A'} - {tenant.leaseEndDate ? format(parseISO(tenant.leaseEndDate), 'dd MMM yyyy') : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const Notifications = ({ tenant, appState, setAppState }) => {
    const tenantNotifications = useMemo(() => {
        return (appState.notifications || [])
            .filter(n => n.tenantId === tenant.id)
            .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [appState.notifications, tenant.id]);

    const handleMarkAsRead = (notificationId) => {
        setAppState(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => 
                n.id === notificationId ? { ...n, isRead: true } : n
            )
        }))
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Messages and alerts from your property manager.</CardDescription>
                </CardHeader>
                <CardContent>
                    {tenantNotifications.length > 0 ? (
                        <ul className="space-y-4">
                            {tenantNotifications.map(notification => (
                                <li key={notification.id} className={cn("p-4 rounded-lg flex items-start gap-4", notification.isRead ? 'bg-muted/50' : 'bg-primary/10 border border-primary/20')}>
                                    <div className={cn("mt-1", notification.isRead ? 'text-muted-foreground' : 'text-primary')}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className={cn("font-medium", !notification.isRead && 'text-primary-foreground')}>{notification.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>Mark as Read</Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                            <Bell className="mx-auto h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Notifications</h3>
                            <p>You have no new messages from the owner.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

const HelpAndSupport = ({ tenant, appState, setAppState }) => {
    const { toast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    
    const handleSubmitRequest = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const description = formData.get('description');
        const category = formData.get('category');

        if (!description || !category) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
            return;
        }

        const newRequest = {
            id: Date.now().toString(),
            tenantId: tenant.id,
            unitNo: tenant.unitNo,
            category: category,
            description: description,
            status: 'Pending',
            submittedAt: new Date().toISOString(),
        };

        setAppState(prev => ({
            ...prev,
            maintenanceRequests: [...(prev.maintenanceRequests || []), newRequest]
        }));
        
        setIsRequestModalOpen(false);
        toast({ title: 'Request Submitted', description: 'Your request has been sent to the property owner.' });
    };

    const tenantRequests = useMemo(() => {
        return (appState.maintenanceRequests || [])
            .filter(req => req.tenantId === tenant.id)
            .sort((a,b) => new Date(b.submittedAt) - new Date(a.createdAt));
    }, [appState.maintenanceRequests, tenant.id]);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'In Progress': return 'default';
            case 'Resolved': return 'success';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Help & Support</CardTitle>
                        <CardDescription>Submit a maintenance request or complaint.</CardDescription>
                    </div>
                     <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                        <DialogTrigger asChild>
                            <Button><Wrench className="mr-2 h-4 w-4" /> New Request</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Maintenance Request</DialogTitle>
                                <DialogDescription>
                                    Describe the issue you're facing. Your request will be sent to the owner.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmitRequest} className="py-4 space-y-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                                            <SelectItem value="Electrical">Electrical</SelectItem>
                                            <SelectItem value="Appliance">Appliance</SelectItem>
                                            <SelectItem value="General">General Complaint</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="Please provide as much detail as possible..." rows={5} required/>
                                 </div>
                                 <DialogFooter>
                                     <Button type="submit">Submit Request</Button>
                                 </DialogFooter>
                            </form>
                        </DialogContent>
                     </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenantRequests.length > 0 ? (
                                tenantRequests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>{format(new Date(req.submittedAt), 'dd MMM, yyyy')}</TableCell>
                                        <TableCell>{req.category}</TableCell>
                                        <TableCell className="max-w-xs truncate">{req.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="text-center h-24 text-muted-foreground">
                                        You have no pending or past requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const TenantNoticeBoard = ({ appState }) => {
    const { globalNotices = [] } = appState;
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Notice Board</CardTitle>
                    <CardDescription>Announcements from the property owner.</CardDescription>
                </CardHeader>
                <CardContent>
                    {globalNotices.length > 0 ? (
                        <div className="space-y-6">
                            {globalNotices.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(notice => (
                                <div key={notice.id} className="p-4 rounded-lg border bg-card">
                                    <h3 className="font-semibold text-lg">{notice.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Posted on {format(new Date(notice.createdAt), 'dd MMMM, yyyy - hh:mm a')}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap">{notice.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
                            <Megaphone className="mx-auto h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">The Notice Board is Clear</h3>
                            <p>There are no announcements right now.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const UpgradeModal = ({ isOpen, onOpenChange }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                </div>
                <DialogTitle className="text-center text-2xl">Unlock Premium Features</DialogTitle>
                <DialogDescription className="text-center">
                    Want access to more features like online document storage or an AI assistant?
                    <br />
                    Ask your property owner to upgrade to the <strong>Pro</strong> or <strong>Business</strong> plan!
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={() => onOpenChange(false)} className="w-full">Got it!</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);


const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'payments', label: 'Rent & Payments', icon: IndianRupee },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'support', label: 'Help & Support', icon: Wrench },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
];

export default function TenantDashboard({ appState, setAppState, tenant, onLogout }) {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const { payments, rooms, notifications = [], defaults = {} } = appState;
    const ownerDetails = appState.MOCK_USER_INITIAL || { name: 'Owner', username: 'owner' };
    const isBusinessPlan = defaults.subscriptionPlan === 'business';


    const unreadNotificationsCount = useMemo(() => {
        return notifications.filter(n => n.tenantId === tenant.id && !n.isRead).length;
    }, [notifications, tenant.id]);

    const room = useMemo(() => {
        return rooms.find(r => r.number === tenant.unitNo);
    }, [rooms, tenant.unitNo]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <TenantHome tenant={tenant} payments={payments} room={room} appState={appState} />;
            case 'payments':
                return <RentAndPayments tenant={tenant} payments={payments} setAppState={setAppState} room={room} appState={appState} />;
            case 'notices':
                return <TenantNoticeBoard appState={appState} />;
            case 'support':
                return <HelpAndSupport tenant={tenant} appState={appState} setAppState={setAppState} />;
            case 'notifications':
                return <Notifications tenant={tenant} appState={appState} setAppState={setAppState} />;
            case 'profile':
                return <TenantProfile tenant={tenant} />;
            default:
                return <TenantHome tenant={tenant} payments={payments} room={room} appState={appState} />;
        }
    };
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-4 border-b">
                <AppLogo className="w-8 h-8" iconClassName="w-5 h-5" />
                <span className="text-xl font-bold">My Dashboard</span>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                {TABS.map(tab => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => {
                            setActiveTab(tab.id);
                            setIsSidebarOpen(false);
                        }}
                    >
                        <tab.icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                        {tab.id === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {unreadNotificationsCount}
                            </span>
                        )}
                    </Button>
                ))}
            </div>
            <div className="p-4 border-t mt-auto space-y-2">
                 <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 bg-amber-400/10 text-amber-600 border-amber-400/50 hover:bg-amber-400/20 hover:text-amber-700"
                    onClick={() => setIsUpgradeModalOpen(true)}
                 >
                    <Star className="w-5 h-5" />
                    Premium Features
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={onLogout}>
                    <LogOut className="w-5 h-5" />
                    Log Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-muted/40">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r bg-background">
                <SidebarContent />
            </aside>
            
            {/* Mobile Sidebar */}
            {isSidebarOpen && (
                 <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}>
                     <div className="fixed inset-y-0 left-0 w-64 bg-background z-40 animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                     </div>
                </div>
            )}

            <div className="flex-1 flex flex-col">
                <header className="bg-background border-b sticky top-0 z-10">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                            <h1 className="text-xl font-semibold hidden md:block">{TABS.find(t => t.id === activeTab)?.label}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} />
                                    <AvatarFallback>{tenant.name ? tenant.name.charAt(0).toUpperCase() : 'T'}</AvatarFallback>
                                </Avatar>
                                <div className="hidden sm:flex flex-col items-start">
                                    <p className="text-sm font-medium">{tenant.name}</p>
                                    <p className="text-xs text-muted-foreground">Tenant</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in flex-1">
                    {renderContent()}
                </main>
            </div>
            <UpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
        </div>
    );
}
