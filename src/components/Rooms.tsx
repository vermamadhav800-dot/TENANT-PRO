"use client";

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, DoorOpen, Users, IndianRupee, Trash2, Edit, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AppState, Room } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import RentOptimizer from './RentOptimizer';

interface RoomsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Rooms({ appState, setAppState }: RoomsProps) {
  const { rooms, tenants } = appState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [roomToOptimize, setRoomToOptimize] = useState<Room | null>(null);
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
    if (tenants.some(t => t.roomId === roomId)) {
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

  const openOptimizer = (room: Room) => {
    setRoomToOptimize(room);
    setIsOptimizerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Room Management</h2>
        <Button onClick={() => openModal(null)}><Plus className="mr-2 h-4 w-4" /> Add Room</Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <DoorOpen className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg">No rooms found.</p>
          <p>Add your first room to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => {
            const occupants = tenants.filter(t => t.roomId === room.id);
            const isFull = occupants.length >= room.capacity;
            return (
              <Card key={room.id} className="card-hover">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Room {room.number}</CardTitle>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {isFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm"><Users className="mr-2 h-4 w-4 text-muted-foreground"/> <span>Occupancy: {occupants.length} / {room.capacity}</span></div>
                  <div className="flex items-center text-sm"><IndianRupee className="mr-2 h-4 w-4 text-muted-foreground"/> <span>Rent: {room.rent.toLocaleString()} / month</span></div>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openOptimizer(room)}><Bot className="mr-1 h-4 w-4" /> Optimize</Button>
                  <Button variant="outline" size="sm" onClick={() => openModal(room)}><Edit className="mr-1 h-4 w-4" /> Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRoom(room.id)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div><Label htmlFor="number">Room Number/Name</Label><Input id="number" name="number" defaultValue={editingRoom?.number} required /></div>
            <div><Label htmlFor="capacity">Capacity</Label><Input id="capacity" name="capacity" type="number" defaultValue={editingRoom?.capacity} required /></div>
            <div><Label htmlFor="rent">Monthly Rent (₹)</Label><Input id="rent" name="rent" type="number" defaultValue={editingRoom?.rent} required /></div>
            <DialogFooter>
              <Button type="submit">{editingRoom ? 'Save Changes' : 'Add Room'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {roomToOptimize && (
        <RentOptimizer
          isOpen={isOptimizerOpen}
          setIsOpen={setIsOptimizerOpen}
          room={roomToOptimize}
        />
      )}
    </div>
  );
}
