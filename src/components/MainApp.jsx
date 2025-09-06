
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
  CheckCircle,
  Lock,
  FolderArchive,
  BrainCircuit,
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import Documents from "./Documents";
import AIAssistant from "./AIAssistant";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, plan: 'standard', group: 'main' },
  { id: "tenants", label: "Tenants", icon: Users, plan: 'standard', group: 'management' },
  { id: "rooms", label: "Rooms", icon: DoorOpen, plan: 'standard', group: 'management' },
  { id: "payments", label: "Payments", icon: CreditCard, plan: 'standard', group: 'management' },
  { id: "requests", label: "Requests", icon: Wrench, plan: 'standard', group: 'operations' },
  { id: "notices", label: "Notices", icon: Megaphone, plan: 'standard', group: 'operations' },
  { id: "electricity", label: "Electricity", icon: Zap, plan: 'standard', group: 'operations' },
  { id: "insights", label: "Insights", icon: TrendingUp, plan: 'pro', group: 'analytics' },
  { id: "expenses", label: "Expenses", icon: Wallet, plan: 'pro', group: 'analytics' },
  { id: "documents", label: "Documents", icon: FolderArchive, plan: 'business', group: 'analytics' },
  { id: "ai-assistant", label: "AI Assistant", icon: BrainCircuit, plan: 'business', group: 'analytics' },
  { id: "reports", label: "Reports", icon: BarChart, plan: 'pro', group: 'analytics' },
];

const TAB_GROUPS = ['main', 'management', 'operations', 'analytics'];


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
      case "documents":
        return <Documents {...props} />;
      case "ai-assistant":
        return <AIAssistant {...props} />;
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

  const currentTabInfo = TABS.find(t => t.id === activeTab) || {};
  const currentTabLabel = activeTab === 'upgrade' ? 'Upgrade Plan' : (currentTabInfo.label || 'Dashboard');

  return (
    <div className="flex-1 flex flex-col bg-background/90">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/10 bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        {isMobile && <SidebarTrigger />}
        <h1 className="text-2xl font-semibold capitalize">{currentTabLabel}</h1>
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
  const { toast } = useToast();
  
  const pendingApprovalsCount = (appState.pendingApprovals || []).length;
  const pendingMaintenanceCount = (appState.maintenanceRequests || []).filter(r => r.status === 'Pending').length;
  const pendingUpdateRequestsCount = (appState.updateRequests || []).length;
  const totalPendingRequests = pendingApprovalsCount + pendingMaintenanceCount + pendingUpdateRequestsCount;

  const currentPlan = appState.defaults?.subscriptionPlan || 'standard';
  const isPro = currentPlan === 'pro' || currentPlan === 'business';
  const isBusiness = currentPlan === 'business';

  const handleTabClick = (tab) => {
    const planOrder = { standard: 1, pro: 2, business: 3 };
    const currentPlanRank = planOrder[currentPlan] || 1;
    const requiredPlanRank = planOrder[tab.plan] || 1;

    if (currentPlanRank < requiredPlanRank) {
      setActiveTab('upgrade');
      toast({
        variant: "destructive",
        title: "Upgrade Required",
        description: `The "${tab.label}" feature is only available on the ${tab.plan.charAt(0).toUpperCase() + tab.plan.slice(1)} plan or higher.`
      });
    } else {
      setActiveTab(tab.id);
    }
  }

  useEffect(() => {
    const { defaults = {}, tenants = [], payments = [], rooms = [] } = appState;
    const { reminderSettings = {} } = defaults;
    
    if (!reminderSettings.enabled || !isPro) return;

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

        if (pendingAmount <= 0) return;

        const hasRecentReminder = (appState.notifications || []).some(n => 
            n.tenantId === tenant.id && 
            new Date(n.createdAt).getTime() > now.getTime() - (reminderSettings.overdueDays * 24 * 60 * 60 * 1000)
        );

        if (hasRecentReminder) return;

        if (daysUntilDue > 0 && daysUntilDue <= reminderSettings.beforeDays) {
            newNotifications.push({
                id: `${tenant.id}-upcoming-${now.getTime()}`,
                tenantId: tenant.id,
                message: `Reminder: Your rent of ${pendingAmount.toFixed(2)} is due in ${daysUntilDue} day(s).`,
                createdAt: now.toISOString(),
                isRead: false,
            });
        }

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
        defaults: { ...prev.defaults, lastReminderCheck: now.toISOString() }
      }));
    } else {
       setAppState(prev => ({
        ...prev,
        defaults: { ...prev.defaults, lastReminderCheck: now.toISOString() }
      }));
    }
  }, [appState.tenants, appState.payments, appState.rooms, appState.defaults.reminderSettings, isPro, setAppState]);


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
              {TAB_GROUPS.map((group, index) => (
                <div key={group}>
                  {index > 0 && <Separator className="my-2" />}
                  {TABS.filter(tab => tab.group === group).map(tab => {
                    const planOrder = { standard: 1, pro: 2, business: 3 };
                    const currentPlanRank = planOrder[currentPlan] || 1;
                    const requiredPlanRank = planOrder[tab.plan] || 1;
                    const isLocked = currentPlanRank < requiredPlanRank;
                    
                    return (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          onClick={() => handleTabClick(tab)}
                          isActive={activeTab === tab.id}
                          tooltip={{ children: tab.label }}
                          disabled={isLocked}
                          className={cn(isLocked && "cursor-not-allowed")}
                        >
                          <tab.icon />
                          <span>{tab.label}</span>
                          {tab.id === 'requests' && totalPendingRequests > 0 && (
                              <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                  {totalPendingRequests}
                              </span>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="ml-auto bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                              {tab.plan.charAt(0).toUpperCase() + tab.plan.slice(1)}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </div>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <div className="p-2">
              {currentPlan === 'standard' ? (
                <Button className="w-full font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105" onClick={() => setActiveTab('upgrade')}>
                  <Star className="mr-2 h-4 w-4 text-black" />
                  Upgrade Plan
                </Button>
              ) : (
                <div 
                  className={cn(
                    "w-full text-center p-2 rounded-lg text-sm font-semibold flex items-center justify-center",
                    currentPlan === 'pro' && "bg-blue-500/20 text-blue-300",
                    currentPlan === 'business' && "bg-violet-500/20 text-violet-300"
                  )}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan</span>
                </div>
              )}
            </div>
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
                    onClick={() => setActiveTab("upgrade")}
                    isActive={activeTab === "upgrade"}
                    tooltip={{ children: "Manage Plan" }}
                  >
                    <Star />
                    <span>Manage Plan</span>
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
