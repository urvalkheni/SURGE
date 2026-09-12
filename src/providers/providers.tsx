'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { AuthSessionProvider } from './session-provider';
import { PlantProvider } from '@/contexts/plant-context';

export interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root Application Providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <PlantProvider>
          {children}
        </PlantProvider>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}

