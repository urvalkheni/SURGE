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
      ].some((path) => nextUrl.pathname.startsWith(path));

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
  providers: [], // Initialized in src/auth.ts
  secret: process.env.AUTH_SECRET || 'renewableiq-secret-key-production-fallback-32chars',
  trustHost: true,
};
