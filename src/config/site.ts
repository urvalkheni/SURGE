/**
 * Site Metadata & Configuration
 */
export const siteConfig = {
  name: 'SURGE',
  shortName: 'SURGE',
  description:
    'SURGE — Forecast the Grid. Before the Gap. AI-powered renewable generation forecasting and grid intelligence platform.',
  url: 'https://surge.energy',
  ogImage: '/surge-logo-horizontal.png',
  author: 'SURGE Engineering Team',
  links: {
    docs: '/docs',
    dashboard: '/dashboard',
    github: 'https://github.com/surge-energy/surge',
  },
  telemetry: {
    defaultRefreshIntervalMs: 60000,
    heartbeatIntervalMs: 5000,
    defaultPlantId: 'desert-sun-04',
  },
} as const;
