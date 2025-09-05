

"use client";

import { useState, useMemo } from 'react';
import { Home, IndianRupee, User, Menu, X, Sun, Moon, LogOut, FileText, BadgeCheck, BadgeAlert, QrCode, ExternalLink, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';
import AppLogo from './AppLogo';
import { useToast } from "@/hooks/use-toast";
import RentReceipt from './RentReceipt';
import { Input } from './ui/input';
import { Label } from './ui/label';

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

    const adminUpiId = appState.defaults?.upiId;
    const adminName = appState.MOCK_USER_INITIAL?.name || "Property Manager";

    const tenantPayments = useMemo(() => {
        return payments
            .filter(p => p.tenantId === tenant.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [payments, tenant.id]);

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

        const newApprovalRequest = {
            id: Date.now().toString(),
            tenantId: tenant.id,
            amount: tenant.rentAmount,
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

        toast({
            title: "Submitted for Approval!",
            description: "Your payment has been submitted to the admin for verification. It will reflect once approved.",
        });
    };

    if (showReceipt) {
        return <RentReceipt receiptDetails={showReceipt} onBack={() => setShowReceipt(null)} />;
    }

    const upiLink = adminUpiId ? `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(adminName)}&am=${tenant.rentAmount.toFixed(2)}&tn=${encodeURIComponent(`Rent for ${format(new Date(), 'MMMM yyyy')} for Room ${tenant.unitNo}`)}` : null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Rent Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Monthly Rent</p>
                        <p className="text-2xl font-bold">{tenant.rentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="text-2xl font-bold">{tenant.dueDate ? format(parseISO(tenant.dueDate), 'dd MMM, yyyy') : 'Not Set'}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                         <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto ml-auto btn-gradient-glow" disabled={!adminUpiId}>
                                <IndianRupee className="mr-2 h-4 w-4" /> Pay Rent Now
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Complete Your Payment</DialogTitle>
                                <DialogDescription>
                                   Step 1: Use the button below to pay <strong className="font-bold">{tenant.rentAmount.toFixed(2)}</strong>.
                                   Step 2: Take a screenshot of the confirmation.
                                   Step 3: Upload it here and submit for approval.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="py-4 space-y-4">
                                {!upiLink ? (
                                    <p className="text-red-500 text-center">The admin has not configured their UPI ID for payments yet.</p>
                                ) : (
                                    <a href={upiLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                        <Button size="lg" className="w-full">
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            Proceed to UPI App
                                        </Button>
                                    </a>
                                )}
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
                                <Button onClick={handleConfirmPayment} className="w-full" disabled={!upiLink}>
                                    Submit for Approval
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenantPayments.length > 0 ? (
                                tenantPayments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), 'dd MMMM, yyyy')}</TableCell>
                                        <TableCell className="font-medium">{payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{payment.method}</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setShowReceipt({ payment, tenant, room })}>
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

const TenantHome = ({ tenant, payments, room }) => {
    const rentStatus = useMemo(() => {
        if (!tenant.dueDate) return { label: 'Upcoming', color: "text-gray-500", Icon: BadgeAlert };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = parseISO(tenant.dueDate);
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        const paidThisMonth = payments
            .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
            .reduce((sum, p) => sum + p.amount, 0);

        if (paidThisMonth >= tenant.rentAmount) return { label: 'Paid', color: "text-green-500", Icon: BadgeCheck };

        const daysDiff = differenceInDays(dueDate, today);
        if (daysDiff < 0) return { label: 'Overdue', color: "text-red-500", Icon: BadgeAlert };

        return { label: 'Upcoming', color: "text-yellow-500", Icon: BadgeAlert };
    }, [tenant, payments]);

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
                        <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenant.rentAmount ? tenant.rentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</div>
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

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'payments', label: 'Rent & Payments', icon: IndianRupee },
    { id: 'profile', label: 'Profile', icon: User },
];

export default function TenantDashboard({ appState, setAppState, tenant, onLogout }) {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { payments, rooms } = appState;

    const room = useMemo(() => {
        return rooms.find(r => r.number === tenant.unitNo);
    }, [rooms, tenant.unitNo]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <TenantHome tenant={tenant} payments={payments} room={room} />;
            case 'payments':
                return <RentAndPayments tenant={tenant} payments={payments} setAppState={setAppState} room={room} appState={appState} />;
            case 'profile':
                return <TenantProfile tenant={tenant} />;
            default:
                return <TenantHome tenant={tenant} payments={payments} room={room} />;
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
                        {tab.label}
                    </Button>
                ))}
            </div>
            <div className="p-4 border-t mt-auto">
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

                <main className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
