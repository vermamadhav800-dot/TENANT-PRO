
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, description, color = "primary" }) {
  const colorClasses = {
    primary: "from-blue-500 to-cyan-500",
    success: "from-green-500 to-emerald-500",
    warning: "from-yellow-500 to-amber-500",
    danger: "from-red-500 to-rose-500",
  };

  const descriptionColorClasses = {
    primary: "text-blue-400",
    success: "text-green-400",
    warning: "text-yellow-400",
    danger: "text-red-400",
  }

  return (
    <Card className="glass-card hover:border-primary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-lg", colorClasses[color], `shadow-${color}-500/30`)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className={cn("text-xs mt-1 font-medium", descriptionColorClasses[color])}>{description}</p>}
      </CardContent>
    </Card>
  );
}
