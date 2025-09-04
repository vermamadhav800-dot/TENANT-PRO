
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Download, Trash2, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AppState } from '@/lib/types';
import { INITIAL_APP_STATE } from '@/lib/consts';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SettingsProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}

export default function Settings({ appState, setAppState }: SettingsProps) {
  const { toast } = useToast();

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
          <CardContent className="space-y-4 text-center text-muted-foreground pt-8">
            <p>More security features coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
