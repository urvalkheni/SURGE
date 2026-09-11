import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

const hasGoogleAuth = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...(hasGoogleAuth
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    Credentials({
      id: 'demo-operator',
      name: 'Demo Operator',
      credentials: {
        role: { label: 'Role', type: 'text', placeholder: 'Lead Operations Engineer' },
      },
      authorize: async () => {
        return {
          id: 'usr-om-01',
          name: 'Om Mistry',
          email: 'om.mistry@renewableiq.internal',
          image: null,
        };
      },
    }),
  ],
});
