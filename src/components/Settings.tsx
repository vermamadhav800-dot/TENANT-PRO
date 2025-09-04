
"use client";

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Download, Trash2, Database, Shield, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AppState, User } from '@/lib/types';
import { INITIAL_APP_STATE } from '@/lib/consts';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
}

export default function Settings({ appState, setAppState, user, setUser }: SettingsProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(appState, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estateflow-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "All data has been exported." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to export data." });
    }
  };

  const handleClearData = () => {
    setAppState(INITIAL_APP_STATE);
    toast({ title: "Success", description: "All application data has been cleared." });
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== user.password) {
        toast({ variant: "destructive", title: "Error", description: "Current password does not match." });
        return;
    }
    if (newPassword !== confirmPassword) {
        toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
        return;
    }
    if (newPassword.length < 8) {
        toast({ variant: "destructive", title: "Error", description: "New password must be at least 8 characters long." });
        return;
    }
    
    setUser(prevUser => ({ ...prevUser, password: newPassword }));
    toast({ title: "Success", description: "Password updated successfully." });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-headline">Application Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Database className="mr-2" /> Data Management</CardTitle>
            <CardDescription>Export your data or clear everything to start fresh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleExportData} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Export All Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all rooms, tenants, and payments. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2" /> Security</CardTitle>
            <CardDescription>Manage your application's security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleChangePassword} className="space-y-4">
                 <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="currentPassword" type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="newPassword" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                 <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="confirmPassword" type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10"/>
                    </div>
                </div>
                <Button type="submit" className="w-full">Change Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
