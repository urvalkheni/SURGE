'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function AccountMenu() {
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Om Mistry';
  const userEmail = session?.user?.email || 'om.mistry@renewableiq.internal';
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 h-10 px-2 sm:px-2.5 rounded-md border border-border-subtle bg-[#F8FAF8] hover:bg-[#EFF3F0] hover:border-border transition-colors focus-ring outline-none select-none min-h-[44px] min-w-[44px]"
        aria-label={`User account menu for ${userName}`}
      >
        {/* User Avatar */}
        <div className="flex size-7 items-center justify-center rounded-full bg-primary-dark text-white font-mono text-xs font-semibold shrink-0 shadow-2xs overflow-hidden">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt={userName} className="size-full object-cover" />
          ) : (
            <span>{userInitials}</span>
          )}
        </div>

        {/* User Name & Chevron (visible sm+) */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-foreground leading-none">
            {userName}
          </span>
          <span className="text-[10px] text-muted font-mono tracking-tight leading-none mt-1">
            Lead Operations
          </span>
        </div>

        <ChevronDown className="size-3.5 text-foreground-secondary ml-0.5 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-modal">
        {/* User Identity Header */}
        <DropdownMenuLabel className="font-normal px-2.5 py-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground font-display">
                {userName}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-primary-tint text-primary-dark font-medium uppercase">
                <Shield className="size-2.5" />
                Operator
              </span>
            </div>
            <span className="text-[11px] text-foreground-secondary truncate">
              {userEmail}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground hover:text-primary cursor-pointer rounded-xs"
          >
            <User className="size-3.5 text-foreground-secondary" />
            <span>Operator Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-foreground hover:text-primary cursor-pointer rounded-xs"
          >
            <Settings className="size-3.5 text-foreground-secondary" />
            <span>Platform Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out Action */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2.5 py-2 text-xs text-critical hover:bg-critical/10 focus:bg-critical/10 focus:text-critical cursor-pointer rounded-xs font-medium"
        >
          <LogOut className="size-3.5" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
