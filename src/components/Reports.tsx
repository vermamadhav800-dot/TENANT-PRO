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
  const { tenants, payments } = appState;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
  });

  const totalCollected = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  const pendingTenants = tenants.filter(tenant => {
    const hasPaid = payments.some(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth);
    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(dueDate, new Date()) < 0;
    return isDue && !hasPaid;
  });
  
  const totalPending = pendingTenants.reduce((sum, t) => sum + t.rentAmount, 0);

  const paidTenants = new Set(thisMonthPayments.map(p => p.tenantId));
  
  const pendingTenantsCount = tenants.length - paidTenants.size;

  const handleExport = () => {
    const dataToExport = {
      summary: {
        totalCollected,
        totalPending,
        paidTenants: paidTenants.size,
        pendingTenants: pendingTenantsCount,
      },
      tenants,
      payments,
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
                <p className="text-2xl font-bold">₹{totalCollected.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <IndianRupee className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">₹{totalPending > 0 ? totalPending.toLocaleString() : '0'}</p>
                <p className="text-sm text-muted-foreground">Total Pending</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <Check className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{paidTenants.size}</p>
                <p className="text-sm text-muted-foreground">Tenants Paid</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
                <X className="mx-auto h-8 w-8 text-red-500 mb-2" />
                <p className="text-2xl font-bold">{pendingTenantsCount}</p>
                <p className="text-sm text-muted-foreground">Tenants Pending</p>
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
