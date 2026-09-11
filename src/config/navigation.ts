/**
 * Navigation Configuration
 * Defines operational sidebar links, landing navigation, and breadcrumb registries.
 */

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  badgeVariant?: 'nominal' | 'warning' | 'critical' | 'info';
  description?: string;
}

export const navigationConfig = {
  landing: [
    { title: 'Platform', href: '#platform' },
    { title: 'Forecast Engine', href: '#forecast-engine' },
    { title: 'Intelligence Pipeline', href: '#pipeline' },
    { title: 'What-If Lab', href: '#what-if' },
    { title: 'Impact', href: '#impact' },
  ],

  operational: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      description: 'Master operational overview and KPI telemetry',
    },
    {
      title: 'Forecast',
      href: '/forecast',
      icon: 'TrendingUp',
      description: '72-Hour continuous time-series forecast workbench',
    },
    {
      title: 'Risk Intelligence',
      href: '/risks',
      icon: 'AlertTriangle',
      badge: '2',
      badgeVariant: 'warning',
      description: 'Active ramp hazards and anomaly detection ledger',
    },
    {
      title: 'Recommendations',
      href: '/recommendations',
      icon: 'Zap',
      badge: '1',
      badgeVariant: 'critical',
      description: 'Prescriptive asset dispatch and BESS optimization',
    },
    {
      title: 'Scenario Sandbox',
      href: '/scenarios',
      icon: 'SlidersHorizontal',
      description: 'Interactive what-if simulation laboratory',
    },
    {
      title: 'Plant Digital Twin',
      href: '/plant',
      icon: 'Sun',
      description: 'Solar array, BESS, and inverter configuration',
    },
  ] as NavItem[],

  utilities: [
    {
      title: 'Settings',
      href: '/settings',
      icon: 'Settings',
    },
    {
      title: 'Documentation',
      href: '/docs',
      icon: 'BookOpen',
    },
  ] as NavItem[],
} as const;
