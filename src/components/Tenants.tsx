

"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Plus, Trash2, Edit, MoreVertical, Users, Home, Eye as ViewIcon, IndianRupee, Phone, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import type { AppState, Tenant, Room } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';


interface TenantsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

const TenantFormModal = ({
  isOpen,
  setIsOpen,
  tenant,
  setAppState,
  availableUnits,
  rooms,
  tenants
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tenant: Tenant | null;
  setAppState: Dispatch<SetStateAction<AppState>>;
  availableUnits: { roomNumber: string; capacity: number; occupants: number }[];
  rooms: AppState['rooms'];
  tenants: AppState['tenants'];
}) => {
  const { toast } = useToast();
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(tenant?.profilePhotoUrl || null);
  const [aadhaarCardPreview, setAadhaarCardPreview] = useState<string | null>(tenant?.aadhaarCardUrl || null);
  const [selectedUnit, setSelectedUnit] = useState<string | undefined>(tenant?.unitNo);
  const [calculatedRent, setCalculatedRent] = useState<number>(0);

  const recalculateRentForRoom = (unitNo: string, allTenants: Tenant[]) => {
      const room = rooms.find(r => r.number === unitNo);
      if (!room) return allTenants;

      const tenantsInRoom = allTenants.filter(t => t.unitNo === unitNo);
      const newRentAmount = tenantsInRoom.length > 0 ? room.rent / tenantsInRoom.length : 0;
      
      return allTenants.map(t => 
        t.unitNo === unitNo ? { ...t, rentAmount: newRentAmount } : t
      );
  };
  
  useEffect(() => {
    if (selectedUnit) {
      const room = rooms.find(r => r.number === selectedUnit);
      if (room) {
        const currentOccupants = tenants.filter(t => t.unitNo === selectedUnit);
        const isNewTenantOrMovingIn = !tenant || tenant.unitNo !== selectedUnit;
        const newOccupantCount = currentOccupants.length + (isNewTenantOrMovingIn ? 1 : 0);
        setCalculatedRent(newOccupantCount > 0 ? room.rent / newOccupantCount : room.rent);
      }
    } else {
      setCalculatedRent(0);
    }
  }, [selectedUnit, tenant, tenants, rooms]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dueDateRaw = formData.get('dueDate') as string;
    const unitNo = formData.get('unitNo') as string;
    
    setAppState(prev => {
        const tenantData: Omit<Tenant, 'id' | 'createdAt'> = {
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            email: formData.get('email') as string,
            unitNo: unitNo,
            rentAmount: 0, // Will be calculated
            dueDate: dueDateRaw ? new Date(dueDateRaw).toISOString() : '',
            aadhaar: formData.get('aadhaar') as string,
            profilePhotoUrl: profilePhotoPreview || `https://picsum.photos/seed/${Date.now()}/200`,
            aadhaarCardUrl: aadhaarCardPreview,
        };

        let updatedTenants: Tenant[];
        const originalUnitNo = tenant?.unitNo;

        if (tenant) { // Editing existing tenant
            updatedTenants = prev.tenants.map(t => t.id === tenant.id ? { ...t, ...tenantData } : t);
        } else { // Adding new tenant
            updatedTenants = [...prev.tenants, { ...tenantData, id: Date.now().toString(), createdAt: new Date().toISOString() }];
        }

        let tenantsWithNewRent = recalculateRentForRoom(unitNo, updatedTenants);
        
        if (originalUnitNo && originalUnitNo !== unitNo) {
            tenantsWithNewRent = recalculateRentForRoom(originalUnitNo, tenantsWithNewRent);
        }

        toast({ title: "Success", description: tenant ? "Tenant updated successfully." : "New tenant added." });
        
        return { ...prev, tenants: tenantsWithNewRent };
    });

    setIsOpen(false);
  };

  const defaultDueDate = tenant?.dueDate ? format(parseISO(tenant.dueDate), 'yyyy-MM-dd') : '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
           <div className="flex flex-col items-center gap-2 pt-2">
            <Avatar className="w-24 h-24 ring-2 ring-offset-2 ring-primary ring-offset-background">
              <AvatarImage src={profilePhotoPreview || undefined} alt="Profile Preview" />
              <AvatarFallback>{tenant?.name.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Input id="profilePhoto" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePhotoPreview)} className="text-sm w-auto" />
            <Label htmlFor="profilePhoto" className="text-xs text-muted-foreground">Upload Profile Photo</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" defaultValue={tenant?.name} required /></div>
            <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" defaultValue={tenant?.phone} type="tel" required /></div>
          </div>
          <div><Label htmlFor="email">Email Address</Label><Input id="email" name="email" defaultValue={tenant?.email} type="email" required /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitNo">Unit Number</Label>
              <Select name="unitNo" defaultValue={tenant?.unitNo} required onValueChange={setSelectedUnit}>
                <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                <SelectContent>
                  {tenant && !availableUnits.some(u => u.roomNumber === tenant.unitNo) && <SelectItem value={tenant.unitNo}>{tenant.unitNo} (Current)</SelectItem>}
                  {availableUnits.map(unit => <SelectItem key={unit.roomNumber} value={unit.roomNumber}>{unit.roomNumber} ({unit.occupants}/{unit.capacity})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="rentAmount">Per-Person Rent</Label>
              <Input id="rentAmount" name="rentAmount" type="number" value={calculatedRent.toFixed(2)} required readOnly disabled/>
              <p className="text-xs text-muted-foreground mt-1">Rent is auto-divided among tenants.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="dueDate">Rent Due Date</Label><Input id="dueDate" name="dueDate" type="date" defaultValue={defaultDueDate} required /></div>
            <div><Label htmlFor="aadhaar">Aadhaar Card Number</Label><Input id="aadhaar" name="aadhaar" defaultValue={tenant?.aadhaar} required pattern="^\d{12}$" title="Aadhaar must be 12 digits" /></div>
          </div>
          <div>
            <Label htmlFor="aadhaarCard">Aadhaar Card Upload</Label>
            <Input id="aadhaarCard" name="aadhaarCard" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setAadhaarCardPreview)} />
            {aadhaarCardPreview && <a href={aadhaarCardPreview} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">View Uploaded Aadhaar</a>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full btn-gradient-glow">{tenant ? 'Save Changes' : 'Add Tenant'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({ tenant, isOpen, setIsOpen, setAppState }: { tenant: Tenant, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, setAppState: Dispatch<SetStateAction<AppState>> }) => {
    const { toast } = useToast();

    const handleDelete = () => {
        setAppState(prev => {
            const { rooms } = prev;
            const roomToUpdate = rooms.find(r => r.number === tenant.unitNo);

            let updatedTenants = prev.tenants.filter(t => t.id !== tenant.id);
            const updatedPayments = prev.payments.filter(p => p.tenantId !== tenant.id);
            
            if (roomToUpdate) {
                const tenantsInRoom = updatedTenants.filter(t => t.unitNo === roomToUpdate.number);
                if (tenantsInRoom.length > 0) {
                    const newRentAmount = roomToUpdate.rent / tenantsInRoom.length;
                    updatedTenants = updatedTenants.map(t => 
                        t.unitNo === roomToUpdate.number ? { ...t, rentAmount: newRentAmount } : t
                    );
                }
            }
            
            toast({ title: "Success", description: `Tenant ${tenant.name} has been deleted.` });

            return {
                ...prev,
                tenants: updatedTenants,
                payments: updatedPayments,
            };
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Tenant</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete tenant "{tenant.name}"? This will also remove all associated payment records and recalculate rent for any remaining tenants in the room. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const TenantDetailsModal = ({ tenant, room, isOpen, setIsOpen }: { tenant: Tenant | null, room: Room | null, isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
  if (!tenant || !room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{tenant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Avatar className="w-24 h-24 mx-auto ring-2 ring-offset-2 ring-primary ring-offset-background">
            <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} data-ai-hint="person face" />
            <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{tenant.email}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{tenant.phone}</span></div>
            <div className="flex items-center gap-2"><Home className="w-4 h-4 text-muted-foreground" /><span>Room {tenant.unitNo}</span></div>
            <div className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-muted-foreground" /><span>Rent: {tenant.rentAmount.toFixed(2)} / month</span></div>
            <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /><span>Aadhaar: XXXX-XXXX-{tenant.aadhaar.slice(-4)}</span></div>
          </div>
          {tenant.aadhaarCardUrl && (
            <Button asChild className="w-full">
              <a href={tenant.aadhaarCardUrl} target="_blank" rel="noopener noreferrer">View Aadhaar Card</a>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function Tenants({ appState, setAppState }: TenantsProps) {
  const { tenants, rooms, payments, electricity } = appState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const availableUnits = useMemo(() => {
    const occupantsCount = tenants.reduce((acc, tenant) => {
      acc[tenant.unitNo] = (acc[tenant.unitNo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return rooms
      .map(room => ({
        roomNumber: room.number,
        capacity: room.capacity,
        occupants: occupantsCount[room.number] || 0,
      }))
      .filter(room => room.occupants < room.capacity);
  }, [tenants, rooms]);

  const tenantsByRoom = useMemo(() => {
    const grouped: Record<string, Tenant[]> = {};
    tenants.forEach(tenant => {
      if (!grouped[tenant.unitNo]) {
        grouped[tenant.unitNo] = [];
      }
      grouped[tenant.unitNo].push(tenant);
    });
    return Object.fromEntries(
        Object.entries(grouped).sort(([roomA], [roomB]) => roomA.localeCompare(roomB, undefined, { numeric: true }))
    );
  }, [tenants]);
  
  const getRentStatus = (tenant: Tenant): { label: string; color: "success" | "destructive" | "warning" } => {
    if (!tenant.dueDate) {
        return { label: 'Upcoming', color: 'warning' };
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = parseISO(tenant.dueDate);
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return { label: 'Upcoming', color: 'warning' };

    const tenantsInRoom = tenants.filter(t => t.unitNo === tenant.unitNo);
    const roomElectricityBill = electricity
      .filter(e => e.roomId === room.id && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear)
      .reduce((sum, e) => sum + e.totalAmount, 0);
    const electricityShare = tenantsInRoom.length > 0 ? roomElectricityBill / tenantsInRoom.length : 0;
    
    const totalDue = tenant.rentAmount + electricityShare;

    const paidThisMonth = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    if (paidThisMonth >= totalDue) return { label: 'Paid', color: 'success' };
    
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff < 0) return { label: 'Overdue', color: 'destructive' };
    
    return { label: 'Upcoming', color: 'warning' };
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Tenant Management</h2>
          <p className="text-muted-foreground">A complete list of all tenants in your properties.</p>
        </div>
        <Button onClick={() => { setSelectedTenant(null); setIsModalOpen(true); }} className="btn-gradient-glow">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

       {tenants.length === 0 ? (
        <Card className="glass-card text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
            <Users className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tenants Found</h3>
            <p className="mb-4">Get started by adding your first tenant.</p>
            <Button onClick={() => { setSelectedTenant(null); setIsModalOpen(true); }}>Add Your First Tenant</Button>
        </Card>
      ) : (
      <div className="space-y-8">
        {Object.entries(tenantsByRoom).map(([roomNumber, roomTenants]) => (
          <Card key={roomNumber} className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="text-primary"/>
                Room {roomNumber}
                <Badge variant="secondary">{roomTenants.length} Tenant(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Aadhaar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomTenants.map(tenant => {
                      const status = getRentStatus(tenant);
                      return (
                        <TableRow key={tenant.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10 border">
                                      <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} data-ai-hint="person face" />
                                      <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold">{tenant.name}</span>
                              </div>
                          </TableCell>
                          <TableCell>
                              <div>{tenant.phone}</div>
                              <div className="text-sm text-muted-foreground">{tenant.email}</div>
                          </TableCell>
                           <TableCell>{tenant.rentAmount ? tenant.rentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</TableCell>
                          <TableCell>{tenant.dueDate ? format(parseISO(tenant.dueDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                          <TableCell className="font-mono">XXXX-XXXX-{tenant.aadhaar?.slice(-4) || 'XXXX'}</TableCell>
                          <TableCell>
                            <Badge variant={status.color} className={cn(
                              status.color === 'success' && 'bg-green-500/20 text-green-400 border-green-500/30',
                              status.color === 'destructive' && 'bg-red-500/20 text-red-400 border-red-500/30',
                              status.color === 'warning' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                            )}>
                                {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(tenant)}>
                                  <ViewIcon className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsModalOpen(true); }}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Tenant
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTenant(tenant)} className="text-red-500 focus:text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete Tenant
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
      
      {isModalOpen && <TenantFormModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} tenant={selectedTenant} setAppState={setAppState} availableUnits={availableUnits} rooms={rooms} tenants={tenants} />}
      {isDeleteModalOpen && selectedTenant && <DeleteConfirmationDialog isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} tenant={selectedTenant} setAppState={setAppState} />}
      {isDetailsModalOpen && selectedTenant && <TenantDetailsModal isOpen={isDetailsModalOpen} setIsOpen={setIsDetailsModalOpen} tenant={selectedTenant} room={rooms.find(r => r.number === selectedTenant.unitNo) || null} />}
    </div>
  );
}
