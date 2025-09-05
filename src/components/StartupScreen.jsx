"use client";

import { Building2, LoaderCircle } from 'lucide-react';

export default function StartupScreen() {
  return (
    <div className="fixed inset-0 dark-bg-grid flex items-center justify-center z-50">
      <div className="text-center">
        <div className="animate-fade-in-scale mb-8">
          <div className="w-32 h-32 bg-gradient-to-r from-primary to-sky-400 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Building2 className="text-white h-16 w-16" />
          </div>
        </div>
        <div className="animate-slide-up">
          <h1 className="text-white text-5xl font-bold mb-4 font-headline">EstateFlow</h1>
          <p className="text-white/90 text-xl mb-8">Next-Generation Tenant Management</p>
          <div className="flex items-center justify-center space-x-2">
            <LoaderCircle className="w-5 h-5 text-white animate-spin" />
            <span className="text-white text-lg">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
