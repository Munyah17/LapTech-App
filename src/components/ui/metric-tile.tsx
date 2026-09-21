import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "./card";

interface MetricTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; up: boolean };
  className?: string;
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  trend,
  className,
}: MetricTileProps) {
  return (
    <Card className={cn("p-4 flex items-center gap-3.5", className)}>
      <div className="size-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
        <Icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[12px] text-muted-foreground truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-[20px] font-bold tnum tracking-tight leading-tight">
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px] font-medium rounded-full px-1.5 py-0.5",
                trend.up
                  ? "bg-success-soft text-success"
                  : "bg-destructive-soft text-destructive"
              )}
            >
              {trend.up ? (
                <TrendingUp className="size-3" aria-hidden />
              ) : (
                <TrendingDown className="size-3" aria-hidden />
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
