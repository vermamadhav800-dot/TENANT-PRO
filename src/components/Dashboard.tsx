"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Users, DoorOpen, IndianRupee, Clock, UserPlus, DoorClosed, CreditCard } from 'lucide-react';
import StatCard from './StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { AppState } from '@/lib/types';
import { differenceInDays, parseISO } from 'date-fns';

interface DashboardProps {
  appState: AppState;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function Dashboard({ appState, setActiveTab }: DashboardProps) {
  const { tenants, rooms, payments } = appState;

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

  const totalExpectedRent = tenants.reduce((sum, t) => sum + t.rentAmount, 0);

  const pendingPayments = tenants.filter(tenant => {
    if (!tenant.dueDate) return false;
    const hasPaid = payments.some(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth);
    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(dueDate, new Date()) < 0;
    return isDue && !hasPaid;
  }).reduce((sum, t) => sum + t.rentAmount, 0);
  

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tenants"
          value={totalTenants.toString()}
          icon={Users}
          description="Active tenants"
          color="primary"
        />
        <StatCard
          title="Occupied Rooms"
          value={`${occupiedRoomsCount}/${totalRooms}`}
          icon={DoorOpen}
          description={`${occupancyRate}% occupancy`}
          color="success"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          icon={IndianRupee}
          description="Collected this month"
          color="warning"
        />
        <StatCard
          title="Pending Payments"
          value={`₹${pendingPayments > 0 ? pendingPayments.toLocaleString() : 0}`}
          icon={Clock}
          description="Due for this month"
          color="danger"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button size="lg" onClick={() => setActiveTab('tenants')}>
            <UserPlus className="mr-2 h-5 w-5" />
            Add New Tenant
          </Button>
          <Button size="lg" onClick={() => setActiveTab('rooms')} variant="secondary">
            <DoorClosed className="mr-2 h-5 w-5" />
            Add New Room
          </Button>
          <Button size="lg" onClick={() => setActiveTab('payments')} variant="secondary">
            <CreditCard className="mr-2 h-5 w-5" />
            Record Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock className="mx-auto h-12 w-12 mb-2" />
            <p>No recent activity to display.</p>
            <p className="text-sm">Activity feed coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
