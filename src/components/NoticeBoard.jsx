
"use client";

import { useState } from 'react';
import { Plus, Trash2, Megaphone, Sparkles, LoaderCircle } from 'lucide-react';
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
import { generateNotice } from '@/ai/flows/generateNoticeFlow';

export default function NoticeBoard({ appState, setAppState }) {
  const { globalNotices = [] } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const { toast } = useToast();

  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);


  const handleGenerateNotice = async () => {
    if (!aiPrompt) {
      toast({ variant: "destructive", title: "Error", description: "Please provide a topic for the AI to write about." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateNotice(aiPrompt);
      setGeneratedTitle(result.title);
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate notice. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

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
    setAiPrompt('');
    setGeneratedTitle('');
    setGeneratedMessage('');
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
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Digital Notice Board</h2>
          <p className="text-muted-foreground">Post announcements for all your tenants.</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Notice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
              <DialogDescription>
                Describe the notice in a few words to generate it with AI, or fill out the fields manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label htmlFor="ai-prompt">What is this notice about?</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="ai-prompt" 
                            name="ai-prompt" 
                            placeholder="e.g., water cut tomorrow 10am to 2pm"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <Button type="button" onClick={handleGenerateNotice} disabled={isGenerating}>
                            {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            <span className="sr-only">Generate with AI</span>
                        </Button>
                    </div>
                </div>
            </div>
            <form onSubmit={handleAddNotice} className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g., Water Supply Disruption" 
                    required 
                    value={generatedTitle}
                    onChange={(e) => setGeneratedTitle(e.target.value)}
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
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
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
