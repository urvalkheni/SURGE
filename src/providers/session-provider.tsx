'use client';

import * as React from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export interface AuthSessionProviderProps {
  children: React.ReactNode;
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
