/**
 * Site Metadata & Configuration
 */
export const siteConfig = {
  name: 'RenewableIQ',
  shortName: 'RenewableIQ',
  description:
    'AI-powered renewable energy generation forecasting and grid intelligence platform for commercial asset owners and transmission operators.',
  url: 'https://renewableiq.energy',
  ogImage: 'https://renewableiq.energy/og.jpg',
  author: 'RenewableIQ Engineering Team',
  links: {
    docs: '/docs',
    dashboard: '/dashboard',
    github: 'https://github.com/renewableiq/renewableiq',
  },
  telemetry: {
    defaultRefreshIntervalMs: 60000,
    heartbeatIntervalMs: 5000,
    defaultPlantId: 'desert-sun-04',
  },
} as const;
