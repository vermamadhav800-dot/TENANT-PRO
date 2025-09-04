"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bot, LoaderCircle, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Room } from '@/lib/types';
import { suggestOptimalRent, type RentOptimizationOutput } from '@/ai/flows/rent-optimization';

interface RentOptimizerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  room: Room;
}

const formSchema = z.object({
  location: z.string().min(1, "Location is required."),
  amenities: z.string().min(1, "Amenities are required."),
  marketRatesDescription: z.string().min(1, "Market rates description is required."),
});

export default function RentOptimizer({ isOpen, setIsOpen, room }: RentOptimizerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RentOptimizationOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      amenities: "",
      marketRatesDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await suggestOptimalRent({
        ...values,
        size: `${room.capacity}-person capacity room`,
      });
      setResult(output);
    } catch (error) {
      console.error("Rent optimization failed:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="mr-2 h-6 w-6" /> AI Rent Optimizer
          </DialogTitle>
          <DialogDescription>
            Get an AI-powered rent suggestion for Room {room.number}. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        {!result && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Koramangala, Bangalore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amenities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Furnished, AC, Wi-Fi, Parking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketRatesDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Market Rates</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Similar rooms in the area go for ₹15,000 - ₹18,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Suggest Rent"
                )}
              </Button>
            </form>
          </Form>
        )}
        
        {result && (
          <div className="space-y-4 pt-4 animate-fade-in">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Suggested Optimal Rent</p>
              <p className="text-4xl font-bold text-primary flex items-center justify-center">
                <IndianRupee className="h-8 w-8" />
                {result.suggestedRent.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Reasoning:</h4>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>
             <Button onClick={() => setResult(null)} className="w-full" variant="outline">
                Run New Analysis
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
