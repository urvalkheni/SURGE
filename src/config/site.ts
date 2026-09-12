/**
 * Site Metadata & Configuration
 */
export const siteConfig = {
  name: 'RenewableIQ',
  shortName: 'RenewableIQ',
  tagline: 'See the Shift. Before It Hits.',
  expansion: 'Renewable Generation Intelligence & Grid Execution',
  description:
    'RenewableIQ — See the Shift. Before It Hits. Industrial renewable generation forecasting, physical modeling, and grid compliance intelligence platform.',
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
