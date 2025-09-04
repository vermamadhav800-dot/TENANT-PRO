
import { 
  startOfMonth, 
  subMonths, 
  format, 
  eachMonthOfInterval, 
  differenceInDays, 
  parseISO,
  isAfter
} from 'date-fns';
import type { AppState, Tenant, Payment, Expense, Room } from './types';

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseBreakdown {
  name: string;
  value: number;
}

export interface InsightAlert {
  type: 'Lease Ending Soon' | 'High Vacancy Rate' | 'Top Performing Room' | 'Consistent Payer';
  message: string;
  level: 'info' | 'warning' | 'success';
}

export interface InsightsData {
  monthlyTrends: MonthlyTrend[];
  expenseBreakdown: ExpenseBreakdown[];
  alerts: InsightAlert[];
}

export function getInsights(appState: AppState): InsightsData {
  const { payments, expenses, tenants, rooms } = appState;
  
  // 1. Monthly Financial Trends for the last 12 months
  const now = new Date();
  const last12Months = eachMonthOfInterval({
    start: subMonths(now, 11),
    end: now,
  });

  const monthlyTrends = last12Months.map(monthStart => {
    const month = format(monthStart, 'MMM yyyy');
    const monthIndex = monthStart.getMonth();
    const year = monthStart.getFullYear();

    const monthlyPayments = payments.filter(p => {
      const pDate = parseISO(p.date);
      return pDate.getMonth() === monthIndex && pDate.getFullYear() === year;
    });
    const revenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = (expenses || []).filter(e => {
        const eDate = parseISO(e.date);
        return eDate.getMonth() === monthIndex && eDate.getFullYear() === year;
    });
    const expenseTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      month,
      revenue,
      expenses: expenseTotal,
      profit: revenue - expenseTotal,
    };
  });

  // 2. Expense Breakdown
  const expenseCategories = (expenses || []).reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseBreakdown = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value,
  })).sort((a,b) => b.value - a.value);


  // 3. Alerts and Opportunities
  const alerts: InsightAlert[] = [];
  
  // Lease Ending Soon Alert
  tenants.forEach(tenant => {
    if (tenant.dueDate) {
      const dueDate = parseISO(tenant.dueDate);
      const daysUntilDue = differenceInDays(dueDate, now);
      // This logic is simplistic. A real app would have a lease end date.
      // We'll simulate by checking if the next due date is within 30 days.
      if (daysUntilDue > 0 && daysUntilDue <= 30) {
        alerts.push({
          type: 'Lease Ending Soon',
          message: `${tenant.name}'s rent is due in ${daysUntilDue} days. Consider discussing renewal.`,
          level: 'warning',
        });
      }
    }
  });

  // High Vacancy Rate Alert
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const occupiedBeds = tenants.length;
  const occupancyRate = totalCapacity > 0 ? occupiedBeds / totalCapacity : 1;
  if (occupancyRate < 0.7) {
      alerts.push({
          type: 'High Vacancy Rate',
          message: `Occupancy is at ${Math.round(occupancyRate * 100)}%. Focus on filling empty rooms.`,
          level: 'warning',
      });
  }

  // Top Performing Room Alert
  const roomPerformance = rooms.map(room => {
      const roomRevenue = payments.filter(p => tenants.find(t => t.id === p.tenantId)?.unitNo === room.number)
                                  .reduce((sum, p) => sum + p.amount, 0);
      return { roomNumber: room.number, revenue: roomRevenue };
  }).sort((a, b) => b.revenue - a.revenue);

  if (roomPerformance.length > 0 && roomPerformance[0].revenue > 0) {
      alerts.push({
          type: 'Top Performing Room',
          message: `Room ${roomPerformance[0].roomNumber} is your highest earner with a total revenue of ${roomPerformance[0].revenue.toLocaleString()}.`,
          level: 'success'
      });
  }
  
  // Consistent Payer Alert
  const threeMonthsAgo = subMonths(now, 3);
  tenants.forEach(tenant => {
      const recentPayments = payments.filter(p => p.tenantId === tenant.id && isAfter(parseISO(p.date), threeMonthsAgo));
      // Simple check: at least 3 payments in last 3 months
      if (recentPayments.length >= 3) {
           alerts.push({
               type: 'Consistent Payer',
               message: `${tenant.name} has been paying consistently. Acknowledge their reliability!`,
               level: 'info'
           });
      }
  });


  return {
    monthlyTrends,
    expenseBreakdown,
    alerts: alerts.slice(0, 5), // Limit to 5 most relevant alerts
  };
}
