/**
 * roles.js
 * --------
 * Central Role-Based Access Control (RBAC) and Role-Specific Dashboard Configuration
 * for RenewableIQ / SURGE.
 * 
 * Supports the 4 primary operational roles:
 * 1. Chief Grid Dispatcher
 * 2. Plant Operations Engineer
 * 3. Energy Trading Analyst
 * 4. REMC Desk Officer
 */

export const PERMISSIONS = {
  VIEW: 'VIEW',
  ANALYZE: 'ANALYZE',
  ACKNOWLEDGE: 'ACKNOWLEDGE',
  RECOMMEND: 'RECOMMEND',
  CONTROL: 'CONTROL',
  ADMIN: 'ADMIN',
};

export const ACCESS_LEVELS = {
  FULL: 'FULL',
  LIMITED: 'LIMITED',
  READ_ONLY: 'READ_ONLY',
  HIDDEN: 'HIDDEN',
};

export const DATA_SCOPES = {
  GRID: 'GRID',
  ASSIGNED_PLANT: 'ASSIGNED_PLANT',
  COMMERCIAL: 'COMMERCIAL',
  REGIONAL_MULTI_PLANT: 'REGIONAL_MULTI_PLANT',
};

export const MULTI_PLANT_DATA = [
  {
    id: 'sanand-solar',
    name: 'Sanand Solar PV Cluster',
    type: 'Solar PV',
    capacityMw: 250,
    actualMw: 128.8,
    forecastMw: 140.0,
    scheduleMw: 136.0,
    deviationMw: -11.2,
    riskLevel: 'Medium',
    availabilityPct: 96.4,
    cufPct: 22.8,
    prPct: 79.8,
    location: 'Sanand, Gujarat',
    gridNode: 'GETCO-220kV Sanand',
    invertersOnline: '38/40',
    weatherImpactMw: -8.5,
  },
  {
    id: 'bhadla-solar',
    name: 'Bhadla Solar Park',
    type: 'Solar PV',
    capacityMw: 300,
    actualMw: 286.0,
    forecastMw: 295.0,
    scheduleMw: 290.0,
    deviationMw: -9.0,
    riskLevel: 'Low',
    availabilityPct: 98.2,
    cufPct: 24.5,
    prPct: 81.2,
    location: 'Phalodi, Rajasthan',
    gridNode: 'PGCIL-400kV Bhadla-II',
    invertersOnline: '48/48',
    weatherImpactMw: -2.1,
  },
  {
    id: 'jaisalmer-wind',
    name: 'Jaisalmer Wind Park',
    type: 'Wind',
    capacityMw: 250,
    actualMw: 176.0,
    forecastMw: 220.0,
    scheduleMw: 205.0,
    deviationMw: -44.0,
    riskLevel: 'High',
    availabilityPct: 92.0,
    cufPct: 28.4,
    prPct: 76.5,
    location: 'Jaisalmer, Rajasthan',
    gridNode: 'RVPN-220kV Amarsagar',
    invertersOnline: '92/100 Turbines',
    weatherImpactMw: -38.0,
  },
  {
    id: 'kutch-wind',
    name: 'Kutch Wind Corridor',
    type: 'Wind',
    capacityMw: 350,
    actualMw: 310.0,
    forecastMw: 325.0,
    scheduleMw: 320.0,
    deviationMw: -15.0,
    riskLevel: 'Medium',
    availabilityPct: 97.1,
    cufPct: 33.2,
    prPct: 82.0,
    location: 'Bhuj/Anjar, Gujarat',
    gridNode: 'GETCO-400kV Nakhatrana',
    invertersOnline: '136/140 Turbines',
    weatherImpactMw: -12.4,
  },
  {
    id: 'charanka-solar',
    name: 'Charanka Solar Park',
    type: 'Solar PV',
    capacityMw: 220,
    actualMw: 195.0,
    forecastMw: 210.0,
    scheduleMw: 205.0,
    deviationMw: -15.0,
    riskLevel: 'Medium',
    availabilityPct: 95.8,
    cufPct: 21.9,
    prPct: 78.4,
    location: 'Patan, Gujarat',
    gridNode: 'GETCO-400kV Charanka Pooling',
    invertersOnline: '33/35',
    weatherImpactMw: -9.8,
  },
  {
    id: 'pavagada-solar',
    name: 'Pavagada Solar Park',
    type: 'Solar PV',
    capacityMw: 450,
    actualMw: 425.0,
    forecastMw: 420.0,
    scheduleMw: 420.0,
    deviationMw: 5.0,
    riskLevel: 'Low',
    availabilityPct: 99.1,
    cufPct: 23.6,
    prPct: 80.9,
    location: 'Tumakuru, Karnataka',
    gridNode: 'KPTCL-400kV Pavagada Master',
    invertersOnline: '72/72',
    weatherImpactMw: 1.2,
  },
];

