
"use client";

import { useState, useEffect } from "react";
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
  Star,
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
import { differenceInDays, parseISO } from 'date-fns';
import Upgrade from "./Upgrade";

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

function AppContent({ activeTab, setActiveTab, appState, setAppState, user }) {
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();

  const renderTabContent = () => {
    const props = { appState, setAppState, user, setActiveTab };
    switch (activeTab) {
      case "dashboard":
        return <Dashboard {...props} />;
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
      case "upgrade":
        return <Upgrade {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  const currentTab = TABS.find(t => t.id === activeTab) || { label: 'Upgrade to Pro' };

  return (
    <div className="flex-1 flex flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-2xl font-semibold capitalize">{currentTab.label}</h1>
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

export default function MainApp({ onLogout, user, appState, setAppState }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const pendingApprovalsCount = (appState.pendingApprovals || []).length;
  const pendingMaintenanceCount = (appState.maintenanceRequests || []).filter(r => r.status === 'Pending').length;
  const totalPendingRequests = pendingApprovalsCount + pendingMaintenanceCount;

  useEffect(() => {
    const { defaults = {}, tenants = [], payments = [], rooms = [] } = appState;
    const { reminderSettings = {} } = defaults;
    
    if (!reminderSettings.enabled) return;

    // Throttle the reminder check to once every 6 hours
    const lastCheck = new Date(appState.defaults.lastReminderCheck || 0);
    const now = new Date();
    if (now.getTime() - lastCheck.getTime() < 6 * 60 * 60 * 1000) {
        return;
    }

    const newNotifications = [];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    tenants.forEach(tenant => {
        if (!tenant.dueDate) return;

        const dueDate = parseISO(tenant.dueDate);
        const daysUntilDue = differenceInDays(dueDate, now);

        // Calculate pending amount
        const room = rooms.find(r => r.number === tenant.unitNo);
        if (!room) return;

        const monthlyCharges = (tenant.otherCharges || [])
            .filter(c => new Date(c.date).getMonth() === thisMonth && new Date(c.date).getFullYear() === thisYear)
            .reduce((sum, c) => sum + c.amount, 0);

        const totalDue = tenant.rentAmount + monthlyCharges;

        const paidThisMonth = payments
            .filter(p => p.tenantId === tenant.id && new Date(p.date).getMonth() === thisMonth && new Date(p.date).getFullYear() === thisYear)
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingAmount = totalDue - paidThisMonth;

        if (pendingAmount <= 0) return; // Skip if paid

        const hasRecentReminder = (appState.notifications || []).some(n => 
            n.tenantId === tenant.id && 
            new Date(n.createdAt).getTime() > now.getTime() - (reminderSettings.overdueDays * 24 * 60 * 60 * 1000)
        );

        if (hasRecentReminder) return;

        // Upcoming Reminder
        if (daysUntilDue > 0 && daysUntilDue <= reminderSettings.beforeDays) {
            newNotifications.push({
                id: `${tenant.id}-upcoming-${now.getTime()}`,
                tenantId: tenant.id,
                message: `Reminder: Your rent of ${pendingAmount.toFixed(2)} is due in ${daysUntilDue} day(s).`,
                createdAt: now.toISOString(),
                isRead: false,
            });
        }

        // Overdue Reminder
        if (daysUntilDue < 0) {
             newNotifications.push({
                id: `${tenant.id}-overdue-${now.getTime()}`,
                tenantId: tenant.id,
                message: `Your rent payment of ${pendingAmount.toFixed(2)} is overdue. Please pay as soon as possible.`,
                createdAt: now.toISOString(),
                isRead: false,
            });
        }
    });

    if (newNotifications.length > 0) {
      setAppState(prev => ({
        ...prev,
        notifications: [...(prev.notifications || []), ...newNotifications],
        defaults: {
            ...prev.defaults,
            lastReminderCheck: now.toISOString(),
        }
      }));
    } else {
       setAppState(prev => ({
        ...prev,
        defaults: {
            ...prev.defaults,
            lastReminderCheck: now.toISOString(),
        }
      }));
    }
  }, [appState.tenants, appState.payments, appState.rooms, appState.defaults.reminderSettings]);


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
            {appState.defaults.subscriptionPlan === 'free' && (
              <div className="p-2">
                 <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-amber-500/50 transition-shadow" onClick={() => setActiveTab('upgrade')}>
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
             <div className="flex items-center gap-3 p-2 border-t">
               <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.username}`} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.username}</p>
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
          appState={appState}
          setAppState={setAppState}
          user={user}
        />
      </div>
    </SidebarProvider>
  );
}
