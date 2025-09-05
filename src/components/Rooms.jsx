
"use client";

import { useState } from 'react';
import { Plus, DoorOpen, Trash2, Edit, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useCollection } from '@/lib/hooks';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function Rooms({ user }) {
  const { data: rooms, loading: roomsLoading } = useCollection('rooms', user.uid);
  const { data: tenants, loading: tenantsLoading } = useCollection('tenants', user.uid);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const openModal = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const recalculateRentForRoom = async (unitNo, newRent) => {
      const tenantsInRoom = tenants.filter(t => t.unitNo === unitNo);
      if (tenantsInRoom.length === 0) return;
      
      const newRentAmount = newRent / tenantsInRoom.length;
      
      const batch = writeBatch(db);
      tenantsInRoom.forEach(t => {
          const tenantRef = doc(db, "tenants", t.id);
          batch.update(tenantRef, { rentAmount: newRentAmount });
      });
      
      await batch.commit();
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const roomData = {
      number: formData.get('number'),
      capacity: Number(formData.get('capacity')),
      rent: Number(formData.get('rent')),
    };

    try {
        if (editingRoom) {
          const roomRef = doc(db, "rooms", editingRoom.id);
          await updateDoc(roomRef, roomData);
          await recalculateRentForRoom(editingRoom.number, roomData.rent);
          toast({ title: "Success", description: "Room updated successfully." });
        } else {
          await addDoc(collection(db, "rooms"), { ...roomData, ownerId: user.uid, createdAt: new Date().toISOString() });
          toast({ title: "Success", description: "New room added." });
        }
        setIsModalOpen(false);
        setEditingRoom(null);
    } catch (error) {
        console.error("Error saving room:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save room details." });
    } finally {
        setIsSubmitting(false);
    }
  };

  const confirmDeleteRoom = (room) => {
    if (tenants.some(t => t.unitNo === room.number)) {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete room with tenants. Please reassign tenants first." });
      return;
    }
    setRoomToDelete(room);
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
        await deleteDoc(doc(db, "rooms", roomToDelete.id));
        toast({ title: "Success", description: "Room deleted." });
    } catch (error) {
        console.error("Error deleting room:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete room." });
    }
    setRoomToDelete(null);
  };

  if (roomsLoading || tenantsLoading) {
      return <div className="flex justify-center items-center h-64"><LoaderCircle className="w-8 h-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Room Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage all property rooms and units.</p>
        </div>
        <Button onClick={() => openModal(null)} className="btn-gradient-glow"><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
          <DoorOpen className="mx-auto h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Rooms Found</h3>
          <p className="mb-4">Get started by adding your first room or unit.</p>
          <Button onClick={() => openModal(null)}>Add Your First Room</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    {room.rent.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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
            <div><Label htmlFor="capacity">Capacity</Label><Input id="capacity" name="capacity" type="number" defaultValue={editingRoom?.capacity} required /></div>
            <div><Label htmlFor="rent">Monthly Rent</Label><Input id="rent" name="rent" type="number" step="0.01" defaultValue={editingRoom?.rent} required /></div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full btn-gradient-glow" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null}
                {editingRoom ? 'Save Changes' : 'Add Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
