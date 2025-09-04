
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Users, DoorOpen, IndianRupee, Clock, UserPlus, DoorClosed, CreditCard, Home, Briefcase, FileText } from 'lucide-react';
import StatCard from './StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { AppState, Tenant, Payment, Room } from '@/lib/types';
import { differenceInDays, parseISO, formatDistanceToNow, isValid } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

interface DashboardProps {
  appState: AppState;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export default function Dashboard({ appState, setActiveTab }: DashboardProps) {
  const { tenants, rooms, payments, electricity } = appState;

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

  const pendingPayments = tenants.reduce((totalPending, tenant) => {
    if (!tenant.dueDate) return totalPending;
    
    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return totalPending;

    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(new Date(), dueDate) >= 0;

    if (!isDue) return totalPending;

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
    
    return totalPending + (pendingAmount > 0 ? pendingAmount : 0);
  }, 0);
  
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
    
    const roomActivities = rooms.map(r => ({
      id: `room-${r.id}`,
      type: 'New Room' as const,
      date: r.createdAt,
      Icon: Home,
      content: (
        <p>
          New room <strong>{r.number}</strong> was added with capacity for <strong>{r.capacity}</strong>.
        </p>
      ),
    }));

    return [...tenantActivities, ...paymentActivities, ...roomActivities]
      .filter(activity => isValid(new Date(activity.date)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Limit to latest 5 activities
  }, [tenants, payments, rooms]);
  

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
          value={`${monthlyRevenue.toLocaleString()}`}
          icon={IndianRupee}
          description="Collected this month"
          color="warning"
        />
        <StatCard
          title="Pending Payments"
          value={`${pendingPayments > 0 ? pendingPayments.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0'}`}
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
