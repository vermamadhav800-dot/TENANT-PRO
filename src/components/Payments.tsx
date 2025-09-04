"use client";

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, Trash2, IndianRupee, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from './StatCard';
import type { AppState, Payment } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO } from 'date-fns';


interface PaymentsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Payments({ appState, setAppState }: PaymentsProps) {
  const { payments, tenants } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const tenantId = formData.get('tenantId') as string;
    const tenant = tenants.find(t => t.id === tenantId);
    
    if (!tenant) {
      toast({ variant: "destructive", title: "Error", description: "Tenant not found." });
      return;
    }
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      tenantId,
      amount: Number(formData.get('amount')),
      date: new Date(formData.get('date') as string).toISOString(),
      method: formData.get('method') as 'Cash' | 'UPI' | 'Bank Transfer',
    };
    
    setAppState(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    toast({ title: "Success", description: `Payment of ₹${newPayment.amount} recorded for ${tenant.name}.` });
    setIsAddModalOpen(false);
  };

  const handleDeletePayment = (paymentId: string) => {
    if(confirm('Are you sure you want to delete this payment record?')) {
      setAppState(prev => ({ ...prev, payments: prev.payments.filter(p => p.id !== paymentId) }));
      toast({ title: "Success", description: "Payment record deleted." });
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === thisMonth && paymentDate.getFullYear() === thisYear;
  });
  const thisMonthCollection = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = tenants.filter(tenant => {
    if (!tenant.dueDate) return false;
    const hasPaid = payments.some(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth);
    const dueDate = parseISO(tenant.dueDate);
    const isDue = differenceInDays(dueDate, new Date()) < 0;
    return isDue && !hasPaid;
  }).reduce((sum, t) => sum + t.rentAmount, 0);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Payment Management</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record New Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4 py-4">
              <div>
                <Label htmlFor="tenantId">Tenant</Label>
                <Select name="tenantId" required>
                  <SelectTrigger><SelectValue placeholder="Select a tenant" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" name="amount" type="number" required /></div>
              <div><Label htmlFor="date">Payment Date</Label><Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required /></div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select name="method" defaultValue="UPI" required>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="submit">Record Payment</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Collected" value={`₹${totalCollected.toLocaleString()}`} icon={CheckCircle} color="success" />
        <StatCard title="Pending Amount (This Month)" value={`₹${totalPending > 0 ? totalPending.toLocaleString() : '0'}`} icon={Clock} color="warning" />
        <StatCard title="Collected This Month" value={`₹${thisMonthCollection.toLocaleString()}`} icon={Calendar} color="primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit No.</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No payments recorded yet.</TableCell>
                </TableRow>
              ) : (
                payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => {
                  const tenant = tenants.find(t => t.id === payment.tenantId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{tenant?.name || "Unknown Tenant"}</TableCell>
                      <TableCell>{tenant?.unitNo || "N/A"}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{payment.method}</span></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
