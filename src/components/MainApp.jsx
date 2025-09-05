
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
  Menu,
  Moon,
  Sun,
  Wallet,
  TrendingUp,
  Wrench,
  Megaphone,
} from "lucide-react";
import AppLogo from "@/components/AppLogo";
import Dashboard from "@/components/Dashboard";
import Tenants from "@/components/Tenants";
import Rooms from "@/components/Rooms";
import Payments from "@/components/Payments";
import Electricity from "@/components/Electricity";
import Reports from "@/components/Reports";
import AppSettings from "@/components/Settings";
import Expenses from "@/components/Expenses";
import Insights from "@/components/Insights";
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
import { Separator } from "./ui/separator";
import Approvals from "./Approvals";
import NoticeBoard from "./NoticeBoard";
import { useCollection, useDocument } from "@/lib/hooks";
import { LoaderCircle } from 'lucide-react';


const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "rooms", label: "Rooms", icon: DoorOpen },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "requests", label: "Requests", icon: Wrench },
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart },
  { id: "notices", label: "Notices", icon: Megaphone },
];

function AppContent({ activeTab, setActiveTab, user, userData }) {
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();

  // Fetch all data collections for the logged-in owner
  const { data: tenants, loading: tenantsLoading, error: tenantsError } = useCollection('tenants', user.uid);
  const { data: rooms, loading: roomsLoading, error: roomsError } = useCollection('rooms', user.uid);
  const { data: payments, loading: paymentsLoading, error: paymentsError } = useCollection('payments', user.uid);
  const { data: electricity, loading: electricityLoading, error: electricityError } = useCollection('electricity', user.uid);
  const { data: expenses, loading: expensesLoading, error: expensesError } = useCollection('expenses', user.uid);
  const { data: settings, loading: settingsLoading, error: settingsError } = useDocument('settings', user.uid);
  const { data: pendingApprovals, loading: approvalsLoading, error: approvalsError } = useCollection('approvals', user.uid);
  const { data: maintenanceRequests, loading: maintenanceLoading, error: maintenanceError } = useCollection('maintenanceRequests', user.uid);
  const { data: globalNotices, loading: noticesLoading, error: noticesError } = useCollection('notices', user.uid);
  
  const isLoading = tenantsLoading || roomsLoading || paymentsLoading || electricityLoading || expensesLoading || settingsLoading || approvalsLoading || maintenanceLoading || noticesLoading;
  const anyError = tenantsError || roomsError || paymentsError || electricityError || expensesError || settingsError || approvalsError || maintenanceError || noticesError;

  // The appState is now composed of data fetched from Firestore
  const appState = {
      tenants: tenants || [],
      rooms: rooms || [],
      payments: payments || [],
      electricity: electricity || [],
      expenses: expenses || [],
      defaults: settings || {},
      pendingApprovals: pendingApprovals || [],
      maintenanceRequests: maintenanceRequests || [],
      globalNotices: globalNotices || [],
      MOCK_USER_INITIAL: userData // We still pass user data for display
  }

  const renderTabContent = () => {
    // The setAppState prop is no longer needed as hooks handle state changes directly
    const props = { appState, user, userData };
    switch (activeTab) {
      case "dashboard":
        return <Dashboard {...props} setActiveTab={setActiveTab} />;
      case "insights":
        return <Insights {...props} />;
      case "tenants":
        return <Tenants {...props} />;
      case "rooms":
        return <Rooms {...props} />;
      case "payments":
        return <Payments {...props} />;
      case "requests":
        return <Approvals {...props} />;
      case "electricity":
        return <Electricity {...props} />;
      case "expenses":
        return <Expenses {...props} />;
      case "reports":
        return <Reports {...props} />;
      case "notices":
        return <NoticeBoard {...props} />;
      case "settings":
        return <AppSettings {...props} />;
      default:
        return <Dashboard {...props} setActiveTab={setActiveTab} />;
    }
  };
  
  const pendingApprovalsCount = (pendingApprovals || []).filter(a => a.status === 'pending').length;
  const pendingMaintenanceCount = (maintenanceRequests || []).filter(r => r.status === 'Pending').length;
  const totalPendingRequests = pendingApprovalsCount + pendingMaintenanceCount;

  return (
    <div className="flex-1 flex flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-2xl font-semibold capitalize">{TABS.find(t => t.id === activeTab)?.label}</h1>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
            </div>
        ) : anyError ? (
            <div className="flex justify-center items-center h-full text-red-500">
                Error loading data. Please refresh the page.
            </div>
        ) : (
            <div className="animate-fade-in">{renderTabContent()}</div>
        )}
      </main>
    </div>
  );
}

export default function MainApp({ onLogout, user, userData }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: pendingApprovals, loading: approvalsLoading } = useCollection('approvals', user.uid);
  const { data: maintenanceRequests, loading: maintenanceLoading } = useCollection('maintenanceRequests', user.uid);
  
  const totalPendingRequests = !approvalsLoading && !maintenanceLoading 
    ? ((pendingApprovals || []).filter(a => a.status === 'pending').length + (maintenanceRequests || []).filter(r => r.status === 'Pending').length)
    : 0;
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2.5 p-2">
              <AppLogo className="w-8 h-8" iconClassName="w-5 h-5" />
              <span className="text-lg font-semibold">EstateFlow</span>
            </div>
             <p className="text-xs text-center text-muted-foreground pb-2">Owner Panel</p>
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
                     {tab.id === 'requests' && totalPendingRequests > 0 && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {totalPendingRequests}
                        </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <div className="flex items-center gap-3 p-2 border-t">
               <Avatar className="h-9 w-9">
                  <AvatarImage src={userData.photoURL || `https://i.pravatar.cc/150?u=${userData.email}`} alt={userData.name} />
                  <AvatarFallback>{userData.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{userData.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
              </div>
            </div>
            <Separator className="my-1"/>
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
                   <SidebarMenuButton
                    onClick={onLogout}
                    tooltip={{ children: "Log Out" }}
                  >
                    <LogOut />
                    <span>Log Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <AppContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          userData={userData}
        />
      </div>
    </SidebarProvider>
  );
}