export const ROLES = {
  chief_grid_dispatcher: {
    id: 'chief_grid_dispatcher',
    name: 'Chief Grid Dispatcher',
    title: 'Chief Grid Dispatcher',
    roleTag: 'Grid Operations Intelligence',
    primaryQuestion: 'Can I keep supply and demand balanced?',
    defaultUser: 'Chief Grid Dispatcher',
    defaultEmail: 'dispatcher@sldc.gujarat.gov.in',
    defaultStation: 'Gujarat SLDC - Gotri, Vadodara',
    colorTheme: 'blue',
    badgeVariant: 'bg-blue-50 text-blue-700 border-blue-200',
    accentColor: '#2563eb',
    dataScope: DATA_SCOPES.GRID,
    permissions: [
      PERMISSIONS.VIEW,
      PERMISSIONS.ANALYZE,
      PERMISSIONS.ACKNOWLEDGE,
      PERMISSIONS.RECOMMEND,
      PERMISSIONS.CONTROL,
      PERMISSIONS.ADMIN,
    ],
    moduleAccess: {
      dashboard: ACCESS_LEVELS.FULL,
      forecast: ACCESS_LEVELS.FULL,
      alerts: ACCESS_LEVELS.FULL,
      plants: ACCESS_LEVELS.FULL,
      grid: ACCESS_LEVELS.HIDDEN,
      battery: ACCESS_LEVELS.FULL,
      recommendations: ACCESS_LEVELS.FULL,
      weather: ACCESS_LEVELS.FULL,
      accuracy: ACCESS_LEVELS.FULL,
      settings: ACCESS_LEVELS.LIMITED,
    },
    navLabels: {
      dashboard: 'Command Center',
      forecast: 'Forecast',
      alerts: 'Risk & Alerts',
      plants: 'Plants',
      grid: 'Grid & Demand',
      battery: 'Battery & Storage',
      recommendations: 'AI Advisory',
      weather: 'Weather',
      accuracy: 'Analytics',
      settings: 'Settings',
    },
    commandCenter: {
      heading: 'Grid Command Center',
      subheading: 'Grid-wide renewable dispatch, load balancing, reserve triage & BESS control',
      focusBadge: 'System Operations & Balance',
      kpis: [
        { id: 'curr_gen', label: 'Current Renewable Gen', value: '485.0 MW', change: '+14 MW/h', status: 'optimal', note: 'Solar (285) + Wind (200)' },
        { id: 'curr_demand', label: 'Current Demand', value: '620.0 MW', change: 'Evening ramp', status: 'warning', note: 'SLDC Substation Load' },
        { id: 'net_balance', label: 'Net Grid Balance', value: '-135.0 MW', change: 'Deficit shortfall', status: 'critical', note: 'Requires peaker / BESS' },
        { id: 'fc_gen', label: 'Forecast Renewable Gen', value: '510.0 MW', change: 'Next 4 hours', status: 'optimal', note: 'P50 ML hybrid model' },
        { id: 'exp_deficit', label: 'Expected Deficit', value: '-182.0 MW', change: 'Peak at 19:30', status: 'critical', note: 'Window 18:00 – 22:00' },
        { id: 'bess_soc', label: 'BESS Available Energy', value: '90.0 MW', change: '78% SOC ready', status: 'optimal', note: '180 MWh total pool' },
        { id: 'backup_req', label: 'Remaining Backup Req.', value: '45.0 MW', change: 'Thermal peaker', status: 'warning', note: '45 MW spinning reserve' },
        { id: 'confidence', label: 'Forecast Confidence', value: '94.2%', change: 'High agreement', status: 'optimal', note: 'Physics + Quantile band' },
      ],
      upcomingRisk: {
        timeWindow: '18:00 – 22:00 IST',
        title: 'Expected Renewable Deficit: -182 MW',
        severity: 'CRITICAL',
        likelyRange: '155 – 210 MW',
        confidence: 'High (94.2%)',
        impact: 'Moderate – High Grid Frequency Threat',
        causes: [
          'Solar PV output falling to 0 MW past sunset (18:30 IST)',
          'Wind generation tapering from 210 MW to 165 MW across Kutch corridor',
          'Evening state grid demand climbing to 680 MW peak load',
          'Battery BESS state-of-charge capacity limited to 90 MW discharge'
        ],
        solutionSummary: 'Demand = 620 MW | Renewable = 485 MW | Net Deficit = -135 MW. Battery available = 90 MW. Remaining backup requirement = 45 MW.',
      },
      allowedActions: [
        { id: 'investigate_risk', label: 'Investigate Risk', type: 'navigate', target: '/alerts', variant: 'primary' },
        { id: 'approve_bess', label: 'Approve BESS Dispatch', type: 'dispatch_modal', actionType: 'BESS_DISCHARGE', defaultMw: 90, variant: 'warning' },
        { id: 'schedule_backup', label: 'Schedule Backup', type: 'dispatch_modal', actionType: 'THERMAL_PEAKER', defaultMw: 45, variant: 'secondary' },
        { id: 'ack_alert', label: 'Acknowledge Alert', type: 'acknowledge', variant: 'outline' },
        { id: 'view_plants', label: 'View Affected Plants', type: 'navigate', target: '/plants', variant: 'outline' },
      ],
    },
  },

  plant_operations_engineer: {
    id: 'plant_operations_engineer',
    name: 'Plant Operations Engineer',
    title: 'Plant Operations Engineer',
    roleTag: 'Plant Performance Intelligence',
    primaryQuestion: 'Is my plant producing what it should, and if not, why?',
    defaultUser: 'Rohan Mehta',
    defaultEmail: 'rohan.mehta@sanand.energy.internal',
    defaultStation: 'Sanand Solar PV Cluster - Substation 4',
    colorTheme: 'amber',
    badgeVariant: 'bg-amber-50 text-amber-700 border-amber-200',
    accentColor: '#d97706',
    dataScope: DATA_SCOPES.ASSIGNED_PLANT,
    assignedPlantId: 'sanand-solar',
    permissions: [
      PERMISSIONS.VIEW,
      PERMISSIONS.ANALYZE,
      PERMISSIONS.ACKNOWLEDGE,
      PERMISSIONS.RECOMMEND,
    ],
    moduleAccess: {
      dashboard: ACCESS_LEVELS.LIMITED,
      forecast: ACCESS_LEVELS.FULL,
      alerts: ACCESS_LEVELS.FULL,
      plants: ACCESS_LEVELS.FULL,
      grid: ACCESS_LEVELS.HIDDEN,
      battery: ACCESS_LEVELS.HIDDEN,
      recommendations: ACCESS_LEVELS.FULL,
      weather: ACCESS_LEVELS.FULL,
      accuracy: ACCESS_LEVELS.FULL,
      settings: ACCESS_LEVELS.LIMITED,
    },
    navLabels: {
      dashboard: 'Plant Overview',
      forecast: 'Forecast',
      alerts: 'Risk & Alerts',
      plants: 'Plants',
      grid: 'Grid Context',
      battery: 'Battery & Storage',
      recommendations: 'AI Advisory',
      weather: 'Weather',
      accuracy: 'Analytics',
      settings: 'Settings',
    },
    commandCenter: {
      heading: 'Plant Operations Center',
      subheading: 'Technical performance, inverter health, string losses & plant forecast deviation',
      focusBadge: 'Assigned Asset: Sanand Solar PV (250 MW)',
      kpis: [
        { id: 'inst_cap', label: 'Installed Capacity', value: '250.0 MW', change: 'Fixed nameplate', status: 'optimal', note: '125 MWp DC x 2 phases' },
        { id: 'exp_gen', label: 'Expected Generation', value: '140.0 MW', change: 'Solar P50 model', status: 'optimal', note: 'Target at current irradiance' },
        { id: 'act_gen', label: 'Actual Generation', value: '128.8 MW', change: 'Real-time SCADA', status: 'warning', note: 'Under-injection' },
        { id: 'gen_dev', label: 'Generation Deviation', value: '-11.2 MW', change: '-8.0% deviation', status: 'critical', note: 'Below schedule target' },
        { id: 'availability', label: 'Plant Availability', value: '96.4%', change: '38/40 Inverters', status: 'optimal', note: '2 inverters in thermal check' },
        { id: 'cuf', label: 'Capacity Factor (CUF)', value: '22.8%', change: 'Monthly 23.1%', status: 'optimal', note: 'Within design envelope' },
        { id: 'pr', label: 'Performance Ratio (PR)', value: '79.8%', change: 'IEC 61724 standard', status: 'optimal', note: 'Design target: >78%' },
        { id: 'curtailment', label: 'Curtailment Directive', value: '0.0 MW', change: 'No backdown order', status: 'optimal', note: 'Unrestricted grid feed' },
        { id: 'weather_impact', label: 'Weather Impact', value: '-8.5 MW', change: 'Cloud cover 28%', status: 'warning', note: 'Attenuation on Block B' },
        { id: 'fc_error', label: 'Forecast Error', value: '4.2%', change: 'nRMSE Holdout', status: 'optimal', note: 'CERC DSM band compliant' },
      ],
      upcomingRisk: {
        timeWindow: 'Today 16:30 – 18:30 IST',
        title: 'Expected Plant Underproduction: -18.6 MW',
        severity: 'WARNING',
        likelyRange: '14.0 – 22.5 MW below schedule',
        confidence: 'High (91.0%)',
        impact: 'Site Generation Loss · No Grid Threat',
        causes: [
          'Localized cumulus cloud bank moving across Sanand Sector 4 after 16:30',
          'PV module surface temperature at 48.6°C (-0.35%/°C efficiency coefficient degradation)',
          'Inverter blocks INV-07 & INV-19 undergoing scheduled combiner box thermal scans',
          'Solar zenith angle lowering direct GHI from 820 W/m² to 210 W/m²'
        ],
        solutionSummary: 'Expected Plant Underproduction: -18.6 MW due to localized cloud attenuation after 16:30. Inverter auto-tilt compensation active.',
      },
      allowedActions: [
        { id: 'investigate_plant_alert', label: 'Investigate Plant Alert', type: 'navigate', target: '/alerts', variant: 'primary' },
        { id: 'ack_plant_alert', label: 'Acknowledge Assigned Alert', type: 'acknowledge', variant: 'outline' },
        { id: 'inspect_weather', label: 'Inspect Weather Impact', type: 'navigate', target: '/weather', variant: 'secondary' },
        { id: 'inspect_deviation', label: 'Inspect Forecast Deviation', type: 'navigate', target: '/forecast', variant: 'outline' },
        { id: 'maintenance_rec', label: 'View Inverter Health', type: 'navigate', target: '/plants', variant: 'outline' },
      ],
    },
  },

  energy_trading_analyst: {
    id: 'energy_trading_analyst',
    name: 'Energy Trading Analyst',
    title: 'Energy Trading Analyst',
    roleTag: 'Commercial Energy Intelligence',
    primaryQuestion: 'What should we buy, sell, store, or schedule to improve commercial outcome?',
    defaultUser: 'Priya Sharma',
    defaultEmail: 'priya.sharma@renewabletrading.in',
    defaultStation: 'Power Market Desk · IEX / PXIL Division',
    colorTheme: 'emerald',
    badgeVariant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: '#059669',
    dataScope: DATA_SCOPES.COMMERCIAL,
    permissions: [
      PERMISSIONS.VIEW,
      PERMISSIONS.ANALYZE,
      PERMISSIONS.RECOMMEND,
    ],
    moduleAccess: {
      dashboard: ACCESS_LEVELS.FULL,
      forecast: ACCESS_LEVELS.FULL,
      alerts: ACCESS_LEVELS.FULL,
      plants: ACCESS_LEVELS.HIDDEN,
      grid: ACCESS_LEVELS.FULL,
      battery: ACCESS_LEVELS.FULL,
      recommendations: ACCESS_LEVELS.FULL,
      weather: ACCESS_LEVELS.HIDDEN,
      accuracy: ACCESS_LEVELS.FULL,
      settings: ACCESS_LEVELS.LIMITED,
    },
    navLabels: {
      dashboard: 'Trading Overview',
      forecast: 'Forecast',
      alerts: 'Risk & Alerts',
      plants: 'Plants',
      grid: 'Grid & Demand',
      battery: 'Battery Strategy',
      recommendations: 'AI Advisory',
      weather: 'Weather',
      accuracy: 'Analytics',
      settings: 'Settings',
    },
    commandCenter: {
      heading: 'Energy Trading Intelligence',
      subheading: 'Day-ahead schedule matching, market clearing price spreads & BESS revenue optimization',
      focusBadge: 'Commercial & Power Markets',
      kpis: [
        { id: 'day_ahead_fc', label: 'Tomorrow Forecast Gen', value: '2,140 MWh', change: 'DAM submission', status: 'optimal', note: 'Aggregated Day-Ahead' },
        { id: 'intraday_fc', label: 'Intraday Forecast Gen', value: '2,185 MWh', change: '+45 MWh vs DAM', status: 'optimal', note: 'RTM opportunity' },
        { id: 'scheduled_energy', label: 'Scheduled Energy', value: '1,960 MWh', change: 'Committed to grid', status: 'optimal', note: 'SLDC scheduled pool' },
        { id: 'exp_surplus', label: 'Expected Surplus', value: '+180 MWh', change: 'Tradable volume', status: 'optimal', note: 'Clearable on IEX RTM' },
        { id: 'exp_deficit', label: 'Expected Deficit', value: '0 MWh', change: 'Zero shortfall', status: 'optimal', note: 'No DSM penalty exposure' },
        { id: 'fc_confidence', label: 'Forecast Confidence', value: '87.0%', change: 'P50 commercial band', status: 'optimal', note: '±6.2% risk corridor' },
        { id: 'exp_revenue', label: 'Expected Revenue', value: '₹14.8 lakh', change: '₹3.95/kWh weighted', status: 'optimal', note: 'Day-Ahead + RTM' },
        { id: 'dev_risk', label: 'Deviation Penalty Risk', value: 'Medium', change: 'Max ₹1.2L exposure', status: 'warning', note: 'Within 10% CERC band' },
        { id: 'mkt_exposure', label: 'Market Price Exposure', value: '₹4.2 lakh', change: 'Unhedged RTM vol', status: 'warning', note: 'Subject to clearing price' },
        { id: 'arbitrage_opp', label: 'BESS Arbitrage Opp.', value: '₹85,000 / day', change: 'Spread ₹3.7/kWh', status: 'optimal', note: '12:00 vs 18:00 window' },
      ],
      upcomingRisk: {
        timeWindow: '18:00 – 20:00 IST',
        title: 'Peak Price Arbitrage & Deviation Exposure Window',
        severity: 'WARNING',
        likelyRange: 'IEX Clearing Price ₹6.8/kWh vs ₹3.1/kWh solar trough',
        confidence: '87.0%',
        impact: 'Commercial Opportunity: ₹1.29 lakh net gain',
        causes: [
          'High solar generation at 12:00 (96 MW) depressing regional exchange price to ₹3.1/kWh',
          'Evening peak demand (18:00–20:00) spiking clearing exchange price to ₹6.8/kWh',
          'Scheduled delivery commitment requires 80 MW at 19:00 with direct solar dropping to 24 MW',
          'Storage charge/discharge spread offers ₹3.7/kWh net arbitrage after round-trip losses'
        ],
        solutionSummary: 'AI Trading Directive: Charge 35 MWh BESS during midday (12:00–14:00 at ₹3.1/kWh). Discharge during evening peak (18:00–20:00 at ₹6.8/kWh). Estimated net profit: ₹1,29,500.',
      },
      allowedActions: [
        { id: 'analyze_market', label: 'Analyze Market Opportunity', type: 'navigate', target: '/forecast', variant: 'primary' },
        { id: 'generate_strategy', label: 'Generate Trading Strategy', type: 'navigate', target: '/recommendations', variant: 'secondary' },
        { id: 'export_schedule', label: 'Export Schedule (DAM/RTM)', type: 'export', variant: 'outline' },
        { id: 'compare_scenarios', label: 'Compare Revenue Scenarios', type: 'navigate', target: '/accuracy', variant: 'outline' },
        { id: 'simulate_arbitrage', label: 'Simulate BESS Arbitrage', type: 'navigate', target: '/battery', variant: 'outline' },
      ],
    },
  },

  remc_desk_officer: {
    id: 'remc_desk_officer',
    name: 'REMC Desk Officer',
    title: 'REMC Desk Officer',
    roleTag: 'Regional Renewable Monitoring Intelligence',
    primaryQuestion: 'Which renewable plants or regions are deviating, and what needs coordination?',
    defaultUser: 'Ananya Patel',
    defaultEmail: 'ananya.patel@remc.wrlbdc.gov.in',
    defaultStation: 'Renewable Energy Management Centre (REMC) - WR',
    colorTheme: 'purple',
    badgeVariant: 'bg-purple-50 text-purple-700 border-purple-200',
    accentColor: '#9333ea',
    dataScope: DATA_SCOPES.REGIONAL_MULTI_PLANT,
    permissions: [
      PERMISSIONS.VIEW,
      PERMISSIONS.ANALYZE,
      PERMISSIONS.ACKNOWLEDGE,
      PERMISSIONS.RECOMMEND,
    ],
    moduleAccess: {
      dashboard: ACCESS_LEVELS.FULL,
      forecast: ACCESS_LEVELS.FULL,
      alerts: ACCESS_LEVELS.FULL,
      plants: ACCESS_LEVELS.FULL,
      grid: ACCESS_LEVELS.FULL,
      battery: ACCESS_LEVELS.HIDDEN,
      recommendations: ACCESS_LEVELS.FULL,
      weather: ACCESS_LEVELS.FULL,
      accuracy: ACCESS_LEVELS.FULL,
      settings: ACCESS_LEVELS.LIMITED,
    },
    navLabels: {
      dashboard: 'REMC Overview',
      forecast: 'Forecast',
      alerts: 'Risk & Alerts',
      plants: 'Plants',
      grid: 'Grid & Demand',
      battery: 'Battery Overview',
      recommendations: 'AI Advisory',
      weather: 'Weather',
      accuracy: 'Analytics',
      settings: 'Settings',
    },
    commandCenter: {
      heading: 'REMC Renewable Monitoring Center',
      subheading: 'Regional multi-plant pooling, schedule deviation monitoring & renewable ramp alerts',
      focusBadge: 'Multi-Plant Regional Integration',
      kpis: [
        { id: 'plants_monitored', label: 'Plants Monitored', value: '18 Plants', change: '12 Solar · 6 Wind', status: 'optimal', note: 'All regional pooling nodes' },
        { id: 'tot_capacity', label: 'Installed RE Capacity', value: '2.40 GW', change: 'State pool total', status: 'optimal', note: '1.6 GW Solar · 0.8 GW Wind' },
        { id: 'curr_re_gen', label: 'Current RE Generation', value: '1.60 GW', change: '66.7% utilization', status: 'optimal', note: 'Aggregated real-time feed' },
        { id: 'fc_re_gen', label: 'Forecast RE Generation', value: '1.72 GW', change: 'Aggregated P50', status: 'optimal', note: 'State-wide baseline' },
        { id: 'sched_gen', label: 'Scheduled Generation', value: '1.68 GW', change: 'SLDC committed pool', status: 'optimal', note: 'Declared capacity' },
        { id: 'tot_dev', label: 'Total Forecast Deviation', value: '-120.0 MW', change: 'Under-injection', status: 'critical', note: 'Requires dispatch coordination' },
        { id: 'high_risk_plants', label: 'High Risk Plants', value: '3 Plants', change: 'Jaisalmer, Charanka, Kutch', status: 'critical', note: 'Exceeding 10% tolerance' },
        { id: 'ramp_risk', label: 'Regional Ramp Risk', value: '-135 MW / 60m', change: 'Kutch + Jaisalmer Wind', status: 'warning', note: 'Expected at 18:00' },
        { id: 'fc_confidence', label: 'Forecast Confidence', value: '89.0%', change: 'Multi-hub agreement', status: 'optimal', note: 'Ensemble confidence score' },
      ],
      upcomingRisk: {
        timeWindow: '17:45 – 19:00 IST',
        title: 'Regional Ramp Warning: -135 MW Decline',
        severity: 'HIGH',
        likelyRange: '640 MW -> 505 MW in 60 minutes',
        confidence: '82.0%',
        impact: 'High Multi-Plant Grid Ramp Alert',
        causes: [
          'Kutch + Jaisalmer wind generation expected to decline rapidly due to boundary layer wind shear',
          'Total wind output dropping from 640 MW to 505 MW (-135 MW within 60 minutes)',
          'Concurrent solar sunset ramp-down compounding regional net ramp pressure'
        ],
        solutionSummary: 'REMC Action: 1. Notify SLDC Chief Grid Dispatcher. 2. Review reserve availability at thermal stations. 3. Monitor Jaisalmer Wind & Kutch corridors.',
      },
      allowedActions: [
        { id: 'notify_dispatcher', label: 'Coordinate With Dispatcher', type: 'notify_modal', variant: 'primary' },
        { id: 'ack_regional_alert', label: 'Acknowledge Regional Alert', type: 'acknowledge', variant: 'outline' },
        { id: 'inspect_plant_forecast', label: 'Inspect Plant Forecasts', type: 'navigate', target: '/plants', variant: 'secondary' },
        { id: 'monitor_ramp', label: 'Monitor Regional Ramp', type: 'navigate', target: '/forecast', variant: 'warning' },
        { id: 'generate_remc_report', label: 'Export REMC Daily Log', type: 'export', variant: 'outline' },
      ],
    },
  },
};

