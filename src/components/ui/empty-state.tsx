import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {hint && (
        <p className="text-[13px] text-muted-foreground mt-1 max-w-xs">{hint}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
