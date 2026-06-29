'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  BarChart3, Code2, Trophy, Lightbulb,
  ListOrdered, User, Home, Zap, Menu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SyncButton } from '@/components/shared/SyncButton';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/rating', label: 'Rating Graph', icon: BarChart3 },
  { href: '/dashboard/contests', label: 'Contests', icon: Trophy },
  { href: '/dashboard/topics', label: 'Topics', icon: Code2 },
  { href: '/dashboard/heatmap', label: 'Activity', icon: Zap },
  { href: '/dashboard/insights', label: 'AI Insights', icon: Lightbulb },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: ListOrdered },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">
          CP<span className="text-gradient">Analytics</span>
        </span>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'User'}
              className="w-8 h-8 rounded-full ring-2 ring-brand-500/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href as Route}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400 border border-brand-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-brand-500')} />
              {label}
              {label === 'AI Insights' && (
                <span className="ml-auto text-[10px] bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full font-semibold">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 pt-2 border-t border-border space-y-2">
        <SyncButton />
        <ThemeToggle />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-card h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-card border border-border rounded-lg flex items-center justify-center shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-card border-r border-border h-full z-50">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}
