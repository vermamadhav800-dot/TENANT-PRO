
"use client";

import { useState } from 'react';
import { Plus, DoorOpen, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";

export default function Rooms({ appState, setAppState }) {
  const { rooms, tenants } = appState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const { toast } = useToast();

  const openModal = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };
  
  const recalculateRentForRoom = (unitNo, newRent, allTenants) => {
      const tenantsInRoom = allTenants.filter(t => t.unitNo === unitNo);
      if (tenantsInRoom.length === 0) return allTenants;
      
      const newRentAmount = newRent / tenantsInRoom.length;
      
      return allTenants.map(t => 
        t.unitNo === unitNo ? { ...t, rentAmount: newRentAmount } : t
      );
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const roomData = {
      number: formData.get('number'),
      capacity: Number(formData.get('capacity')),
      rent: Number(formData.get('rent')),
    };

    setAppState(prev => {
        let updatedRooms;
        let updatedTenants = prev.tenants;

        if (editingRoom) {
            updatedRooms = prev.rooms.map(r => r.id === editingRoom.id ? { ...r, ...roomData } : r);
            updatedTenants = recalculateRentForRoom(editingRoom.number, roomData.rent, prev.tenants);
            toast({ title: "Success", description: "Room updated successfully." });
        } else {
            const newRoom = { ...roomData, id: Date.now().toString() };
            updatedRooms = [...prev.rooms, newRoom];
            toast({ title: "Success", description: "New room added." });
        }

        return { ...prev, rooms: updatedRooms, tenants: updatedTenants };
    });

    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const confirmDeleteRoom = (room) => {
    if (tenants.some(t => t.unitNo === room.number)) {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete room with tenants. Please reassign tenants first." });
      return;
    }
    setRoomToDelete(room);
  };

  const handleDeleteRoom = () => {
    if (!roomToDelete) return;
    setAppState(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== roomToDelete.id),
    }));
    toast({ title: "Success", description: "Room deleted." });
    setRoomToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Room Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage all property rooms and units.</p>
        </div>
        <Button onClick={() => openModal(null)} className="btn-gradient-glow w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
          <DoorOpen className="mx-auto h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Rooms Found</h3>
          <p className="mb-4">Get started by adding your first room or unit.</p>
          <Button onClick={() => openModal(null)}>Add Your First Room</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map(room => {
            const occupants = tenants.filter(t => t.unitNo === room.number);
            const isFull = occupants.length >= room.capacity;
            return (
              <Card key={room.id} className="glass-card card-hover flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">Room {room.number}</CardTitle>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isFull ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {isFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                   <CardDescription>Capacity: {occupants.length} / {room.capacity}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 flex-grow">
                   <div className="flex items-baseline text-3xl font-bold">
                    ₹{room.rent.toLocaleString('en-IN', {minimumFractionDigits: 0})}
                    <span className="text-sm text-muted-foreground ml-1.5">/ month</span>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                  <Button variant="outline" onClick={() => openModal(room)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                      <Button variant="destructive" onClick={() => confirmDeleteRoom(room)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                    </AlertDialogTrigger>
                    {roomToDelete && !tenants.some(t => t.unitNo === roomToDelete.number) && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete room {roomToDelete?.number}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRoomToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteRoom}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                    )}
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) setEditingRoom(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div><Label htmlFor="number">Room Number/Name</Label><Input id="number" name="number" defaultValue={editingRoom?.number} required /></div>
            <div><Label htmlFor="capacity">Capacity (Max Tenants)</Label><Input id="capacity" name="capacity" type="number" defaultValue={editingRoom?.capacity} required /></div>
            <div><Label htmlFor="rent">Total Monthly Rent (₹)</Label><Input id="rent" name="rent" type="number" step="0.01" defaultValue={editingRoom?.rent} required /></div>
            <DialogFooter className="pt-4"><Button type="submit" className="w-full btn-gradient-glow">{editingRoom ? 'Save Changes' : 'Add Room'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
