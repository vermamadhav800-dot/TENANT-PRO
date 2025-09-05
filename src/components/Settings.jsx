
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function AppSettings({ appState, setAppState, user }) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [defaults, setDefaults] = useState(appState.defaults);
  const [currentUser, setCurrentUser] = useState(user);

  const handleDefaultsChange = (e) => {
    const { name, value, type } = e.target;
    setDefaults(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setAppState(prev => ({ ...prev, defaults }));
    // In a real app, you would also save the user details to your backend.
    // For this mock app, we'll just show a toast.
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage your application and user settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize the look and feel of your application.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                onClick={() => setTheme('light')}
            >
                <Sun className="mr-2 h-4 w-4" /> Light
            </Button>
            <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
            >
                <Moon className="mr-2 h-4 w-4" /> Dark
            </Button>
             <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                onClick={() => setTheme('system')}
            >
                <Palette className="mr-2 h-4 w-4" /> System
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Property & Payment Settings</CardTitle>
          <CardDescription>Set default values and your property and payment details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <Label htmlFor="propertyName">Property Name</Label>
              <Input
                id="propertyName"
                name="propertyName"
                type="text"
                placeholder="e.g., Happy Homes PG"
                value={defaults.propertyName || ''}
                onChange={handleDefaultsChange}
              />
            </div>
            <div>
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                name="propertyAddress"
                type="text"
                placeholder="e.g., 123 Main St, Anytown"
                value={defaults.propertyAddress || ''}
                onChange={handleDefaultsChange}
              />
            </div>
            <div>
              <Label htmlFor="electricityRatePerUnit">Default Electricity Rate (per Unit)</Label>
              <Input
                id="electricityRatePerUnit"
                name="electricityRatePerUnit"
                type="number"
                value={defaults.electricityRatePerUnit}
                onChange={handleDefaultsChange}
              />
            </div>
            <div>
              <Label htmlFor="upiId">Your UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                type="text"
                placeholder="e.g., yourname@okhdfcbank"
                value={defaults.upiId || ''}
                onChange={handleDefaultsChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={currentUser.name} onChange={handleUserChange} />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={currentUser.username} onChange={handleUserChange} disabled />
          </div>
           <div>
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" placeholder="Enter new password (optional)" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">Save All Settings</Button>
      </div>
    </div>
  );
}
