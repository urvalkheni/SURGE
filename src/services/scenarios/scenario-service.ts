import { ScenarioParameters, ScenarioResult, ScenarioResultPoint } from '@/types';
import { demoForecastPoints } from '@/data/demo-data';

export interface IScenarioService {
  simulateScenario(params: ScenarioParameters): Promise<ScenarioResult>;
}

export class ScenarioService implements IScenarioService {
  async simulateScenario(params: ScenarioParameters): Promise<ScenarioResult> {
    // Pure deterministic calculation of generation response to shock
    const points: ScenarioResultPoint[] = demoForecastPoints.slice(0, 24).map((pt) => {
      const baseline = pt.predictedMw;
      
      // Irradiance change and cloud shift effect
      const cloudFactor = Math.max(0, 1 - (params.cloudCoverShiftPercent / 100) * 0.6);
      const inverterFactor = params.inverterAvailabilityPercent / 100;
      
      const simulated = Number(
        Math.max(0, baseline * params.irradianceMultiplier * cloudFactor * inverterFactor).toFixed(1)
      );
      
      return {
        timestamp: pt.timestamp,
        baselineMw: baseline,
        simulatedMw: simulated,
        deltaMw: Number((simulated - baseline).toFixed(1)),
      };
    });

    const netEnergyDeltaMwh = Number(
      points.reduce((acc, curr) => acc + curr.deltaMw, 0).toFixed(1)
    );

    // Financial impact based on clearing price
    const financialExposureUsd = Math.round(
      Math.abs(netEnergyDeltaMwh) * params.clearingPriceUsdMwh
    );

    const rampStressIndex = Math.min(
      100,
      Math.max(0, Math.round(Math.abs(params.cloudCoverShiftPercent) * 1.2 + (100 - params.inverterAvailabilityPercent)))
    );

    const adjustedRecommendation =
      netEnergyDeltaMwh < -20
        ? `Increase BESS standby capacity by ${Math.abs(Math.round(netEnergyDeltaMwh * 0.4))} MWh to absorb expected deficiency.`
        : 'Plant reserves remain within nominal grid interconnect tolerance.';

    return {
      id: `SIM-${Date.now()}`,
      parameters: params,
      netEnergyDeltaMwh,
      financialExposureUsd,
      rampStressIndex,
      adjustedRecommendation,
      points,
    };
  }
}

export const scenarioService = new ScenarioService();
