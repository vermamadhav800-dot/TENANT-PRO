"use client";

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, DoorOpen, Users, IndianRupee, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AppState, Room } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface RoomsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Rooms({ appState, setAppState }: RoomsProps) {
  const { rooms, tenants } = appState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const { toast } = useToast();

  const openModal = (room: Room | null) => {
    setEditingRoom(room);
setIsModalOpen(true);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const roomData = {
      number: formData.get('number') as string,
      capacity: Number(formData.get('capacity')),
      rent: Number(formData.get('rent')),
    };

    if (editingRoom) {
      const updatedRoom = { ...editingRoom, ...roomData };
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.map(r => r.id === editingRoom.id ? updatedRoom : r)
      }));
      toast({ title: "Success", description: "Room updated successfully." });
    } else {
      const newRoom = { ...roomData, id: Date.now().toString() };
      setAppState(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
      toast({ title: "Success", description: "New room added." });
    }
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    const roomToDelete = rooms.find(r => r.id === roomId);
    if (!roomToDelete) return;

    if (tenants.some(t => t.unitNo === roomToDelete.number)) {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete room with tenants. Please reassign tenants first." });
      return;
    }
    if(confirm('Are you sure you want to delete this room?')) {
      setAppState(prev => ({
        ...prev,
        rooms: prev.rooms.filter(r => r.id !== roomId)
      }));
      toast({ title: "Success", description: "Room deleted." });
    }
  };


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
                    <span className="text-xl mr-1">₹</span>
                    {room.rent.toLocaleString()}
                    <span className="text-sm text-muted-foreground ml-1.5">/ month</span>
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-2 gap-2 pt-4">
                  <Button variant="outline" onClick={() => openModal(room)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                  <Button variant="destructive" outline onClick={() => handleDeleteRoom(room.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
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
            <div><Label htmlFor="rent">Monthly Rent (₹)</Label><Input id="rent" name="rent" type="number" defaultValue={editingRoom?.rent} required /></div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full btn-gradient-glow">{editingRoom ? 'Save Changes' : 'Add Room'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
