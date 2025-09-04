"use client";

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, Users, User, Trash2, Eye, Phone, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AppState, Tenant } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface TenantsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Tenants({ appState, setAppState }: TenantsProps) {
  const { tenants, rooms } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const { toast } = useToast();

  const handleAddTenant = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const room = rooms.find(r => r.id === formData.get('roomId'));
    if (!room) {
        toast({ variant: "destructive", title: "Error", description: "Selected room not found." });
        return;
    }

    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      aadhaar: formData.get('aadhaar') as string,
      address: formData.get('address') as string,
      roomId: formData.get('roomId') as string,
      rentPerPerson: room.rent, 
      profilePhotoUrl: `https://picsum.photos/seed/${Date.now()}/200`,
      aadhaarPhotoUrl: `https://picsum.photos/seed/${Date.now()+1}/400/250`,
    };
    
    setAppState(prev => ({ ...prev, tenants: [...prev.tenants, newTenant] }));
    toast({ title: "Success", description: "New tenant has been added." });
    setIsAddModalOpen(false);
  };
  
  const handleDeleteTenant = (tenantId: string) => {
    if(confirm('Are you sure you want to delete this tenant? This will also remove associated payments.')) {
      setAppState(prev => ({
        ...prev,
        tenants: prev.tenants.filter(t => t.id !== tenantId),
        payments: prev.payments.filter(p => p.tenantId !== tenantId),
      }));
      toast({ title: "Success", description: "Tenant has been deleted." });
    }
  };

  const availableRooms = rooms.filter(room => !tenants.some(t => t.roomId === room.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Tenant Management</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Tenant</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTenant} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" type="tel" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aadhaar" className="text-right">Aadhaar</Label>
                <Input id="aadhaar" name="aadhaar" className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Address</Label>
                <Textarea id="address" name="address" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomId" className="text-right">Room</Label>
                <Select name="roomId" required>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableRooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                                Room {room.number} (Capacity: {room.capacity}, Rent: ₹{room.rent})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Add Tenant</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <Users className="mx-auto h-16 w-16 mb-4" />
          <p className="text-lg">No tenants found.</p>
          <p>Add your first tenant to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(tenant => {
            const room = rooms.find(r => r.id === tenant.roomId);
            return (
              <Card key={tenant.id} className="card-hover">
                <CardHeader className="flex flex-row items-start gap-4">
                  <Image src={tenant.profilePhotoUrl || 'https://picsum.photos/200'} alt={tenant.name} width={64} height={64} className="w-16 h-16 rounded-full object-cover border-2 border-primary" data-ai-hint="person face" />
                  <div className="flex-1">
                    <CardTitle className="truncate">{tenant.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Room {room?.number || 'N/A'}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                   <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground"/>
                      <span>{tenant.phone}</span>
                  </div>
                   <div className="flex items-center text-sm">
                      <IndianRupee className="mr-2 h-4 w-4 text-muted-foreground"/>
                      <span>{tenant.rentPerPerson} / month</span>
                  </div>
                </CardContent>
                <CardFooter className="flex space-x-2">
                   <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="outline" className="w-full"><Eye className="mr-2 h-4 w-4" /> View Details</Button>
                      </DialogTrigger>
                      <DialogContent>
                         <DialogHeader><DialogTitle>{tenant.name}</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Image src={tenant.profilePhotoUrl || 'https://picsum.photos/200'} alt={tenant.name} width={100} height={100} className="w-24 h-24 rounded-full object-cover mx-auto" data-ai-hint="person face" />
                            <p><strong>Phone:</strong> {tenant.phone}</p>
                            <p><strong>Aadhaar:</strong> {tenant.aadhaar}</p>
                            <p><strong>Address:</strong> {tenant.address}</p>
                            <p><strong>Room:</strong> {room?.number || 'N/A'}</p>
                            <p><strong>Rent:</strong> ₹{tenant.rentPerPerson} / month</p>
                            <div>
                              <h4 className="font-semibold mb-2">Aadhaar Card:</h4>
                              <Image src={tenant.aadhaarPhotoUrl || 'https://picsum.photos/400/250'} alt="Aadhaar Card" width={400} height={250} className="rounded-lg border" data-ai-hint="document id" />
                            </div>
                          </div>
                      </DialogContent>
                   </Dialog>
                  <Button variant="destructive" onClick={() => handleDeleteTenant(tenant.id)} className="w-full"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
