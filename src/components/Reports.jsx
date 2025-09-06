
"use client";

import { useState } from 'react';
import { Download, CircleAlert, CircleCheck, CircleX, FileText, Sheet, Database, Wallet, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function Reports({ appState, setAppState, setActiveTab }) {
  const { tenants, payments, rooms, expenses = [], defaults } = appState;
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const isPro = defaults.subscriptionPlan === 'pro' || defaults.subscriptionPlan === 'business';

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const tenantPaymentData = tenants.map(tenant => {
    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return { tenant, totalDue: 0, paidAmount: 0, pendingAmount: 0, status: 'upcoming' };

    const monthlyCharges = (tenant.otherCharges || [])
      .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalDue = tenant.rentAmount + monthlyCharges;

    const paidAmount = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = totalDue - paidAmount;
    
    let status = 'upcoming';
    if (totalDue > 0) {
      if (pendingAmount <= 0) {
        status = 'paid';
      } else {
          const dueDate = tenant.dueDate ? parseISO(tenant.dueDate) : new Date();
          if (differenceInDays(new Date(), dueDate) > 0) {
              status = 'overdue';
          } else {
              status = 'pending';
          }
      }
    }

    return {
      tenant,
      totalDue,
      paidAmount,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      status,
    };
  });
  
  const totalCollected = payments
    .filter(p => new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = tenantPaymentData.reduce((sum, data) => sum + (data?.pendingAmount || 0), 0);
  const paidTenantsCount = tenantPaymentData.filter(d => d.status === 'paid').length;
  const pendingTenantsCount = tenantPaymentData.filter(d => d.status === 'pending' || d.status === 'overdue').length;


  const handleExportPDF = () => {
    if (!isPro) {
        setIsUpgradeModalOpen(true);
        return;
    }
    const input = document.getElementById('report-table');
    if (!input) {
        toast({variant: "destructive", title: "Error", description: "Report table not found."})
        return;
    };
    html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth - 20;
        let height = width / ratio;

        if (height > pdfHeight - 30) {
          height = pdfHeight - 30;
          width = height * ratio;
        }

        pdf.text("Monthly Rent Roll Report", 10, 10);
        pdf.addImage(imgData, 'PNG', 10, 20, width, height);
        pdf.save(`rent-roll-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  };
  
  const generateCsv = (headers, rows, fileName) => {
    if (!isPro) {
        setIsUpgradeModalOpen(true);
        return;
    }
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  const handleExportRentRollCSV = () => {
      const headers = ["Tenant Name", "Phone", "Room", "Total Due (INR)", "Amount Paid (INR)", "Pending (INR)", "Status"];
      const rows = tenantPaymentData.map(d => [
          d.tenant.name,
          d.tenant.phone,
          d.tenant.unitNo,
          d.totalDue.toFixed(2),
          d.paidAmount.toFixed(2),
          d.pendingAmount.toFixed(2),
          d.status.charAt(0).toUpperCase() + d.status.slice(1)
      ]);
      generateCsv(headers, rows, "rent-roll-report");
  };
  
   const handleExportAllTenantsCSV = () => {
        const headers = ["ID", "Name", "Phone", "Email", "Room", "Rent Amount", "Due Date", "Aadhaar", "Lease Start", "Lease End"];
        const rows = tenants.map(t => [
            t.id,
            t.name,
            t.phone,
            t.username,
            t.unitNo,
            t.rentAmount,
            t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
            t.aadhaar,
            t.leaseStartDate ? new Date(t.leaseStartDate).toLocaleDateString() : '',
            t.leaseEndDate ? new Date(t.leaseEndDate).toLocaleDateString() : '',
        ]);
        generateCsv(headers, rows, "all-tenants");
    };

    const handleExportAllPaymentsCSV = () => {
        const headers = ["Payment ID", "Tenant Name", "Tenant ID", "Amount", "Date", "Method"];
        const rows = payments.map(p => {
            const tenant = tenants.find(t => t.id === p.tenantId);
            return [
                p.id,
                tenant?.name || "N/A",
                p.tenantId,
                p.amount,
                new Date(p.date).toLocaleDateString(),
                p.method
            ];
        });
        generateCsv(headers, rows, "all-payments");
    };

    const handleExportAllExpensesCSV = () => {
        const headers = ["Expense ID", "Description", "Category", "Amount", "Date"];
        const rows = expenses.map(e => [
            e.id,
            e.description,
            e.category,
            e.amount,
            new Date(e.date).toLocaleDateString()
        ]);
        generateCsv(headers, rows, "all-expenses");
    };

  
  const handleExportAllData = () => {
      if (!isPro) {
        setIsUpgradeModalOpen(true);
        return;
      }
      try {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(appState, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `estateflow-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Success", description: "Full data export started."});
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to export data."});
        console.error("Failed to export all data:", error);
      }
  };

  const statusConfig = {
      paid: { icon: CircleCheck, color: "text-green-500", label: "Paid" },
      pending: { icon: CircleAlert, color: "text-yellow-500", label: "Pending" },
      overdue: { icon: CircleX, color: "text-red-500", label: "Overdue" },
      upcoming: { icon: CircleAlert, color: "text-gray-500", label: "N/A" },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">Reports & Data Export</h2>
        <div className="flex gap-2 w-full md:w-auto">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Rent Roll (This Month)</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExportPDF} disabled={!isPro}>
                    <FileText className="mr-2 h-4 w-4"/>
                    <span>Rent Roll (PDF)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportRentRollCSV} disabled={!isPro}>
                      <Sheet className="mr-2 h-4 w-4"/>
                      <span>Rent Roll (CSV)</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Complete History</DropdownMenuLabel>
                 <DropdownMenuItem onClick={handleExportAllPaymentsCSV} disabled={!isPro}>
                    <CreditCard className="mr-2 h-4 w-4"/>
                    <span>All Payments (CSV)</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleExportAllTenantsCSV} disabled={!isPro}>
                    <Users className="mr-2 h-4 w-4"/>
                    <span>All Tenants (CSV)</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleExportAllExpensesCSV} disabled={!isPro}>
                    <Wallet className="mr-2 h-4 w-4"/>
                    <span>All Expenses (CSV)</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Full Application Backup</DropdownMenuLabel>
                 <DropdownMenuItem onClick={handleExportAllData} disabled={!isPro}>
                      <Database className="mr-2 h-4 w-4"/>
                      <span>Full Backup (JSON)</span>
                </DropdownMenuItem>
                 {!isPro && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <span className="text-xs text-muted-foreground">Upgrade to Pro to unlock exports.</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>This Month's Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-xl md:text-2xl font-bold">₹{totalCollected.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Collected</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-xl md:text-2xl font-bold">₹{totalPending > 0 ? totalPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0'}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-xl md:text-2xl font-bold">{paidTenantsCount}</p>
                <p className="text-sm text-muted-foreground">Tenants Paid</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-xl md:text-2xl font-bold">{pendingTenantsCount}</p>
                <p className="text-muted-foreground text-sm">Tenants Pending</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Rent Roll: Detailed Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
             <div id="report-table-container" className="overflow-x-auto">
                <Table id="report-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Total Due</TableHead>
                            <TableHead>Amount Paid</TableHead>
                            <TableHead>Pending</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenantPaymentData.length > 0 ? tenantPaymentData.map(({tenant, totalDue, paidAmount, pendingAmount, status}) => {
                             const CurrentStatusIcon = statusConfig[status].icon;
                             return(
                                <TableRow key={tenant.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-9 h-9 border">
                                            <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} data-ai-hint="person face" />
                                            <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium whitespace-nowrap">{tenant.name}</p>
                                            <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{tenant.unitNo}</TableCell>
                                <TableCell>₹{totalDue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell className="text-green-600 font-medium">₹{paidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell className="font-semibold text-red-600">₹{pendingAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                                <TableCell>
                                    <div className={cn("flex items-center gap-2 font-medium", statusConfig[status].color)}>
                                        <CurrentStatusIcon className="h-4 w-4"/>
                                        <span className="whitespace-nowrap">{statusConfig[status].label}</span>
                                    </div>
                                </TableCell>
                                </TableRow>
                             )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No tenant data to display for this month.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock text-amber-500"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Pro Feature Locked
            </AlertDialogTitle>
            <AlertDialogDescription>
              This feature is only available on the Pro or Business plan. Please upgrade your plan to unlock advanced data exports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                setIsUpgradeModalOpen(false);
                setActiveTab('upgrade');
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-2 h-4 w-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
