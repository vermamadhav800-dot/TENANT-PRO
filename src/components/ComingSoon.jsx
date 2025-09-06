
"use client";

import { Sparkles } from 'lucide-react';

export default function ComingSoon({ title = "Coming Soon!", description = "This feature is currently under construction. Check back later!" }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 animate-pulse">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}

    