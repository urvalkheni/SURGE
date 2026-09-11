'use client';

import * as React from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';
import { MobileNav } from './mobile-nav';

export interface AppShellProps {
  children: React.ReactNode;
  activePlantId?: string;
}

export function AppShell({ children, activePlantId: initialPlantId = 'ahmedabad-solar-01' }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [activePlantId, setActivePlantId] = React.useState(initialPlantId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar (Permanent docked on lg+) */}
      <AppSidebar className="hidden lg:flex shrink-0" />

      {/* Mobile Navigation Drawer (Slide-out on < lg) */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Viewport Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <AppHeader
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          activePlantId={activePlantId}
          onPlantChange={setActivePlantId}
        />

        <main id="main-content" className="flex-1 overflow-y-auto focus-ring">
          {children}
        </main>
      </div>
    </div>
  );
}
