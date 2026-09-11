/**
 * RenewableIQ API Contract & Types
 * Defines the contract boundary between Next.js frontend and external ML/FastAPI backend.
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
// Forecast Service Contracts
// -----------------------------------------------------------------------------

export interface ForecastRequest {
  plant_id: string;
  horizon_hours: number; // 24, 48, or 72
  resolution: '15m' | '1h';
  latitude?: number;
  longitude?: number;
  capacity_mw?: number;
}

export interface ForecastDataPoint {
  timestamp: string; // ISO 8601
  actual_mw: number | null;
  predicted_mw: number;
  p10_mw: number;
  p90_mw: number;
  day_ahead_mw: number;
  ghi: number;
  cloud_cover_percent: number;
  temperature_c: number;
  wind_speed_ms?: number;
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

export interface ForecastResponse {
  plant_id: string;
  model: string;
  generated_at: string;
  horizon_hours: number;
  resolution: string;
  forecast: ForecastDataPoint[];
  metrics: ForecastAccuracyMetrics;
  confidence: number;
}

// -----------------------------------------------------------------------------
// Risk Service Contracts
// -----------------------------------------------------------------------------

export interface RiskRequest {
  plant_id: string;
  horizon_hours?: number;
}

export interface RiskItem {
  id: string;
  category: string;
  severity: string;
  headline: string;
  description: string;
  time_window: string;
  lead_time_minutes: number;
  magnitude: string;
  grid_impact: string;
  action_id: string;
  status: string;
  root_cause?: string;
  penalty_exposure_inr?: string;
}

export interface RiskResponse {
  plant_id: string;
  active_risk_count: number;
  total_events: number;
  composite_risk_score: number;
  max_projected_ramp: string;
  identified_at: string;
  risks: RiskItem[];
}

// -----------------------------------------------------------------------------
// Recommendation Service Contracts
// -----------------------------------------------------------------------------

export interface RecommendationRequest {
  plant_id: string;
  risk_id?: string;
}

export interface RecommendationItem {
  id: string;
  target_risk_id: string;
  priority: string;
  title: string;
  prescribed_action: string;
  target_asset: string;
  setpoint_mw: number;
  target_window: string;
  dispatch_duration_minutes: number;
  net_effect: string;
  confidence_percent: number;
  financial_impact: string;
  status: string;
}

export interface RecommendationResponse {
  plant_id: string;
  recommendations: RecommendationItem[];
  generated_at: string;
}

// -----------------------------------------------------------------------------
// Health Check Contract
// -----------------------------------------------------------------------------

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  services: {
    scada_bus: 'online' | 'offline';
    nwp_assimilation: 'online' | 'offline';
    inference_worker: 'online' | 'offline';
  };
}

// -----------------------------------------------------------------------------
// SURGE operational API contracts
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

export interface PlantInput {
  organization_id: string;
  name: string;
  energy_type: PlantEnergyType;
  latitude: number;
  longitude: number;
  capacity_mw: number;
  location_name?: string;
  timezone?: string;
  configuration?: Record<string, unknown>;
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
  overall_status: 'HEALTHY' | 'WARNING' | 'QUARANTINED';
  validation_runs: Array<Record<string, unknown>>;
  anomalies: Array<Record<string, unknown>>;
}
