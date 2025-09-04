import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  color?: "primary" | "success" | "warning" | "danger";
}

export default function StatCard({ title, value, icon: Icon, description, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "from-blue-400 to-sky-500",
    success: "from-green-400 to-emerald-500",
    warning: "from-yellow-400 to-amber-500",
    danger: "from-red-400 to-rose-500",
  };

  const descriptionColorClasses = {
    primary: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br", colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && <p className={cn("text-xs mt-1", descriptionColorClasses[color])}>{description}</p>}
      </CardContent>
    </Card>
  );
}
