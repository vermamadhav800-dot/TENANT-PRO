

"use client";

import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Edit, MoreVertical, Users, Home, Eye as ViewIcon, Phone, Mail, FileText, Calendar as CalendarIcon, IdCard, UploadCloud, ShieldAlert, MessageSquare, FolderArchive, Lock } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';


const TenantFormModal = ({
  isOpen,
  setIsOpen,
  tenant,
  setAppState,
  availableUnits,
  rooms,
  tenants,
  appState,
}) => {
  const { toast } = useToast();
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(tenant?.profilePhotoUrl || null);
  const [aadhaarCardPreview, setAadhaarCardPreview] = useState(tenant?.aadhaarCardUrl);
  const [leaseAgreementPreview, setLeaseAgreementPreview] = useState(tenant?.leaseAgreementUrl);
  const [selectedUnit, setSelectedUnit] = useState(tenant?.unitNo);
  const [calculatedRent, setCalculatedRent] = useState(0);
  const isBusiness = appState.defaults.subscriptionPlan === 'business';

  const recalculateRentForRoom = (unitNo, allTenants) => {
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
        // Exclude the current tenant being edited from the count if they are already in that room
        const currentOccupants = tenants.filter(t => t.unitNo === selectedUnit && t.id !== tenant?.id);
        const newOccupantCount = currentOccupants.length + 1; // Add the one being added/edited
        setCalculatedRent(newOccupantCount > 0 ? room.rent / newOccupantCount : room.rent);
      }
    } else {
      setCalculatedRent(0);
    }
  }, [selectedUnit, tenant, tenants, rooms]);


  const handleFileChange = (e, setPreview) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const unitNo = formData.get('unitNo');
    const aadhaar = formData.get('aadhaar');

    if (aadhaar && aadhaar.length !== 12) {
        toast({
            variant: "destructive",
            title: "Invalid Aadhaar Number",
            description: "Aadhaar number must be exactly 12 digits long."
        });
        return;
    }
    
    setAppState(prev => {
        const tenantData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            username: formData.get('username'),
            // password is no longer needed for tenant login
            unitNo: unitNo,
            rentAmount: 0, // This will be recalculated
            dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate')).toISOString() : null,
            leaseStartDate: formData.get('leaseStartDate') ? new Date(formData.get('leaseStartDate')).toISOString() : null,
            leaseEndDate: formData.get('leaseEndDate') ? new Date(formData.get('leaseEndDate')).toISOString() : null,
            aadhaar: aadhaar,
            profilePhotoUrl: profilePhotoPreview || `https://picsum.photos/seed/${Date.now()}/200`,
            aadhaarCardUrl: aadhaarCardPreview,
            leaseAgreementUrl: leaseAgreementPreview,
        };

        let updatedTenants;
        const originalUnitNo = tenant?.unitNo;

        if (tenant) { // Editing existing tenant
            updatedTenants = prev.tenants.map(t => t.id === tenant.id ? { ...t, ...tenantData } : t);
        } else { // Adding new tenant
            updatedTenants = [...prev.tenants, { ...tenantData, id: Date.now().toString(), createdAt: new Date().toISOString(), otherCharges: [] }];
        }

        // Recalculate rent for the new/updated unit
        let tenantsWithNewRent = recalculateRentForRoom(unitNo, updatedTenants);
        
        // If tenant moved rooms, recalculate rent for the old room as well
        if (originalUnitNo && originalUnitNo !== unitNo) {
            tenantsWithNewRent = recalculateRentForRoom(originalUnitNo, tenantsWithNewRent);
        }
        
        toast({ title: "Success", description: tenant ? "Tenant updated successfully." : "New tenant added." });

        return { ...prev, tenants: tenantsWithNewRent };
    });

    setIsOpen(false);
  };

  const formatDateForInput = (dateString) => {
      if (!dateString || !isValid(parseISO(dateString))) return '';
      return format(parseISO(dateString), 'yyyy-MM-dd');
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{tenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
          <DialogDescription>
            {tenant ? 'Update the details for this tenant.' : 'Fill in the form to add a new tenant to your property. The phone number will be their login.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
           <div className="flex flex-col items-center gap-4 pt-2">
            <Avatar className="w-24 h-24 ring-2 ring-offset-2 ring-primary ring-offset-background">
              <AvatarImage src={profilePhotoPreview || undefined} alt="Profile Preview" />
              <AvatarFallback>{tenant?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <Label htmlFor="profilePhoto" className="cursor-pointer text-sm text-primary hover:underline">Upload Profile Photo</Label>
              <Input id="profilePhoto" type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProfilePhotoPreview)} className="sr-only" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">Full Name</Label><Input id="name" name="name" defaultValue={tenant?.name} required /></div>
            <div><Label htmlFor="phone">Phone Number (Tenant Login ID)</Label><Input id="phone" name="phone" defaultValue={tenant?.phone} type="tel" required /></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="username">Email Address</Label><Input id="username" name="username" defaultValue={tenant?.username} type="email" required /></div>
             <div className="flex items-center space-x-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-3">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <p className="text-xs text-amber-800">
                    Tenants log in with their phone number. No password is required.
                </p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Rental Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitNo">Unit Number</Label>
                <Select name="unitNo" defaultValue={tenant?.unitNo} required onValueChange={setSelectedUnit}>
                  <SelectTrigger><SelectValue placeholder="Select a unit" /></SelectTrigger>
                  <SelectContent>
                    {tenant && !availableUnits.some(u => u.roomNumber === tenant.unitNo) && <SelectItem value={tenant.unitNo}>{tenant.unitNo} (Current, Full)</SelectItem>}
                    {availableUnits.map(unit => <SelectItem key={unit.roomNumber} value={unit.roomNumber}>Room {unit.roomNumber} ({unit.occupants}/{unit.capacity})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="rentAmount">Per-Person Rent (Calculated)</Label>
                <Input id="rentAmount" name="rentAmount" type="number" value={calculatedRent.toFixed(2)} required readOnly className="bg-muted"/>
                <p className="text-xs text-muted-foreground mt-1">Rent is auto-divided among tenants in the room.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><Label htmlFor="dueDate">Rent Due Date</Label><Input id="dueDate" name="dueDate" type="date" defaultValue={formatDateForInput(tenant?.dueDate)} required /></div>
                <div><Label htmlFor="leaseStartDate">Lease Start Date</Label><Input id="leaseStartDate" name="leaseStartDate" type="date" defaultValue={formatDateForInput(tenant?.leaseStartDate)} /></div>
                <div><Label htmlFor="leaseEndDate">Lease End Date</Label><Input id="leaseEndDate" name="leaseEndDate" type="date" defaultValue={formatDateForInput(tenant?.leaseEndDate)} /></div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
             <div className="flex items-center gap-2">
                <h3 className="font-semibold">Documents</h3>
                {!isBusiness && <Badge className="bg-purple-100 text-purple-700 border-purple-200">Business Feature</Badge>}
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="aadhaar">Aadhaar Card Number</Label><Input id="aadhaar" name="aadhaar" defaultValue={tenant?.aadhaar} required type="number" /></div>
                <div className="space-y-1">
                  <Label htmlFor="aadhaarCard">Aadhaar Card Upload</Label>
                  <Input id="aadhaarCard" name="aadhaarCard" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setAadhaarCardPreview)} disabled={!isBusiness} />
                  {aadhaarCardPreview && <a href={aadhaarCardPreview} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">View Uploaded Aadhaar</a>}
                   {!isBusiness && <p className="text-xs text-muted-foreground">Available on the Business plan.</p>}
                </div>
             </div>
             <div className="space-y-1">
                <Label htmlFor="leaseAgreement">Lease Agreement Upload</Label>
                <Input id="leaseAgreement" name="leaseAgreement" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, setLeaseAgreementPreview)} disabled={!isBusiness} />
                {leaseAgreementPreview && <a href={leaseAgreementPreview} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">View Uploaded Lease</a>}
                 {!isBusiness && <p className="text-xs text-muted-foreground">Available on the Business plan.</p>}
             </div>
          </div>

          <DialogFooter className="pt-4 !mt-8">
             <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" className="btn-gradient-glow">{tenant ? 'Save Changes' : 'Create Tenant'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteConfirmationDialog = ({ tenant, isOpen, setIsOpen, setAppState }) => {
    const { toast } = useToast();

    if(!tenant) return null;

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
            
            toast({ title: "Success", description: "Tenant and associated data deleted." });

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

const TenantDetailsModal = ({ tenant, room, isOpen, setIsOpen }) => {
  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col items-center text-center gap-4">
             <Avatar className="w-24 h-24 ring-2 ring-offset-2 ring-primary ring-offset-background">
                <AvatarImage src={tenant.profilePhotoUrl || undefined} alt={tenant.name} data-ai-hint="person face" />
                <AvatarFallback>{tenant.name?.charAt(0) || 'T'}</AvatarFallback>
             </Avatar>
            <DialogTitle className="text-2xl">{tenant.name}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><Mail className="w-4 h-4 text-muted-foreground" /><span>{tenant.username}</span></div>
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><Phone className="w-4 h-4 text-muted-foreground" /><span>{tenant.phone}</span></div>
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><Home className="w-4 h-4 text-muted-foreground" /><span>Room {tenant.unitNo} (Capacity: {room?.capacity})</span></div>
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><span>Rent: {tenant.rentAmount?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / month</span></div>
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><IdCard className="w-4 h-4 text-muted-foreground" /><span>Aadhaar: XXXX-XXXX-{(tenant.aadhaar || '').slice(-4)}</span></div>
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/50"><CalendarIcon className="w-4 h-4 text-muted-foreground" /><span>Lease: {tenant.leaseStartDate ? format(parseISO(tenant.leaseStartDate), 'dd MMM yyyy') : 'N/A'} to {tenant.leaseEndDate ? format(parseISO(tenant.leaseEndDate), 'dd MMM yyyy') : 'N/A'}</span></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NotificationModal = ({ tenant, isOpen, setIsOpen, setAppState }) => {
    const { toast } = useToast();
    const [message, setMessage] = useState('');

    if(!tenant) return null;

    const handleSend = () => {
        if (!message.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Notification message cannot be empty.' });
            return;
        }

        const newNotification = {
            id: Date.now().toString(),
            tenantId: tenant.id,
            message: message,
            createdAt: new Date().toISOString(),
            isRead: false,
        };
        
        setAppState(prev => ({
            ...prev,
            notifications: [...(prev.notifications || []), newNotification]
        }));
        
        toast({ title: "Success", description: `Notification sent to ${tenant.name}.` });
        setIsOpen(false);
        setMessage('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send Notification to {tenant.name}</DialogTitle>
                    <DialogDescription>
                        Type your message below. The tenant will see this in their notification panel.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="notification-message" className="sr-only">Message</Label>
                    <Textarea 
                        id="notification-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="e.g., Please collect your package from the office..."
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSend}>Send Notification</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function Tenants({ appState, setAppState }) {
  const { tenants, rooms, payments, notifications = [] } = appState;
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const availableUnits = useMemo(() => {
    const occupantsCount = tenants.reduce((acc, tenant) => {
      if(tenant.unitNo) {
        acc[tenant.unitNo] = (acc[tenant.unitNo] || 0) + 1;
      }
      return acc;
    }, {});

    return rooms
      .map(room => ({
        roomNumber: room.number,
        capacity: room.capacity,
        occupants: occupantsCount[room.number] || 0,
      }))
      .filter(room => room.occupants < room.capacity);
  }, [tenants, rooms]);

  const tenantsByRoom = useMemo(() => {
    const grouped = {};
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    rooms.forEach(room => {
        grouped[room.number] = {
            tenants: [],
            roomDetails: room,
        };
    });

    tenants.forEach(tenant => {
        const room = rooms.find(r => r.number === tenant.unitNo);
        if (room) {
            const monthlyCharges = (tenant.otherCharges || [])
              .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
              .reduce((sum, c) => sum + c.amount, 0);

            const monthlyBill = tenant.rentAmount + monthlyCharges;
            
            if (!grouped[tenant.unitNo]) {
                grouped[tenant.unitNo] = { tenants: [], roomDetails: room };
            }
            grouped[tenant.unitNo].tenants.push({ ...tenant, monthlyBill });
        }
    });

    return Object.fromEntries(
        Object.entries(grouped).sort(([roomA], [roomB]) => roomA.localeCompare(roomB, undefined, { numeric: true }))
    );
  }, [tenants, rooms]);
  
  const getRentStatus = (tenant) => {
    if (!tenant.dueDate || !isValid(parseISO(tenant.dueDate))) {
        return { label: 'Awaiting', color: 'secondary' };
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = parseISO(tenant.dueDate);
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    const room = rooms.find(r => r.number === tenant.unitNo);
    if (!room) return { label: 'Awaiting', color: 'secondary' };

    const monthlyCharges = (tenant.otherCharges || [])
      .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalDue = tenant.rentAmount + monthlyCharges;

    const paidThisMonth = payments
      .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
      .reduce((sum, p) => sum + p.amount, 0);

    if (paidThisMonth >= totalDue && totalDue > 0) return { label: 'Paid', color: 'success' };
    
    const daysDiff = differenceInDays(today, dueDate);
    if (daysDiff > 0 && totalDue > 0) return { label: 'Overdue', color: 'destructive' };
    
    return { label: 'Upcoming', color: 'warning' };
  };

  const handleOpenForm = (tenant) => {
    setSelectedTenant(tenant);
    setIsFormModalOpen(true);
  };
  
  const handleViewDetails = (tenant) => {
    setSelectedTenant(tenant);
    setIsDetailsModalOpen(true);
  };
  
  const handleDeleteTenant = (tenant) => {
    setSelectedTenant(tenant);
    setIsDeleteModalOpen(true);
  };

  const handleNotifyTenant = (tenant) => {
    setSelectedTenant(tenant);
    setIsNotifyModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Tenant Management</h2>
          <p className="text-muted-foreground">A complete list of all tenants in your properties.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)} className="btn-gradient-glow">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

       {tenants.length === 0 && Object.keys(tenantsByRoom).length === 0 ? (
        <Card className="glass-card text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
            <Users className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tenants Found</h3>
            <p className="mb-4">Get started by adding your first tenant.</p>
            <Button onClick={() => handleOpenForm(null)}>Add Your First Tenant</Button>
        </Card>
      ) : (
      <div className="space-y-8">
        {Object.values(tenantsByRoom).map(({ roomDetails, tenants: roomTenants }) => (
          <Card key={roomDetails.number} className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="text-primary"/>
                Room {roomDetails.number}
                <Badge variant="secondary">{roomTenants.length} Tenant(s)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Name</TableHead>
                      <TableHead>Monthly Bill</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomTenants.length > 0 ? roomTenants.map(tenant => {
                      const status = getRentStatus(tenant);
                      return (
                        <TableRow key={tenant.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10 border">
                                      <AvatarImage src={tenant.profilePhotoUrl || undefined} alt={tenant.name} data-ai-hint="person face" />
                                      <AvatarFallback>{tenant.name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-semibold">{tenant.name}</span>
                                    <p className="text-sm text-muted-foreground">{tenant.phone}</p>
                                  </div>
                              </div>
                          </TableCell>
                          <TableCell>{tenant.monthlyBill ? tenant.monthlyBill.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</TableCell>
                          <TableCell>{tenant.dueDate && isValid(parseISO(tenant.dueDate)) ? format(parseISO(tenant.dueDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={status.color} className={cn(
                              status.color === 'success' && 'bg-green-100 text-green-800 border-green-200',
                              status.color === 'destructive' && 'bg-red-100 text-red-800 border-red-200',
                              status.color === 'warning' && 'bg-yellow-100 text-yellow-800 border-yellow-200',
                              status.color === 'secondary' && 'bg-gray-100 text-gray-800 border-gray-200',
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
                                <DropdownMenuItem onClick={() => handleNotifyTenant(tenant)}>
                                  <MessageSquare className="mr-2 h-4 w-4" /> Send Notification
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenForm(tenant)}>
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
                    }) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                This room is empty. Assign a tenant to this room.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
      
      {isFormModalOpen && <TenantFormModal isOpen={isFormModalOpen} setIsOpen={setIsFormModalOpen} tenant={selectedTenant} setAppState={setAppState} availableUnits={availableUnits} rooms={rooms} tenants={tenants} appState={appState} />}
      {isDeleteModalOpen && <DeleteConfirmationDialog isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} tenant={selectedTenant} setAppState={setAppState} />}
      {isDetailsModalOpen && <TenantDetailsModal isOpen={isDetailsModalOpen} setIsOpen={setIsDetailsModalOpen} tenant={selectedTenant} room={rooms.find(r => r.number === selectedTenant?.unitNo) || null} />}
      {isNotifyModalOpen && <NotificationModal isOpen={isNotifyModalOpen} setIsOpen={setIsNotifyModalOpen} tenant={selectedTenant} setAppState={setAppState} />}
    </div>
  );
}

    
