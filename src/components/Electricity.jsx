
"use client";

import { useState } from 'react';
import { Plus, Trash2, Zap, FileText, Calculator, Home, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from './StatCard';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';


export default function Electricity({ appState, setAppState }) {
  const { electricity, rooms, tenants, defaults } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState(null);
  const { toast } = useToast();

  const handleAddReading = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentReading = Number(formData.get('currentReading'));
    const previousReading = Number(formData.get('previousReading'));
    const ratePerUnit = Number(formData.get('ratePerUnit'));
    const unitsConsumed = currentReading - previousReading;
    
    if (unitsConsumed < 0) {
      toast({ variant: "destructive", title: "Error", description: "Current reading must be higher than previous reading." });
      return;
    }

    const newReading = {
      id: Date.now().toString(),
      roomId: formData.get('roomId'),
      previousReading,
      currentReading,
      unitsConsumed,
      ratePerUnit,
      totalAmount: unitsConsumed * ratePerUnit,
      date: new Date(formData.get('date')).toISOString(),
      applied: false, // New flag
    };
    
    setAppState(prev => ({ ...prev, electricity: [...prev.electricity, newReading] }));
    toast({ title: "Success", description: "Electricity reading added." });
    setIsAddModalOpen(false);
  };

  const confirmDeleteReading = (reading) => {
    setReadingToDelete(reading);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteReading = () => {
    if (!readingToDelete) return;
    setAppState(prev => ({ ...prev, electricity: prev.electricity.filter(e => e.id !== readingToDelete.id) }));
    toast({ title: "Success", description: "Reading deleted." });
    setIsDeleteAlertOpen(false);
    setReadingToDelete(null);
  };
  
  const handleApplyToBills = (readingId) => {
    const reading = electricity.find(r => r.id === readingId);
    if (!reading || reading.applied) return;
    
    const tenantsInRoom = tenants.filter(t => rooms.find(room => room.id === reading.roomId)?.number === t.unitNo);

    if (tenantsInRoom.length === 0) {
        toast({
            variant: "destructive",
            title: "No tenants in room",
            description: "Cannot apply bill because there are no tenants assigned to this room."
        });
        return;
    }

    const amountPerTenant = reading.totalAmount / tenantsInRoom.length;

    setAppState(prev => {
      // 1. Mark the reading as applied
      const updatedElectricity = prev.electricity.map(r => r.id === readingId ? { ...r, applied: true } : r);
      
      // 2. Add the charge to each tenant
      const updatedTenants = prev.tenants.map(t => {
        if (tenantsInRoom.some(tr => tr.id === t.id)) {
          const newCharges = [...(t.otherCharges || []), {
            id: `elec-${reading.id}`,
            amount: amountPerTenant,
            description: `Electricity Bill for ${new Date(reading.date).toLocaleString('default', { month: 'long' })}`,
            date: reading.date,
          }];
          return { ...t, otherCharges: newCharges };
        }
        return t;
      });

      return {
        ...prev,
        electricity: updatedElectricity,
        tenants: updatedTenants,
      };
    });

    toast({
        title: "Bill Applied!",
        description: `An amount of ₹${amountPerTenant.toFixed(2)} has been added to the bill of ${tenantsInRoom.length} tenant(s).`
    });
  };


  const thisMonthReadings = electricity.filter(r => new Date(r.date).getMonth() === new Date().getMonth());
  const totalUnits = thisMonthReadings.reduce((sum, r) => sum + r.unitsConsumed, 0);
  const totalBill = thisMonthReadings.reduce((sum, r) => sum + r.totalAmount, 0);
  const avgRate = thisMonthReadings.length > 0 ? thisMonthReadings.reduce((sum, r) => sum + r.ratePerUnit, 0) / thisMonthReadings.length : 0;
  const avgPerRoom = rooms.length > 0 ? totalBill / rooms.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Electricity Management</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Reading</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Electricity Reading</DialogTitle></DialogHeader>
            <form onSubmit={handleAddReading} className="space-y-4 py-4">
              <div><Label htmlFor="roomId">Room</Label><Select name="roomId" required><SelectTrigger><SelectValue placeholder="Select a room" /></SelectTrigger><SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.number}</SelectItem>)}</SelectContent></Select></div>
              <div><Label htmlFor="previousReading">Previous Reading</Label><Input id="previousReading" name="previousReading" type="number" step="0.01" required /></div>
              <div><Label htmlFor="currentReading">Current Reading</Label><Input id="currentReading" name="currentReading" type="number" step="0.01" required /></div>
              <div><Label htmlFor="ratePerUnit">Rate per Unit (₹)</Label><Input id="ratePerUnit" name="ratePerUnit" type="number" step="0.01" defaultValue={defaults?.electricityRatePerUnit || 8} required /></div>
              <div><Label htmlFor="date">Reading Date</Label><Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required /></div>
              <DialogFooter><Button type="submit">Add Reading</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Units (Month)" value={totalUnits.toFixed(2)} icon={Zap} color="primary" />
        <StatCard title="Total Bill (Month)" value={`₹${totalBill.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon={FileText} color="warning" />
        <StatCard title="Average Rate" value={`₹${avgRate.toFixed(2)}`} icon={Calculator} color="success" />
        <StatCard title="Avg. Bill/Room" value={`₹${avgPerRoom.toFixed(2)}`} icon={Home} color="danger" />
      </div>

      <Card>
        <CardHeader><CardTitle>Electricity Reading History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Room</TableHead><TableHead>Units</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {electricity.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center h-24 text-muted-foreground">No readings recorded yet.</TableCell></TableRow>
              ) : (
                electricity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(reading => {
                  const room = rooms.find(r => r.id === reading.roomId);
                  return (
                    <TableRow key={reading.id}>
                      <TableCell className="font-medium">{room?.number || "N/A"}</TableCell>
                      <TableCell className="font-semibold text-blue-600">{reading.unitsConsumed.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{reading.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      <TableCell>{new Date(reading.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {reading.applied ? (
                            <span className="flex items-center text-green-600"><Check className="mr-2 h-4 w-4"/>Applied</span>
                        ) : (
                             <Button size="sm" variant="outline" onClick={() => handleApplyToBills(reading.id)}>
                                 Apply to Bills
                             </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => confirmDeleteReading(reading)} disabled={reading.applied}>
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this electricity reading.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReadingToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReading}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    