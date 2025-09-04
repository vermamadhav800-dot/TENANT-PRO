"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  CreditCard,
  Zap,
  BarChart,
  Settings,
  LogOut,
  Building2,
  Signal,
  SignalHigh,
  SignalLow,
} from "lucide-react";
import AppLogo from "@/components/AppLogo";
import Dashboard from "@/components/Dashboard";
import Tenants from "@/components/Tenants";
import Rooms from "@/components/Rooms";
import Payments from "@/components/Payments";
import Electricity from "@/components/Electricity";
import Reports from "@/components/Reports";
import AppSettings from "@/components/Settings";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/lib/hooks";
import { INITIAL_APP_STATE, MOCK_USER } from "@/lib/consts";
import { cn } from "@/lib/utils";

interface MainAppProps {
  onLogout: () => void;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "reports", label: "Reports", icon: BarChart },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MainApp({ onLogout }: MainAppProps) {
  const [appState, setAppState] = useLocalStorage("estateflow_appState", INITIAL_APP_STATE);
  const [activeTab, setActiveTab] = useState("tenants");
  const [isOnline, setIsOnline] = useState(true);

  const renderTabContent = () => {
    const props = { appState, setAppState };
    switch (activeTab) {
      case "dashboard": return <Dashboard {...props} setActiveTab={setActiveTab} />;
      case "tenants": return <Tenants {...props} />;
      case "rooms": return <Rooms {...props} />;
      case "payments": return <Payments {...props} />;
      case "electricity": return <Electricity {...props} />;
      case "reports": return <Reports {...props} />;
      case "settings": return <AppSettings {...props} />;
      default: return <Tenants {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-primary to-sky-400 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <AppLogo className="h-10 w-10" iconClassName="h-6 w-6" />
              <h1 className="text-2xl font-bold font-headline text-white">EstateFlow</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-2 text-sm text-white/90">
                 {isOnline ? <SignalHigh className="w-4 h-4 text-green-300" /> : <SignalLow className="w-4 h-4 text-red-300" />}
                 <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
              <div className="hidden sm:block text-white text-right">
                <div className="text-sm">Welcome back,</div>
                <div className="font-semibold">{MOCK_USER.name}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} className="text-white hover:bg-white/20">
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 border-b">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm sm:text-base font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-accent text-accent-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="animate-fade-in">{renderTabContent()}</div>
      </main>
    </div>
  );
}
