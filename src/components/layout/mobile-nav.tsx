'use client';

import * as React from 'react';
import { X, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppSidebar } from './app-sidebar';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Operator';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSignOut() {
    onClose();
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative flex-1 max-w-[280px] w-full bg-surface shadow-modal flex flex-col z-10 animate-in slide-in-from-left duration-250 ease-out">
        {/* Close Button Header */}
        <div className="absolute right-3 top-3.5 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-11 min-h-[44px] min-w-[44px] text-foreground-secondary hover:text-foreground flex items-center justify-center"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <AppSidebar className="w-full border-r-0" onNavigate={onClose} />
        </div>

        {/* Dedicated Mobile Account & Sign Out Section */}
        <div className="p-3 border-t border-border bg-[#F8FAF8] space-y-2.5">
          <Link
            href="/profile"
            onClick={onClose}
            className="flex items-center gap-2.5 p-2 rounded-md hover:bg-surface border border-transparent hover:border-border transition-colors min-h-[44px]"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-dark text-white font-mono text-xs font-semibold shrink-0 overflow-hidden">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="size-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{userName}</div>
              <div className="text-[10px] text-foreground-secondary truncate">{userEmail}</div>
            </div>
          </Link>

          <Button
            variant="secondary"
            className="w-full h-11 min-h-[44px] text-xs font-medium gap-2 justify-center text-critical hover:bg-critical/10 hover:text-critical border-border-subtle"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
