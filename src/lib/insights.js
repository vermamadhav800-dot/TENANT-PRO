
import { 
  startOfMonth, 
  subMonths, 
  format, 
  eachMonthOfInterval, 
  differenceInDays, 
  parseISO,
  isAfter,
  isBefore
} from 'date-fns';

export function getInsights(appState) {
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
  }, {});

  const expenseBreakdown = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value,
  })).sort((a,b) => b.value - a.value);


  // 3. Alerts and Opportunities
  const alerts = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  tenants.forEach(tenant => {
    if (!tenant.dueDate || !parseISO(tenant.dueDate)) return;

    const dueDate = parseISO(tenant.dueDate);
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();
    
    // Lease Ending/Rent Due Soon Alert
    const daysUntilDue = differenceInDays(dueDate, today);
    if (daysUntilDue > 0 && daysUntilDue <= 7) {
      alerts.push({
        type: 'Lease Ending Soon',
        message: `${tenant.name}'s rent is due in ${daysUntilDue} days.`,
        level: 'warning',
      });
    }

    // Overdue Payment Alert
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

    if (isBefore(dueDate, today) && pendingAmount > 0) {
       const daysOverdue = differenceInDays(today, dueDate);
       alerts.push({
        type: 'Overdue Payment',
        message: `${tenant.name} is overdue by ${daysOverdue} day(s). Pending: ${pendingAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}.`,
        level: 'danger',
      });
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
          message: `Room ${roomPerformance[0].roomNumber} is your highest earner with a total revenue of ${roomPerformance[0].revenue.toLocaleString('en-IN')}.`,
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

  // Sort alerts by level: danger, warning, success, info
  const alertOrder = { 'danger': 1, 'warning': 2, 'success': 3, 'info': 4 };
  const sortedAlerts = alerts.sort((a, b) => alertOrder[a.level] - alertOrder[b.level]);

  return {
    monthlyTrends,
    expenseBreakdown,
    alerts: sortedAlerts.slice(0, 5), // Limit to 5 most relevant alerts
  };
}
