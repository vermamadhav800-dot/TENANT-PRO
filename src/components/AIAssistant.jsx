"use client";

import { BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AIAssistant() {
  return (
    <div className="space-y-6">
       <div className="space-y-1">
        <h2 className="text-3xl font-bold font-headline">AI Financial Analyst</h2>
        <p className="text-muted-foreground">Chat with an AI to get instant answers to complex financial questions.</p>
      </div>

      <Card className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-2xl glass-card">
          <BrainCircuit className="mx-auto h-16 w-16 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
          <p>The AI Financial Analyst feature is currently under development.</p>
          <p className="text-sm">You'll soon be able to ask questions like "What was my net profit in Q2?" or "Which room has the highest maintenance cost?".</p>
      </Card>
    </div>
  );
}
