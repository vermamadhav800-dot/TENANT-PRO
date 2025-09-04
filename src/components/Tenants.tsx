"use client";

import { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, MoreVertical, Eye } from 'lucide-react';
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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import type { AppState, Tenant } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInDays, parseISO } from 'date-fns';

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
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  tenant: Tenant | null;
  setAppState: Dispatch<SetStateAction<AppState>>;
  availableUnits: string[];
}) => {
  const { toast } = useToast();
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(tenant?.profilePhotoUrl || null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const aadhaar = formData.get('aadhaar') as string;

    if (!/^\d{12}$/.test(aadhaar)) {
      toast({
        variant: "destructive",
        title: "Invalid Aadhaar Number",
        description: "Aadhaar number must be 12 digits.",
      });
      return;
    }
    
    const tenantData: Omit<Tenant, 'id'> = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      unitNo: formData.get('unitNo') as string,
      rentAmount: Number(formData.get('rentAmount')),
      dueDate: formData.get('dueDate') as string,
      aadhaar,
      profilePhotoUrl: profilePhotoPreview || `https://picsum.photos/seed/${Date.now()}/200`,
      aadhaarCardUrl: tenant?.aadhaarCardUrl, // Logic for upload needs implementation
    };

    if (tenant) {
      setAppState(prev => ({
        ...prev,
        tenants: prev.tenants.map(t => t.id === tenant.id ? { ...t, ...tenantData } : t)
      }));
      toast({ title: "Success", description: "Tenant updated successfully." });
    } else {
      setAppState(prev => ({
        ...prev,
        tenants: [...prev.tenants, { ...tenantData, id: Date.now().toString() }]
      }));
      toast({ title: "Success", description: "New tenant added." });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{tenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
           <div className="flex flex-col items-center gap-2">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profilePhotoPreview || undefined} alt="Profile Preview" />
              <AvatarFallback>{tenant?.name.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <Input id="profilePhoto" type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
            <Label htmlFor="profilePhoto" className="text-xs text-muted-foreground">Profile Photo</Label>
          </div>
          <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" defaultValue={tenant?.name} required /></div>
          <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" name="phone" defaultValue={tenant?.phone} type="tel" required /></div>
          <div><Label htmlFor="email">Email Address</Label><Input id="email" name="email" defaultValue={tenant?.email} type="email" required /></div>
          <div>
            <Label htmlFor="unitNo">Unit Number</Label>
            <Select name="unitNo" defaultValue={tenant?.unitNo} required>
              <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
              <SelectContent>
                {tenant && <SelectItem value={tenant.unitNo}>{tenant.unitNo}</SelectItem>}
                {availableUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="rentAmount">Rent Amount (₹)</Label><Input id="rentAmount" name="rentAmount" type="number" defaultValue={tenant?.rentAmount} required /></div>
          <div><Label htmlFor="dueDate">Rent Due Date</Label><Input id="dueDate" name="dueDate" type="date" defaultValue={tenant?.dueDate} required /></div>
          <div><Label htmlFor="aadhaar">Aadhaar Card Number</Label><Input id="aadhaar" name="aadhaar" defaultValue={tenant?.aadhaar} required pattern="\d{12}" title="Aadhaar must be 12 digits" /></div>
          <div>
            <Label htmlFor="aadhaarCard">Aadhaar Card Upload</Label>
            <Input id="aadhaarCard" name="aadhaarCard" type="file" accept=".pdf,.jpg,.jpeg,.png" />
            {tenant?.aadhaarCardUrl && <a href={tenant.aadhaarCardUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">View Uploaded Aadhaar</a>}
          </div>
          <DialogFooter>
            <Button type="submit">{tenant ? 'Save Changes' : 'Add Tenant'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({ tenant, isOpen, setIsOpen, setAppState }: { tenant: Tenant, isOpen: boolean, setIsOpen: (isOpen: boolean) => void, setAppState: Dispatch<SetStateAction<AppState>> }) => {
    const { toast } = useToast();

    const handleDelete = () => {
        setAppState(prev => ({
            ...prev,
            tenants: prev.tenants.filter(t => t.id !== tenant.id),
            // Optionally remove associated payments
            payments: prev.payments.filter(p => p.tenantId !== tenant.id),
        }));
        toast({ title: "Success", description: `Tenant ${tenant.name} has been deleted.` });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Tenant</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete tenant "{tenant.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function Tenants({ appState, setAppState }: TenantsProps) {
  const { tenants, rooms, payments } = appState;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const availableUnits = useMemo(() => {
    const occupiedUnits = new Set(tenants.map(t => t.unitNo));
    return rooms.map(r => r.number).filter(n => !occupiedUnits.has(n));
  }, [tenants, rooms]);
  
  const getRentStatus = (tenant: Tenant): { label: string; color: "success" | "destructive" | "warning" } => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = parseISO(tenant.dueDate);

    const hasPaid = payments.some(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === today.getMonth());
    if (hasPaid) return { label: 'Paid', color: 'success' };
    
    const daysDiff = differenceInDays(dueDate, today);

    if (daysDiff < 0) return { label: 'Due', color: 'destructive' };
    if (daysDiff <= 7) return { label: 'Upcoming', color: 'warning' };
    
    return { label: 'Upcoming', color: 'warning' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Tenant Management</h2>
        <Button onClick={() => { setSelectedTenant(null); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <div className="border rounded-lg w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit No.</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map(tenant => {
                const status = getRentStatus(tenant);
                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={tenant.profilePhotoUrl} alt={tenant.name} data-ai-hint="person face" />
                                <AvatarFallback>{tenant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {tenant.name}
                        </div>
                    </TableCell>
                    <TableCell>{tenant.unitNo}</TableCell>
                    <TableCell>
                        <div>{tenant.phone}</div>
                        <div className="text-sm text-muted-foreground">{tenant.email}</div>
                    </TableCell>
                    <TableCell>₹{tenant.rentAmount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(tenant.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>XXXX-XXXX-{tenant.aadhaar.slice(-4)}</TableCell>
                    <TableCell>
                      <Badge variant={status.color === 'success' ? 'default' : status.color}>
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
                          <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsModalOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedTenant(tenant); setIsDeleteModalOpen(true); }} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {isModalOpen && <TenantFormModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} tenant={selectedTenant} setAppState={setAppState} availableUnits={availableUnits} />}
      {isDeleteModalOpen && selectedTenant && <DeleteConfirmationDialog isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} tenant={selectedTenant} setAppState={setAppState} />}
    </div>
  );
}
