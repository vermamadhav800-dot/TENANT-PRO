
"use client";

import { useState } from 'react';
import { BarChart as BarChartIcon, IndianRupee, Users, Check, X, Download, CircleAlert, CircleCheck, CircleX, Trash2, Bell, FileText, Sheet, Star, Lock, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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


export default function Reports({ appState, setAppState, setActiveTab }) {
  const { tenants, payments, rooms, electricity, defaults } = appState;
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const reportTableRef = useState(null);
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
    if (totalDue > 0) { // Only evaluate status if there's something to be paid
      if (pendingAmount <= 0) {
        status = 'paid';
      } else {
          // If there is any amount pending, it's either overdue or pending based on due date
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

  const chartData = [
    { name: "This Month", collected: totalCollected, pending: totalPending }
  ];

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
        const width = pdfWidth - 20;
        const height = width / ratio;

        pdf.text("Monthly Rent Roll Report", 10, 10);
        pdf.addImage(imgData, 'PNG', 10, 20, width, height);
        pdf.save(`rent-roll-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  };

  const handleExportCSV = () => {
      if (!isPro) {
        setIsUpgradeModalOpen(true);
        return;
      }
      const headers = ["Tenant Name", "Phone", "Room", "Total Due (INR)", "Amount Paid (INR)", "Pending (INR)", "Status"];
      const rows = tenantPaymentData.map(d => [
          d.tenant.name,
          d.tenant.phone,
          d.tenant.unitNo,
          d.totalDue.toFixed(2),
          d.paidAmount.toFixed(2),
          d.pendingAmount.toFixed(2),
          d.status.charAt(0).toUpperCase() + d.status.slice(1)
      ].join(','));
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `rent-roll-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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


  const handleRemind = (tenantName) => {
    toast({
        title: "Reminder Sent!",
        description: `A payment reminder has been sent to ${tenantName}.`
    });
  };

  const statusConfig = {
      paid: { icon: CircleCheck, color: "text-green-500", label: "Paid" },
      pending: { icon: CircleAlert, color: "text-yellow-500", label: "Pending" },
      overdue: { icon: CircleX, color: "text-red-500", label: "Overdue" },
      upcoming: { icon: CircleAlert, color: "text-gray-500", label: "N/A" },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Reports & Analytics</h2>
        <div className="flex gap-2">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF} disabled={!isPro}>
                    <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4"/>
                        <span>Export as PDF</span>
                        {!isPro && <Badge className="ml-2 bg-amber-500 text-white">Pro</Badge>}
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} disabled={!isPro}>
                    <div className="flex items-center">
                      <Sheet className="mr-2 h-4 w-4"/>
                      <span>Export as CSV</span>
                      {!isPro && <Badge className="ml-2 bg-amber-500 text-white">Pro</Badge>}
                    </div>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={handleExportAllData} disabled={!isPro}>
                    <div className="flex items-center">
                      <Database className="mr-2 h-4 w-4"/>
                      <span>Export All Data (JSON)</span>
                      {!isPro && <Badge className="ml-2 bg-amber-500 text-white">Pro</Badge>}
                    </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>This Month's Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">₹{totalCollected.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">₹{totalPending > 0 ? totalPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0'}</p>
                <p className="text-sm text-muted-foreground">Total Pending</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{paidTenantsCount}</p>
                <p className="text-sm text-muted-foreground">Tenants Paid</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{pendingTenantsCount}</p>
                <p className="text-muted-foreground text-sm">Tenants Pending</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Rent Roll: Detailed Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
             <div id="report-table" className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Room</TableHead>
                            <TableHead>Total Due</TableHead>
                            <TableHead>Amount Paid</TableHead>
                            <TableHead>Pending</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenantPaymentData.length > 0 ? tenantPaymentData.map(({tenant, totalDue, paidAmount, pendingAmount, status}) => {
                             const CurrentStatusIcon = statusConfig[status].icon;
                             const canRemind = status === 'pending' || status === 'overdue';
                             return(
                                <TableRow key={tenant.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-9 h-9 border">
                                            <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} data-ai-hint="person face" />
                                            <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{tenant.name}</p>
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
                                        <span>{statusConfig[status].label}</span>
                                    </div>
                                </TableCell>
                                 <TableCell className="text-right">
                                    {canRemind && (
                                        <Button variant="outline" size="sm" onClick={() => handleRemind(tenant.name)}>
                                            <Bell className="mr-2 h-4 w-4" /> Remind
                                        </Button>
                                    )}
                                </TableCell>
                                </TableRow>
                             )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No tenant data to display for this month.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Monthly Collection Analysis</CardTitle></CardHeader>
        <CardContent className="h-[250px] w-full">
            <ChartContainer config={{
                collected: { label: 'Collected', color: 'hsl(var(--chart-2))' },
                pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
            }} className="w-full h-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />} />
                    <Legend />
                    <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
      
      <AlertDialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="text-amber-500" />
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
              <Star className="mr-2 h-4 w-4"/>
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
