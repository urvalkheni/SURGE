'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * Architectural Theme Provider
 * Defaults to Light mode as mandated by industrial control room specifications.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme={undefined}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
