import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "success" | "warning" | "destructive" | "info" | "neutral" | "brand";

const tones: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  destructive: "bg-destructive-soft text-destructive",
  info: "bg-info-soft text-info",
  neutral: "bg-muted text-muted-foreground",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

/** Maps order/booking statuses to badge tones. */
const statusTone: Record<string, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  IN_PROGRESS: "info",
  OUT_FOR_DELIVERY: "brand",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  IN_PROGRESS: "In Progress",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone[status] ?? "neutral"}>
      {statusLabel[status] ?? status}
    </Badge>
  );
}
