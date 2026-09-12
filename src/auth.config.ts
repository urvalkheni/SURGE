import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtectedRoute = [
        '/dashboard',
        '/forecast',
        '/risks',
        '/recommendations',
        '/scenarios',
        '/plant',
        '/settings',
        '/profile',
        '/onboarding',
      ].some((path) => nextUrl.pathname.startsWith(path));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/signup')) {
        const rawCallback = nextUrl.searchParams.get('callbackUrl');
        const safeCallback =
          rawCallback && rawCallback.startsWith('/') && !rawCallback.startsWith('//')
            ? rawCallback
            : '/dashboard';
        return Response.redirect(new URL(safeCallback, nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = (user as { role?: string }).role || 'Lead Operations Engineer';
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = ((token.id as string) || (token.sub as string)) ?? '';
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        (session.user as { role?: string }).role = (token.role as string) || 'Lead Operations Engineer';
      }
      return session;
    },
  },
  providers: [], // Initialized in src/auth.ts
  secret: process.env.AUTH_SECRET || 'surge-secret-key-production-fallback-32chars',
  trustHost: true,
};