/**
 * Normalizes any string or identifier to a valid role ID.
 * Defaults to 'chief_grid_dispatcher'.
 */
export function normalizeRole(roleInput) {
  if (!roleInput) return 'chief_grid_dispatcher';
  const clean = String(roleInput).trim().toLowerCase().replace(/[\s-]+/g, '_');
  
  if (clean.includes('dispatch') || clean.includes('chief')) return 'chief_grid_dispatcher';
  if (clean.includes('plant') || clean.includes('engineer')) return 'plant_operations_engineer';
  if (clean.includes('trad') || clean.includes('analyst') || clean.includes('commercial')) return 'energy_trading_analyst';
  if (clean.includes('remc') || clean.includes('desk') || clean.includes('officer')) return 'remc_desk_officer';
  
  return ROLES[clean] ? clean : 'chief_grid_dispatcher';
}

/**
 * Returns role definition for a given role key.
 */
export function getRoleConfig(roleKey) {
  const norm = normalizeRole(roleKey);
  return ROLES[norm] || ROLES.chief_grid_dispatcher;
}

/**
 * Checks if a role has a specific internal permission.
 */
export function roleHasPermission(roleKey, permission) {
  const cfg = getRoleConfig(roleKey);
  return cfg.permissions.includes(permission);
}

/**
 * Checks module access state for a role ('FULL', 'LIMITED', 'READ_ONLY', 'HIDDEN').
 */
export function getModuleAccess(roleKey, moduleKey) {
  const cfg = getRoleConfig(roleKey);
  return cfg.moduleAccess[moduleKey] || ACCESS_LEVELS.FULL;
}

/**
 * Checks if the role has operational control permissions (e.g. BESS battery dispatch).
 */
export function canControlGrid(roleKey) {
  return roleHasPermission(roleKey, PERMISSIONS.CONTROL);
}
