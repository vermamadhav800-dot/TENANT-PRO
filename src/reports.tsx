
"use client";

import { BarChart as BarChartIcon, IndianRupee, Users, Check, X, Download, CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default function Reports({ appState }) {
  const { tenants, payments, rooms, electricity } = appState;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
  });

  const totalCollected = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const tenantPaymentData = tenants.map(tenant => {
    if (!tenant.dueDate) return { tenant, totalDue: 0, paidAmount: 0, pendingAmount: 0, status: 'upcoming', isDue: false };

    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return { tenant, totalDue: 0, paidAmount: 0, pendingAmount: 0, status: 'upcoming', isDue: false };

    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(new Date(), dueDate) >= 0;

    const tenantsInRoom = tenants.filter(t => t.unitNo === tenant.unitNo);
    const roomElectricityBill = electricity
      .filter(e => e.roomId === room.id && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear)
      .reduce((sum, e) => sum + e.totalAmount, 0);
    const electricityShare = tenantsInRoom.length > 0 ? roomElectricityBill / tenantsInRoom.length : 0;

    const totalDue = tenant.rentAmount + electricityShare;
    
    const paidAmount = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = totalDue - paidAmount;
    
    let status = 'upcoming';
    if(isDue) {
      if (paidAmount >= totalDue) {
        status = 'paid';
      } else if (pendingAmount > 0 && differenceInDays(new Date(), dueDate) > 0) {
        status = 'overdue';
      } else {
        status = 'pending';
      }
    }

    return {
      tenant,
      totalDue,
      paidAmount,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      status,
      isDue,
    };
  });
  
  const totalPending = tenantPaymentData.reduce((sum, data) => sum + (data?.pendingAmount || 0), 0);
  const paidTenantsCount = tenantPaymentData.filter(d => d?.isDue && d.status === 'paid').length;
  const pendingTenantsCount = tenantPaymentData.filter(d => d?.isDue && (d.status === 'pending' || d.status === 'overdue')).length;

  const chartData = [
    { name: "This Month", collected: totalCollected, pending: totalPending }
  ];

  const handleExport = () => {
    const dataToExport = {
      summary: {
        totalCollected,
        totalPending,
        paidTenants: paidTenantsCount,
        pendingTenants: pendingTenantsCount,
      },
      detailedStatus: tenantPaymentData,
      tenants,
      payments,
      electricity,
      rooms,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estateflow-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusConfig = {
      paid: { icon: CircleCheck, color: "text-green-500", label: "Paid" },
      pending: { icon: CircleAlert, color: "text-yellow-500", label: "Pending" },
      overdue: { icon: CircleX, color: "text-red-500", label: "Overdue" },
      upcoming: { icon: CircleAlert, color: "text-gray-500", label: "Upcoming" },
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Reports & Analytics</h2>
        <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Data</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>This Month's Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{totalCollected.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{totalPending > 0 ? totalPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0'}</p>
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
            <CardTitle>Detailed Payment Status</CardTitle>
            <CardContent className="p-0 pt-4">
                 <Table>
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
                        {tenantPaymentData.map(({tenant, totalDue, paidAmount, pendingAmount, status}) => {
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
                                            <p className="font-medium">{tenant.name}</p>
                                            <p className="text-sm text-muted-foreground">{tenant.username}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{tenant.unitNo}</TableCell>
                                <TableCell>{totalDue.toFixed(2)}</TableCell>
                                <TableCell className="text-green-600">{paidAmount.toFixed(2)}</TableCell>
                                <TableCell className="font-semibold text-red-600">{pendingAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className={cn("flex items-center gap-2 font-medium", statusConfig[status].color)}>
                                        <CurrentStatusIcon className="h-4 w-4"/>
                                        <span>{statusConfig[status].label}</span>
                                    </div>
                                </TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle>Detailed Analysis</CardTitle></CardHeader>
        <CardContent className="h-[250px] w-full">
            <ChartContainer config={{
                collected: { label: 'Collected', color: 'hsl(var(--chart-2))' },
                pending: { label: 'Pending', color: 'hsl(var(--chart-5))' },
            }} className="w-full h-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <Bar dataKey="collected" fill="var(--color-collected)" radius={4} />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
