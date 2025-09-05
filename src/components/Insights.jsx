
"use client";

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Scale, PieChart as PieChartIcon, Bell, ShieldCheck, Trophy, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getInsights } from '@/lib/insights';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';


const ALERT_CONFIG = {
    'Lease Ending Soon': { icon: Bell, color: 'text-yellow-500' },
    'High Vacancy Rate': { icon: AlertTriangle, color: 'text-red-500' },
    'Top Performing Room': { icon: Trophy, color: 'text-green-500' },
    'Consistent Payer': { icon: ShieldCheck, color: 'text-blue-500' },
    'Overdue Payment': { icon: AlertTriangle, color: 'text-red-600 font-bold' },
};

const PIE_CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Insights({ appState }) {
  const insights = useMemo(() => getInsights(appState), [appState]);

  if (!insights) {
    return <div>Loading insights...</div>;
  }
  
  const { monthlyTrends, expenseBreakdown, alerts } = insights;
  
  const totalRevenue = monthlyTrends.reduce((acc, month) => acc + month.revenue, 0);
  const totalExpenses = monthlyTrends.reduce((acc, month) => acc + month.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
          <h2 className="text-3xl font-bold font-headline">Insights & Forecast</h2>
          <p className="text-muted-foreground">Your property's financial health and performance analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (Last 12 Months)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses (Last 12 Months)</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit (Last 12 Months)</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{netProfit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Financial Trends (Last 12 Months)</CardTitle>
            <CardDescription>Income, expenses, and profit over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ChartContainer config={{
                revenue: { label: 'Revenue', color: 'hsl(var(--chart-2))' },
                expenses: { label: 'Expenses', color: 'hsl(var(--chart-5))' },
                profit: { label: 'Profit', color: 'hsl(var(--chart-1))' },
            }} className="w-full h-full">
               <ComposedChart data={monthlyTrends}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Tooltip content={<ChartTooltipContent formatter={(value, name) => (<div><span className="font-medium">{`₹${value.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}</span><br/><span className="text-muted-foreground">{name}</span></div>)}/>} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                    <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} dot={false} />
                </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>What you're spending on.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full flex items-center justify-center">
             <ChartContainer config={{}} className="w-full h-full">
                <PieChart>
                    <Tooltip content={<ChartTooltipContent hideLabel formatter={(value, name) => (<div><span className="font-medium">{name}</span><br/><span className="text-muted-foreground">{`₹${value.toLocaleString('en-IN', {minimumFractionDigits: 2})}`}</span></div>)}/>} />
                    <Pie
                        data={expenseBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={2}
                    >
                      {expenseBreakdown.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={PIE_CHART_COLORS[expenseBreakdown.findIndex(e => e.name === entry.name) % PIE_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Alerts & Opportunities</CardTitle>
          <CardDescription>Automated insights to help you stay on top of your properties.</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <ul className="space-y-4">
              {alerts.map((alert, index) => {
                  const Icon = ALERT_CONFIG[alert.type].icon;
                  const color = ALERT_CONFIG[alert.type].color;
                  return(
                    <li key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                      <div className={cn("p-2 rounded-full", color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <p className={cn("font-semibold", alert.level === 'danger' && 'text-red-600')}>{alert.type}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </li>
                  )
              })}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="mx-auto h-12 w-12 mb-2" />
              <p>No alerts or opportunities right now.</p>
              <p className="text-sm">The system will notify you about important events here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    