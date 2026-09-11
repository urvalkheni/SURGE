'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { AuthSessionProvider } from './session-provider';

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
        {children}
      </ThemeProvider>
    </AuthSessionProvider>
  );
}

