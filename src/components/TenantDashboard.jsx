
"use client";

import { useState, useMemo } from 'react';
import { Home, IndianRupee, History, MessageSquare, LogOut, Moon, Sun, CircleAlert, CircleCheck, CircleX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';
import AppLogo from './AppLogo';

export default function TenantDashboard({ appState, tenant, onLogout }) {
  const { theme, setTheme } = useTheme();
  const { payments, rooms, electricity } = appState;

  const tenantPayments = useMemo(() => {
    return payments
      .filter(p => p.tenantId === tenant.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, tenant.id]);

  const room = useMemo(() => {
    return rooms.find(r => r.number === tenant.unitNo);
  }, [rooms, tenant.unitNo]);

  const rentStatus = useMemo(() => {
    if (!tenant.dueDate) return { label: 'Upcoming', color: "text-gray-500", icon: CircleAlert };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = parseISO(tenant.dueDate);
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const paidThisMonth = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    if (paidThisMonth >= tenant.rentAmount) return { label: 'Paid', color: "text-green-500", icon: CircleCheck };
    
    const daysDiff = differenceInDays(dueDate, today);
    if (daysDiff < 0) return { label: 'Overdue', color: "text-red-500", icon: CircleX };

    return { label: 'Upcoming', color: "text-yellow-500", icon: CircleAlert };
  }, [tenant, payments]);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
                <AppLogo className="w-8 h-8" iconClassName="w-5 h-5"/>
                <span className="text-xl font-bold">My Dashboard</span>
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
                <Button variant="outline" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2"/>
                    Log Out
                </Button>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold font-headline">Welcome back, {tenant.name ? tenant.name.split(' ')[0] : ''}!</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">My Room</CardTitle>
                    <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Room {tenant.unitNo || 'Not Assigned'}</div>
                    <p className="text-xs text-muted-foreground">Capacity: {room?.capacity || 'N/A'}</p>
                </CardContent>
            </Card>
             <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{tenant.rentAmount ? tenant.rentAmount.toLocaleString() : 'N/A'}</div>
                    <p className="text-xs text-muted-foreground">Due on: {tenant.dueDate ? format(parseISO(tenant.dueDate), 'dd MMMM yyyy') : 'Not Set'}</p>
                </CardContent>
            </Card>
             <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Current Rent Status</CardTitle>
                    <rentStatus.icon className={cn("h-4 w-4", rentStatus.color)} />
                </CardHeader>
                <CardContent>
                    <div className={cn("text-2xl font-bold", rentStatus.color)}>{rentStatus.label}</div>
                    <p className="text-xs text-muted-foreground">For the month of {format(new Date(), 'MMMM')}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>A record of all your payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {tenantPayments.length > 0 ? (
                            tenantPayments.map(payment => (
                                <TableRow key={payment.id}>
                                    <TableCell>{format(new Date(payment.date), 'dd MMMM, yyyy')}</TableCell>
                                    <TableCell className="font-medium">{payment.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{payment.method}</span>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan="3" className="text-center h-24 text-muted-foreground">
                                    You haven't made any payments yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full sm:w-auto ml-auto">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contact Admin for questions
                </Button>
            </CardFooter>
        </Card>
      </main>
    </div>
  );
}
