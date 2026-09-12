'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  SlidersHorizontal, 
  Sun, 
  Settings, 
  User,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePlant } from '@/contexts/plant-context';

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'nominal' | 'warning' | 'critical' | 'info';
}

interface NavSection {
  label: string;
  items: SidebarLink[];
}

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { riskCount, recommendationCount } = usePlant();

  const navSections: NavSection[] = React.useMemo(() => [
    {
      label: 'OPERATIONS',
      items: [
        { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { title: 'Forecast (72h)', href: '/forecast', icon: TrendingUp },
        {
          title: 'Risk Ledger',
          href: '/risks',
          icon: AlertTriangle,
          badge: String(riskCount),
          badgeVariant: riskCount > 0 ? 'warning' : 'nominal',
        },
        {
          title: 'Recommendations',
          href: '/recommendations',
          icon: Zap,
          badge: String(recommendationCount),
          badgeVariant: recommendationCount > 0 ? 'critical' : 'nominal',
        },
      ],
    },
    {
      label: 'ANALYSIS',
      items: [
        { title: 'Scenario Sandbox', href: '/scenarios', icon: SlidersHorizontal },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { title: 'Plant Digital Twin', href: '/plant', icon: Sun },
        { title: 'Operator Profile', href: '/profile', icon: User },
        { title: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ], [riskCount, recommendationCount]);

  return (
    <aside
      className={cn(
        'flex flex-col h-full w-64 bg-surface border-r border-border select-none',
        className
      )}
      {...props}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 focus-ring rounded-md"
        >
          <div className="flex size-7 items-center justify-center rounded-sm bg-primary-dark text-white shadow-subtle">
            <Zap className="size-4" />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-foreground">
            RenewableIQ
          </span>
          <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-[#EAEFEA] text-foreground-secondary">
            v1.0
          </span>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <div className="px-3 text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 min-h-[40px] rounded-md text-sm font-medium transition-all focus-ring',
                    isActive
                      ? 'bg-primary-tint text-primary-dark font-semibold'
                      : 'text-foreground-secondary hover:bg-[#F3F6F3] hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'size-4 transition-colors',
                        isActive ? 'text-primary' : 'text-foreground-secondary group-hover:text-foreground'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>

                  {item.badge ? (
                    <Badge variant={item.badgeVariant || 'outline'} className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  ) : isActive ? (
                    <ChevronRight className="size-3 text-primary" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Operational Telemetry Summary Footer */}
      <div className="p-3 border-t border-border">
        <div className="p-3 rounded-md border border-border-subtle bg-[#F8FAF8] space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground-secondary">Grid Node:</span>
            <span className="font-mono text-foreground font-semibold">GETCO-220KV</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground-secondary">Interconnect:</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <Activity className="size-3" />
              <span>Synchronized</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
