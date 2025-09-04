
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { BarChart, IndianRupee, Users, Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AppState } from '@/lib/types';
import { differenceInDays, parseISO } from 'date-fns';

interface ReportsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Reports({ appState }: ReportsProps) {
  const { tenants, payments, rooms, electricity } = appState;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
  });

  const totalCollected = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const tenantPaymentData = tenants.map(tenant => {
    if (!tenant.dueDate) return { tenant, pendingAmount: 0, hasPaid: false, isDue: false };

    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return { tenant, pendingAmount: 0, hasPaid: false, isDue: false };

    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(new Date(), dueDate) >= 0;

    if (!isDue) return { tenant, pendingAmount: 0, hasPaid: false, isDue: false };

    const tenantsInRoom = tenants.filter(t => t.unitNo === tenant.unitNo);
    const roomElectricityBill = electricity
      .filter(e => e.roomId === room.id && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear)
      .reduce((sum, e) => sum + e.totalAmount, 0);
    const electricityShare = tenantsInRoom.length > 0 ? roomElectricityBill / tenantsInRoom.length : 0;

    const totalDue = tenant.rentAmount + electricityShare;
    
    const paidThisMonth = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingAmount = totalDue - paidThisMonth;
    
    return {
      tenant,
      pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      hasPaid: paidThisMonth >= totalDue,
      isDue: true,
    };
  });
  
  const totalPending = tenantPaymentData.reduce((sum, data) => sum + (data?.pendingAmount || 0), 0);
  const paidTenantsCount = tenantPaymentData.filter(d => d?.isDue && d.hasPaid).length;
  const pendingTenantsCount = tenantPaymentData.filter(d => d?.isDue && !d.hasPaid).length;

  const handleExport = () => {
    const dataToExport = {
      summary: {
        totalCollected,
        totalPending,
        paidTenants: paidTenantsCount,
        pendingTenants: pendingTenantsCount,
      },
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Reports & Analytics</h2>
        <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Data</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>This Month's Summary</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
                <IndianRupee className="mx-auto h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">{totalCollected.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <IndianRupee className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{totalPending > 0 ? totalPending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0'}</p>
                <p className="text-sm text-muted-foreground">Total Pending</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <Check className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{paidTenantsCount}</p>
                <p className="text-sm text-muted-foreground">Tenants Paid</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <X className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold">{pendingTenantsCount}</p>
                <p className="text-muted-foreground text-sm">Tenants Pending</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Detailed Analysis</CardTitle></CardHeader>
        <CardContent className="text-center text-muted-foreground py-16">
          <BarChart className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg">Advanced charting and analytics are coming soon!</p>
          <p>This section will feature visual reports on revenue trends, occupancy rates over time, and more.</p>
        </CardContent>
      </Card>
    </div>
  );
}
