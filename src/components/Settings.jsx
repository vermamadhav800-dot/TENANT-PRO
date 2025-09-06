
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Palette, Upload, Trash2, Import, AlertTriangle, FileJson, Type } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from './ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from './ui/textarea';


export default function AppSettings({ appState, setAppState, user }) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [defaults, setDefaults] = useState(appState.defaults);
  const [currentUser, setCurrentUser] = useState(appState.MOCK_USER_INITIAL);
  const [qrCodePreview, setQrCodePreview] = useState(appState.defaults.qrCodeUrl || null);
  const isPro = appState.defaults.subscriptionPlan === 'pro' || appState.defaults.subscriptionPlan === 'business';
  
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false);
  const [dataToImport, setDataToImport] = useState(null);
  const [importText, setImportText] = useState('');

  const handleDefaultsChange = (e) => {
    const { name, value, type } = e.target;
    setDefaults(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };
  
  const handleReminderSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDefaults(prev => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        [name]: type === 'checkbox' ? checked : Number(value),
      }
    }));
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };
  
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

  const handleSave = () => {
    setAppState(prev => ({ 
      ...prev, 
      defaults: {
        ...defaults,
        qrCodeUrl: qrCodePreview,
      }, 
      MOCK_USER_INITIAL: { ...prev.MOCK_USER_INITIAL, ...currentUser } 
    }));
    toast({
      title: "Settings Saved",
      description: "Your new settings have been applied.",
    });
  };

  const handleImportFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          setDataToImport(importedData);
          setIsImportAlertOpen(true);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Import Failed",
            description: "The selected file is not valid JSON.",
          });
        }
      };
      reader.readAsText(file);
    } else {
       toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select a valid .json file.",
      });
    }
     // Reset the file input so the same file can be selected again
    e.target.value = null;
  };
  
  const handleTextImport = () => {
    if (!importText.trim()) {
        toast({
            variant: "destructive",
            title: "Import Failed",
            description: "The text box is empty. Please paste your JSON data.",
        });
        return;
    }

    try {
        const importedData = JSON.parse(importText);
        setDataToImport(importedData);
        setIsImportAlertOpen(true);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Import Failed",
            description: "The pasted text is not valid JSON.",
        });
    }
  };

  const handleConfirmImport = () => {
    if (dataToImport) {
      // The imported data is the entire app state, so we set it directly.
      setAppState(dataToImport);
      toast({
        title: 'Import Successful',
        description:
          'Your data has been restored. The application will now reload.',
      });
      // A reload is the safest way to ensure all components refresh with the new state.
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    setIsImportAlertOpen(false);
    setDataToImport(null);
    setImportText('');
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage your application and user settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize the look and feel of your application.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 sm:gap-4">
            <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                onClick={() => setTheme('light')}
                className="flex-1 sm:flex-none"
            >
                <Sun className="mr-2 h-4 w-4" /> Light
            </Button>
            <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
                 className="flex-1 sm:flex-none"
            >
                <Moon className="mr-2 h-4 w-4" /> Dark
            </Button>
             <Button 
                variant={theme === 'system' ? 'default' : 'outline'} 
                onClick={() => setTheme('system')}
                 className="flex-1 sm:flex-none"
            >
                <Palette className="mr-2 h-4 w-4" /> System
            </Button>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>Automations</CardTitle>
            <CardDescription>Configure automated features like payment reminders. <span className="text-amber-500 font-semibold">(Pro Feature)</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                <div>
                    <Label htmlFor="enable-reminders" className="font-semibold">Enable Automatic Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send payment reminders to tenants automatically.</p>
                </div>
                <Switch 
                    id="enable-reminders"
                    name="enabled"
                    checked={defaults.reminderSettings?.enabled || false}
                    onCheckedChange={(checked) => handleReminderSettingsChange({ target: { name: 'enabled', type: 'checkbox', checked } })}
                    disabled={!isPro}
                    className="shrink-0"
                />
            </div>
            {defaults.reminderSettings?.enabled && isPro && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 ml-2">
                    <div>
                        <Label htmlFor="beforeDays">Remind Before Due Date (Days)</Label>
                        <Input
                            id="beforeDays"
                            name="beforeDays"
                            type="number"
                            value={defaults.reminderSettings?.beforeDays || 3}
                            onChange={handleReminderSettingsChange}
                        />
                         <p className="text-xs text-muted-foreground mt-1">A reminder will be sent this many days before the due date.</p>
                    </div>
                     <div>
                        <Label htmlFor="overdueDays">Remind When Overdue (Every X Days)</Label>
                        <Input
                            id="overdueDays"
                            name="overdueDays"
                            type="number"
                            value={defaults.reminderSettings?.overdueDays || 3}
                            onChange={handleReminderSettingsChange}
                        />
                         <p className="text-xs text-muted-foreground mt-1">A new reminder will be sent if payment is still overdue after this many days.</p>
                    </div>
                </div>
            )}
             {!isPro && (
              <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                Upgrade to the Pro plan to unlock automated payment reminders.
              </div>
            )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Property & Payment Settings</CardTitle>
          <CardDescription>Set default values and your property and payment details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
             <div className="relative">
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
           <div className="space-y-2 pt-4 border-t mt-4">
              <Label>Payment QR Code</Label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {qrCodePreview && (
                  <img src={qrCodePreview} alt="QR Code Preview" className="w-24 h-24 rounded-md border p-1"/>
                )}
                <div className="flex-1">
                  <Input 
                    id="qrCode"
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={(e) => handleFileChange(e, setQrCodePreview)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload a QR code image. Tenants will see this image to make payments.
                  </p>
                  {qrCodePreview && (
                    <Button variant="link" className="text-red-500 p-0 h-auto mt-2" onClick={() => setQrCodePreview(null)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
        </CardContent>
      </Card>
       
       <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Import your application data from a backup file. This is useful for backups and transfers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="import-backup" className="font-semibold">Option 1: Import from File (Desktop)</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                        <Label htmlFor="import-backup" className="cursor-pointer">
                            <FileJson className="mr-2 h-4 w-4" /> Select JSON File
                        </Label>
                    </Button>
                    <Input id="import-backup" type="file" accept=".json,application/json" className="sr-only" onChange={handleImportFileSelect} />
                    <p className="text-sm text-muted-foreground flex-1">Importing will overwrite all current data.</p>
                </div>
            </div>
             <div className="border-t pt-6 space-y-2">
                 <Label htmlFor="import-text" className="font-semibold">Option 2: Import from Text (Mobile)</Label>
                 <p className="text-sm text-muted-foreground">Copy the text from your JSON backup file and paste it here.</p>
                 <Textarea 
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='Paste your JSON content here...'
                    rows={6}
                 />
                 <Button onClick={handleTextImport} className="w-full sm:w-auto">
                    <Type className="mr-2 h-4 w-4" /> Import Pasted Data
                 </Button>
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
            <Label htmlFor="username">Email (Username)</Label>
            <Input id="username" name="username" value={currentUser.username} onChange={handleUserChange} disabled />
          </div>
           <div>
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" placeholder="Enter new password (optional)" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="btn-gradient-glow w-full sm:w-auto">Save All Settings</Button>
      </div>

       <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Overwrite All Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import this data? This action cannot be undone and will permanently replace all existing data in the application with the contents of the backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsImportAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>Yes, Overwrite and Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    
