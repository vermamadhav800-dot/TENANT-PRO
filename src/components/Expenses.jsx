
"use client";

import { useState } from 'react';
import { Plus, Trash2, Wallet, Calendar, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from './StatCard';
import { useToast } from "@/hooks/use-toast";

export default function Expenses({ appState, setAppState }) {
  const { expenses = [] } = appState;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const { toast } = useToast();

  const handleAddExpense = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newExpense = {
      id: Date.now().toString(),
      description: formData.get('description'),
      category: formData.get('category'),
      amount: Number(formData.get('amount')),
      date: new Date(formData.get('date')).toISOString(),
    };
    
    setAppState(prev => ({ ...prev, expenses: [...(prev.expenses || []), newExpense] }));
    toast({ title: "Success", description: "Expense added successfully." });
    setIsAddModalOpen(false);
  };

  const confirmDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteExpense = () => {
    if (!expenseToDelete) return;
    setAppState(prev => ({ ...prev, expenses: (prev.expenses || []).filter(e => e.id !== expenseToDelete.id) }));
    toast({ title: "Success", description: "Expense deleted." });
    setIsDeleteAlertOpen(false);
    setExpenseToDelete(null);
  };
  
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
  });
  
  const totalMonthlyExpense = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold font-headline">Expense Tracking</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Expense</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4 py-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" required />
              </div>
               <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" required defaultValue="Maintenance">
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Repairs">Repairs</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Taxes">Taxes</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required />
              </div>
              <div>
                <Label htmlFor="date">Expense Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <DialogFooter><Button type="submit">Add Expense</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="This Month's Expenses" value={`₹${totalMonthlyExpense.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon={Calendar} color="danger" />
        <StatCard title="Total Expenses" value={`₹${totalExpense.toLocaleString('en-IN', {minimumFractionDigits: 2})}`} icon={BarChart2} color="warning" />
        <StatCard title="Expense Count" value={expenses.length.toString()} icon={Wallet} color="primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Expense History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No expenses recorded yet.</TableCell></TableRow>
              ) : (
                expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell><span className="px-2 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">{expense.category}</span></TableCell>
                      <TableCell className="font-semibold text-red-600">₹{expense.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => confirmDeleteExpense(expense)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExpense}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    