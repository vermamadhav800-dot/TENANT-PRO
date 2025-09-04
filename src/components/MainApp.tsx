
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
  Menu,
  Moon,
  Sun,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import AppLogo from "@/components/AppLogo";
import Dashboard from "@/components/Dashboard";
import Tenants from "@/components/Tenants";
import Rooms from "@/components/Rooms";
import Payments from "@/components/Payments";
import Electricity from "@/components/Electricity";
import Reports from "@/components/Reports";
import AppSettings from "@/components/Settings";
import RentAdvisor from "@/components/RentAdvisor";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import type { User, AppState } from '@/lib/types';

interface MainAppProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  user: User;
  onLogout: () => void;
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "reports", label: "Reports", icon: BarChart },
  { id: "rent-advisor", label: "Rent Advisor", icon: Sparkles },
];

function AppContent({
  activeTab,
  appState,
  setAppState,
  setActiveTab,
  user,
}: {
  activeTab: string;
  appState: AppState;
  setAppState: (state: AppState) => void;
  setActiveTab: any;
  user: User;
}) {
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();

  const renderTabContent = () => {
    const props = { appState, setAppState };
    switch (activeTab) {
      case "dashboard":
        return <Dashboard {...props} setActiveTab={setActiveTab} />;
      case "tenants":
        return <Tenants {...props} />;
      case "rooms":
        return <Rooms {...props} />;
      case "payments":
        return <Payments {...props} />;
      case "electricity":
        return <Electricity {...props} />;
      case "reports":
        return <Reports {...props} />;
      case "rent-advisor":
        return <RentAdvisor {...props} />;
      case "settings":
        return <AppSettings {...props} user={user} />;
      default:
        return <Dashboard {...props} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-2xl font-semibold">{TABS.find(t => t.id === activeTab)?.label || 'Settings'}</h1>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="animate-fade-in">{renderTabContent()}</div>
      </main>
    </div>
  );
}

export default function MainApp({ appState, setAppState, onLogout, user }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!appState) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your data...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2.5 p-2">
              <AppLogo className="w-8 h-8" iconClassName="w-5 h-5" />
              <span className="text-lg font-semibold">EstateFlow</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {TABS.map((tab) => (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(tab.id)}
                    isActive={activeTab === tab.id}
                    tooltip={{ children: tab.label }}
                  >
                    <tab.icon />
                    <span>{tab.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab("settings")}
                    isActive={activeTab === "settings"}
                    tooltip={{ children: "Settings" }}
                  >
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 p-2">
                   <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${user.username}`} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={onLogout} aria-label="Log out">
                    <LogOut className="w-5 h-5"/>
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <AppContent
          activeTab={activeTab}
          appState={appState}
          setAppState={setAppState}
          setActiveTab={setActiveTab}
          user={user}
        />
      </div>
    </SidebarProvider>
  );
}
