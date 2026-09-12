import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/forecast/:path*',
    '/risks/:path*',
    '/recommendations/:path*',
    '/scenarios/:path*',
    '/plant/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
  ],
};
