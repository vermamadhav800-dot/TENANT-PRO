
"use client";

import { useState } from 'react';
import { Download, Trash2, Database, Shield, Lock, KeyRound, User as UserIcon, Zap, Save, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { INITIAL_APP_STATE, MOCK_USER_INITIAL } from '@/lib/consts';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings({ appState, setAppState, user }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(user);

  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // State for user profile
  const [userName, setUserName] = useState(user.name);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // State for defaults
  const [defaultRate, setDefaultRate] = useState(appState.defaults?.electricityRatePerUnit || 8);


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
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (currentPassword !== currentUser.password) {
        toast({ variant: "destructive", title: "Error", description: "Current password is incorrect." });
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
    
    setIsUpdatingPassword(true);
    // Simulate API call
    setTimeout(() => {
        setCurrentUser(prev => ({...prev, password: newPassword}));
        toast({ title: "Success", description: "Password updated successfully." });
        setIsUpdatingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }, 1000);
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    // Simulate API call
    setTimeout(() => {
      setCurrentUser(prev => ({ ...prev, name: userName }));
      toast({ title: "Success", description: "Profile updated successfully." });
      setIsUpdatingProfile(false);
    }, 1000);
  };
  
  const handleDefaultsUpdate = (e) => {
    e.preventDefault();
    setAppState(prev => ({
        ...prev,
        defaults: {
            ...prev.defaults,
            electricityRatePerUnit: Number(defaultRate)
        }
    }));
    toast({ title: "Success", description: "Default settings saved." });
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-headline">Application Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* User Profile Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><UserIcon className="mr-2" /> User Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                 <div>
                    <Label htmlFor="userName">Full Name</Label>
                    <Input id="userName" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="userUsername">Username</Label>
                    <Input id="userUsername" type="text" value={user.username} disabled />
                     <p className="text-xs text-muted-foreground mt-1">Username cannot be changed.</p>
                </div>
                <Button type="submit" className="w-full" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="mr-2" /> Security</CardTitle>
            <CardDescription>Change your login password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="currentPassword" type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pl-10"/>
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
                <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Change Password
                </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Column for other settings */}
        <div className="space-y-8">
            {/* Application Defaults Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Zap className="mr-2" /> Application Defaults</CardTitle>
                <CardDescription>Set default values for new entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDefaultsUpdate} className="space-y-4">
                    <div>
                        <Label htmlFor="defaultRate">Default Electricity Rate (per unit)</Label>
                        <Input id="defaultRate" type="number" step="0.01" value={defaultRate} onChange={(e) => setDefaultRate(Number(e.target.value))} required />
                    </div>
                    <Button type="submit" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Defaults</Button>
                </form>
              </CardContent>
            </Card>

            {/* Data Management Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Database className="mr-2" /> Data Management</CardTitle>
                <CardDescription>Export or clear all application data.</CardDescription>
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
        </div>
      </div>
    </div>
  );
}
