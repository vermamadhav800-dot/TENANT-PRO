

"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Users, DoorOpen, IndianRupee, Wallet, PiggyBank, UserPlus, DoorClosed, CreditCard, Home, Briefcase, FileText, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import StatCard from './StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { AppState, Tenant, Payment, Room } from '@/lib/types';
import { differenceInDays, parseISO, formatDistanceToNow, isValid } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

interface DashboardProps {
  appState: AppState;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function Dashboard({ appState, setActiveTab }: DashboardProps) {
  const { tenants, rooms, payments, electricity, expenses = [] } = appState;

  const totalTenants = tenants.length;
  const totalRooms = rooms.length;
  const occupiedRoomsCount = new Set(tenants.map(t => t.unitNo)).size;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 0;

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
  });

  const monthlyRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
  });
  const monthlyExpenses = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = monthlyRevenue - monthlyExpenses;
  
  const recentActivities = useMemo(() => {
    const tenantActivities = tenants.map(t => ({
      id: `tenant-${t.id}`,
      type: 'New Tenant' as const,
      date: t.createdAt,
      Icon: UserPlus,
      content: (
        <p>
          New tenant <strong>{t.name}</strong> moved into Room <strong>{t.unitNo}</strong>.
        </p>
      ),
    }));

    const paymentActivities = payments.map(p => {
      const tenant = tenants.find(t => t.id === p.tenantId);
      return {
        id: `payment-${p.id}`,
        type: 'Payment' as const,
        date: p.date,
        Icon: IndianRupee,
        content: (
          <p>
            Received a payment of <strong>{p.amount.toLocaleString()}</strong> from{' '}
            <strong>{tenant?.name || 'Unknown'}</strong>.
          </p>
        ),
      };
    });
    
    const expenseActivities = expenses.map(e => ({
        id: `expense-${e.id}`,
        type: 'Expense' as const,
        date: e.date,
        Icon: Wallet,
        content: (
            <p>
                Recorded an expense of <strong>{e.amount.toLocaleString()}</strong> for <strong>{e.description}</strong>.
            </p>
        )
    }));

    return [...tenantActivities, ...paymentActivities, ...expenseActivities]
      .filter(activity => isValid(new Date(activity.date)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Limit to latest 5 activities
  }, [tenants, payments, expenses]);
  

  return (
    <div className="space-y-8">
       <Card className="bg-gradient-to-tr from-primary to-sky-400 text-primary-foreground">
        <CardHeader>
          <CardTitle>This Month's Financial Summary</CardTitle>
          <CardDescription className="text-primary-foreground/80">A quick overview of your finances for the current month.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg"><TrendingUp className="h-6 w-6"/></div>
            <div>
              <p className="text-sm">Revenue</p>
              <p className="text-2xl font-bold">{monthlyRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg"><TrendingDown className="h-6 w-6"/></div>
            <div>
              <p className="text-sm">Expenses</p>
              <p className="text-2xl font-bold">{monthlyExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg"><Scale className="h-6 w-6"/></div>
            <div>
              <p className="text-sm">Net Profit</p>
              <p className="text-2xl font-bold">{netProfit.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Total Tenants"
          value={totalTenants.toString()}
          icon={Users}
          description="Active tenants across all rooms"
          color="primary"
        />
        <StatCard
          title="Room Occupancy"
          value={`${occupiedRoomsCount}/${totalRooms} Rooms`}
          icon={DoorOpen}
          description={`${occupancyRate}% occupancy rate`}
          color="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button size="lg" onClick={() => setActiveTab('tenants')}>
            <UserPlus className="mr-2 h-5 w-5" />
            Add Tenant
          </Button>
          <Button size="lg" onClick={() => setActiveTab('rooms')} variant="secondary">
            <DoorClosed className="mr-2 h-5 w-5" />
            Add Room
          </Button>
          <Button size="lg" onClick={() => setActiveTab('payments')} variant="secondary">
            <CreditCard className="mr-2 h-5 w-5" />
            Record Payment
          </Button>
          <Button size="lg" onClick={() => setActiveTab('expenses')} variant="secondary">
            <Wallet className="mr-2 h-5 w-5" />
            Add Expense
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <ul className="space-y-4">
              {recentActivities.map(activity => (
                <li key={activity.id} className="flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-full">
                    <activity.Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm">{activity.content}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Briefcase className="mx-auto h-12 w-12 mb-2" />
              <p>No recent activity to display.</p>
              <p className="text-sm">Add a tenant, room, or payment to see updates here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
