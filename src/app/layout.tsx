import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/providers';
import { siteConfig } from '@/config/site';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — AI Renewable Generation Forecasting & Grid Intelligence`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'renewable energy',
    'generation forecasting',
    'grid intelligence',
    'solar forecasting',
    'ramp risk detection',
    'bess dispatch',
    'clean energy',
  ],
  authors: [{ name: siteConfig.author }],
  icons: {
    icon: '/surge-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-white">
        {/* WCAG Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 rounded-md bg-primary-dark px-4 py-2 text-sm font-medium text-white shadow-modal focus-ring"
        >
          Skip to Main Content
        </a>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
