import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
  noPadding = false,
}: SectionCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <div className="flex items-start justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-brand-500" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-sm">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className={cn(!noPadding && 'p-6', bodyClassName)}>{children}</div>
    </div>
  );
}
