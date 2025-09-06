
"use client";

import { useState } from 'react';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';

export default function NoticeBoard({ appState, setAppState }) {
  const { globalNotices = [] } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const { toast } = useToast();

  const handleAddNotice = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title');
    const message = formData.get('message');

    if (!title || !message) {
        toast({ variant: "destructive", title: "Error", description: "Title and message are required." });
        return;
    }
    
    const newNotice = {
      id: Date.now().toString(),
      title,
      message,
      createdAt: new Date().toISOString(),
    };
    
    setAppState(prev => ({ ...prev, globalNotices: [...(prev.globalNotices || []), newNotice] }));
    toast({ title: "Success", description: "Notice has been posted." });
    setIsAddModalOpen(false);
  };

  const confirmDeleteNotice = (notice) => {
    setNoticeToDelete(notice);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteNotice = () => {
    if (!noticeToDelete) return;
    setAppState(prev => ({ ...prev, globalNotices: (prev.globalNotices || []).filter(e => e.id !== noticeToDelete.id) }));
    toast({ title: "Success", description: "Notice has been deleted." });
    setIsDeleteAlertOpen(false);
    setNoticeToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold font-headline">Digital Notice Board</h2>
          <p className="text-muted-foreground">Post announcements for all your tenants.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" /> New Notice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>
                Fill out the fields to create a notice for all tenants.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddNotice} className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g., Water Supply Disruption" 
                    required 
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Provide details about the announcement..." 
                    required 
                    rows={8}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Post Notice</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {globalNotices.length === 0 ? (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl">
          <Megaphone className="mx-auto h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Notice Board is Empty</h3>
          <p>Post your first notice to communicate with all tenants at once.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {globalNotices.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(notice => (
            <Card key={notice.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{notice.title}</CardTitle>
                <CardDescription>{format(new Date(notice.createdAt), 'dd MMMM, yyyy - hh:mm a')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm whitespace-pre-wrap">{notice.message}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="destructive" size="sm" className="ml-auto" onClick={() => confirmDeleteNotice(notice)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this notice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoticeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
