/**
 * SURGE API Contract & Types — 6-Layer MVP Pipeline
 * Defines the contract boundary between Next.js frontend and FastAPI backend.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    detail?: unknown;
  };
  timestamp: string;
}

export type DataSourceType = 'api' | 'demo';
export type ServiceStatusTag = 'LIVE' | 'DEMO DATA' | 'DEMO FALLBACK';

export interface ServiceResult<T> {
  data: T;
  source: DataSourceType;
  statusTag: ServiceStatusTag;
  latencyMs: number;
  error?: string;
}

// -----------------------------------------------------------------------------
// Layer 0: Data Trust Contracts
// -----------------------------------------------------------------------------

export type DataTrustStatus = 'TRUSTED' | 'WARNING' | 'QUARANTINED' | 'HEALTHY';

export interface DataTrustAnomaly {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observed_value?: Record<string, unknown>;
  expected_value?: Record<string, unknown>;
  description?: string;
  status: string;
  detected_at: string;
}

export interface DataTrustReport {
  overall_status: DataTrustStatus;
  source_status: 'TRUSTED' | 'QUARANTINED';
  checks: {
    range: boolean;
    timestamp: boolean;
    physical: boolean;
    anomaly: boolean;
    integrity: boolean;
  };
  reason: string;
  fallback_used: boolean;
  fallback_type?: string | null;
  anomalies: DataTrustAnomaly[];
  quarantine_count: number;
  simulated_anomaly: boolean;
  checked_at: string;
}

// -----------------------------------------------------------------------------
// Layer 1 & 2: Forecast & Quantified Uncertainty Contracts
// -----------------------------------------------------------------------------

export interface ForecastRequest {
  plant_id: string;
  horizon_hours: 24 | 48 | 72;
  resolution?: '15m' | '1h';
  simulate_sensor_anomaly?: boolean;
}

export interface ForecastDataPoint {
  timestamp: string; // ISO 8601
  actual_mw?: number | null;
  predicted_generation_mw?: number;
  predicted_mw: number;
  lower_bound_mw: number;
  upper_bound_mw: number;
  p10_mw: number;
  p50_mw: number;
  p90_mw: number;
  day_ahead_mw?: number;
  confidence_score?: number;
  risk_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  ghi?: number | null;
  cloud_cover_percent?: number | null;
  temperature_c?: number | null;
  wind_speed_ms?: number | null;
  ramp_rate_mw_per_min?: number;
  is_ramp_alert?: boolean;
}

export interface ForecastAccuracyMetrics {
  mae_mw: number;
  rmse_mw: number;
  skill_score_percent: number;
  ramp_capture_rate_percent: number;
  bias_mw: number;
}

// -----------------------------------------------------------------------------
// Layer 4: Explainability Contracts
// -----------------------------------------------------------------------------

export interface DriverDetail {
  name: string;
  impact: string;
  value: string;
  direction: 'UP' | 'DOWN' | 'FLAT';
}

export interface DriverBreakdown {
  primary_driver: string;
  summary: string;
  target_risk_id?: string | null;
  drivers: DriverDetail[];
}

// -----------------------------------------------------------------------------
// Layer 3: Risk Contracts
// -----------------------------------------------------------------------------

export interface RiskItem {
  id: string;
  forecast_run_id?: string;
  plant_id: string;
  risk_type: 'RAMP' | 'UNCERTAINTY' | 'SURPLUS' | 'DEFICIT' | 'DATA_QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  start_time: string;
  end_time?: string | null;
  title: string;
  description: string;
  delta_mw_per_hour?: number;
  energy_gap_mwh?: number;
  confidence_score?: number;
  lead_time_minutes?: number;
  magnitude?: string;
  grid_impact?: string;
  action_id?: string;
  status?: string;
}

// -----------------------------------------------------------------------------
// Layer 5: Decision & Recommendation Contracts
// -----------------------------------------------------------------------------

export interface RecommendationItem {
  id: string;
  forecast_run_id?: string;
  plant_id: string;
  risk_id?: string | null;
  action_type: string;
  title: string;
  reason?: string;
  expected_impact_mw?: number;
  energy_gap_mwh?: number;
  time_window?: string;
  confidence_score?: number;
  status: 'PENDING' | 'APPROVED' | 'OVERRIDDEN' | 'REJECTED' | 'ACKNOWLEDGED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  override_reason?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  // Legacy UI compat fields
  prescribed_action?: string;
  target_asset?: string;
  setpoint_mw?: number;
  target_window?: string;
  dispatch_duration_minutes?: number;
  net_effect?: string;
  confidence_percent?: number;
  financial_impact?: string;
}

export interface RecommendationDecisionPayload {
  decision: 'APPROVED' | 'OVERRIDDEN' | 'REJECTED' | 'ACKNOWLEDGED';
  override_reason?: string;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string | null;
  organization_id?: string | null;
  plant_id?: string | null;
  event_type: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ForecastResponse {
  forecast_run_id: string;
  plant_id: string;
  model_name?: string;
  model?: string;
  generated_at: string;
  horizon_hours: number;
  resolution?: string;
  confidence_score: number;
  confidence?: number;
  confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation?: string;
  data_trust: DataTrustReport;
  driver_breakdown: DriverBreakdown;
  points: ForecastDataPoint[];
  forecast?: ForecastDataPoint[];
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  metrics?: ForecastAccuracyMetrics;
}

// -----------------------------------------------------------------------------
// Plant & Admin Models
// -----------------------------------------------------------------------------

export type SurgeRole = 'ORG_ADMIN' | 'GRID_OPERATOR' | 'PLANT_OPERATOR' | 'ENERGY_ANALYST';
export type PlantEnergyType = 'SOLAR' | 'WIND';
export type PlantAccessLevel = 'VIEW' | 'OPERATE' | 'MANAGE';

export interface Plant {
  id: string;
  organization_id: string;
  name: string;
  energy_type: PlantEnergyType;
  location_name: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
  capacity_mw: number;
  status: 'DRAFT' | 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  configuration: Record<string, unknown>;
}

export interface LocationSearchResult {
  name: string;
  country: string | null;
  admin1: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: Record<string, Array<string | number | null>>;
}

export interface DataTrustResult {
  plant_id: string | null;
  overall_status: DataTrustStatus;
  validation_runs: Array<Record<string, unknown>>;
  anomalies: Array<Record<string, unknown>>;
}
