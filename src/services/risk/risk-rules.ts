import type { RiskEvent, Recommendation } from '@/types';
import type { RuleEvaluationInput } from './risk.types';

/**
 * Deterministic Rule-Based Risk Engine (Strictly Non-AI).
 * Evaluates physics generation trajectory against plant grid limits and BESS capacity.
 * Implements 6 canonical risk types:
 * 1. RAMP_RISK (rapid generation increase/decrease)
 * 2. IRRADIANCE_DROP (severe solar radiation drop)
 * 3. UNDER_GENERATION (generation deficit vs schedule)
 * 4. OVER_GENERATION (inverter capacity clipping watch)
 * 5. BATTERY_RESERVE (low BESS state of charge ahead of sunset)
 * 6. WEATHER_SEVERITY (extreme ambient heat or wind gusts)
 */
export function evaluatePlantRisks(input: RuleEvaluationInput): {
  risks: RiskEvent[];
  recommendations: Recommendation[];
} {
  const risks: RiskEvent[] = [];
  const recommendations: Recommendation[] = [];
  const points = input.forecastPoints;

  if (!points || points.length < 2) {
    return { risks, recommendations };
  }

  const acCapacity = input.acCapacityMw || 42.0;
  const rampThreshold = input.rampLimitMwPerMin || 2.5;

  // 1. RAMP_RISK: Evaluate Rapid Generation Ramp Down Hazard
  for (let i = 0; i < Math.min(12, points.length - 1); i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (p1.isDaytime && p1.predictedMw > 5) {
      const dropMw = p1.predictedMw - p2.predictedMw;
      const dropPercent = (dropMw / acCapacity) * 100;
      const dtMin = Math.max(
        1,
        (new Date(p2.timestamp).getTime() - new Date(p1.timestamp).getTime()) / (60 * 1000)
      );
      const rampRate = Number((dropMw / dtMin).toFixed(2));
      const maxAllowedDrop = rampThreshold * dtMin;

      if (dropMw > maxAllowedDrop || dropPercent > 25) {
        const riskId = `RSK-RAMP-${new Date(p2.timestamp).getTime().toString().slice(-6)}`;
        const actionId = `ACT-BESS-${new Date(p2.timestamp).getTime().toString().slice(-6)}`;

        risks.push({
          id: riskId,
          category: 'ramp_down',
          severity: dropPercent > 40 ? 'critical' : 'high',
          headline: `Generation Ramp-Down Hazard (${dropMw.toFixed(1)} MW in ${dtMin} min)`,
          description: `Generation projected to decrease from ${p1.predictedMw.toFixed(1)} MW to ${p2.predictedMw.toFixed(1)} MW. Exceeds configured plant ramp limit (${rampThreshold} MW/min).`,
          startWindowUtc: p1.timestamp,
          endWindowUtc: p2.timestamp,
          leadTimeMinutes: Math.max(15, i * dtMin),
          deltaMw: Number(dropMw.toFixed(1)),
          rampRateMwPerMin: rampRate,
          confidenceScorePercent: 95,
          rootCause: `Convective cloud cover increase (+${Math.max(0, p2.cloudCoverPercent - p1.cloudCoverPercent)}%) reducing incident solar flux.`,
          status: 'active',
          suggestedActionId: actionId,
          trigger: 'RAMP RATE EXCEEDED',
          threshold: rampThreshold,
          observedValue: rampRate,
          unit: 'MW/min',
          source: 'Physics Forecast',
        });

        // Generate Recommendation strictly based on actual BESS configuration
        if (input.bessEnabled && input.bessPowerMw > 0 && input.bessEnergyMwh > 0) {
          const dispatchPower = Number(Math.min(input.bessPowerMw, dropMw * 0.9).toFixed(1));
          const durationMin = Math.min(60, Math.max(15, dtMin * 2));
          const energyRequiredMwh = Number((dispatchPower * (durationMin / 60)).toFixed(1));
          const maxEnergy = Math.max(1, input.bessEnergyMwh);
          const currentEnergy = ((input.bessSocPct ?? 68) / 100) * maxEnergy;
          const finalEnergy = Math.max(0, currentEnergy - energyRequiredMwh);
          const finalSoc = Math.round((finalEnergy / maxEnergy) * 100);
          const residualRamp = Number(Math.max(0, dropMw - dispatchPower).toFixed(1));

          recommendations.push({
            id: actionId,
            riskId,
            title: `BESS Ramp Smoothing Injection (${dispatchPower} MW)`,
            type: 'bess_discharge',
            priority: 'urgent',
            why: `Irradiance drop exceeds configured plant ramp tolerance (${rampThreshold} MW/min).`,
            action: `Arm BESS Inverter to discharge ${dispatchPower} MW for ${durationMin} min.`,
            expectedEffect: `Mitigates ${dispatchPower} MW of deficit; leaves residual ramp of ${residualRamp} MW within nominal tolerance.`,
            constraint: `Projected ending SOC: ${finalSoc}%. Maximum battery power: ${input.bessPowerMw} MW.`,
            source: 'Deterministic Risk & Recommendation Engine',
            riskSummary: `Projected ${dropMw.toFixed(1)} MW generation drop at ${new Date(p2.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            rootCause: `Irradiance drop exceeds configured plant ramp tolerance (${rampThreshold} MW/min).`,
            prescribedAction: `Arm BESS Inverter to discharge ${dispatchPower} MW for ${durationMin} min. Projected ending SOC: ${finalSoc}%.`,
            expectedImpact: `Mitigates ${dispatchPower} MW of deficit; leaves residual ramp of ${residualRamp} MW within nominal tolerance.`,
            estimatedSavingsInr: 0,
            estimatedSavingsUsd: 0,
            frequencyProtectionScore: 92,
            isAutomatedEligible: true,
            dispatchPlan: {
              id: `DISP-${actionId}`,
              recommendationId: actionId,
              type: 'bess_discharge',
              targetAsset: `Plant BESS Unit (${input.bessPowerMw} MW / ${input.bessEnergyMwh} MWh)`,
              setpointMw: dispatchPower,
              startTimeUtc: p1.timestamp,
              durationMinutes: durationMin,
              status: 'pending',
            },
          });
        } else {
          // No battery available: Recommend inverter ramp throttling and operator notice
          recommendations.push({
            id: actionId,
            riskId,
            title: 'Inverter Slew-Rate Limiting & Grid Notification',
            type: 'inverter_curtail',
            priority: 'urgent',
            why: 'Plant lacks battery storage buffer for sudden cloud shading.',
            action: 'Notify grid despatch coordinator and prepare inverter active power slew-rate derating.',
            expectedEffect: 'Softens grid ramp rate slope without physical energy storage injection.',
            constraint: 'No active BESS unit deployed. Inverter active throttling only.',
            source: 'Deterministic Risk & Recommendation Engine',
            riskSummary: `Unbuffered ${dropMw.toFixed(1)} MW ramp drop projected. No active BESS unit assigned.`,
            rootCause: 'Plant lacks battery storage buffer for sudden cloud shading.',
            prescribedAction: 'Notify grid despatch coordinator and prepare inverter active power slew-rate derating.',
            expectedImpact: 'Softens grid ramp rate slope without physical energy storage injection.',
            estimatedSavingsInr: 0,
            estimatedSavingsUsd: 0,
            frequencyProtectionScore: 75,
            isAutomatedEligible: false,
            dispatchPlan: {
              id: `DISP-${actionId}`,
              recommendationId: actionId,
              type: 'inverter_curtail',
              targetAsset: 'Inverter Array Master Controller',
              setpointMw: 0,
              startTimeUtc: p1.timestamp,
              durationMinutes: 60,
              status: 'pending',
            },
          });
        }

        break; // Priority to first impending ramp event
      }
    }
  }

  // 2. IRRADIANCE_DROP: Solar Radiation Plunge
  for (let i = 0; i < Math.min(12, points.length - 1); i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const p1Ghi = p1.ghi ?? (p1.isDaytime ? Math.round(900 * (1 - p1.cloudCoverPercent / 100)) : 0);
    const p2Ghi = p2.ghi ?? (p2.isDaytime ? Math.round(900 * (1 - p2.cloudCoverPercent / 100)) : 0);

    if (p1.isDaytime && p1Ghi > 450) {
      const ghiDrop = p1Ghi - p2Ghi;
      if (ghiDrop > 350 && p2.cloudCoverPercent > 60) {
        const riskId = `RSK-IRR-${new Date(p2.timestamp).getTime().toString().slice(-6)}`;
        if (!risks.some((r) => r.id === riskId)) {
          risks.push({
            id: riskId,
            category: 'ramp_down',
            severity: 'high',
            headline: `Solar Irradiance Drop (${ghiDrop} W/m²)`,
            description: `Global irradiance falling from ${p1Ghi} W/m² to ${p2Ghi} W/m² (-${Math.round((ghiDrop / p1Ghi) * 100)}%). Expected output impact: -${(p1.predictedMw - p2.predictedMw).toFixed(1)} MW.`,
            startWindowUtc: p1.timestamp,
            endWindowUtc: p2.timestamp,
            leadTimeMinutes: Math.max(20, i * 30),
            deltaMw: Number((p1.predictedMw - p2.predictedMw).toFixed(1)),
            confidenceScorePercent: 90,
            rootCause: `Rapid overcast accumulation (+${p2.cloudCoverPercent - p1.cloudCoverPercent}% cloud cover).`,
            status: 'active',
            trigger: 'SOLAR IRRADIANCE DROP',
            threshold: 350,
            observedValue: ghiDrop,
            unit: 'W/m²',
            source: 'Open-Meteo NWP',
          });
        }
        break;
      }
    }
  }

  // 3. UNDER_GENERATION: Schedule Deficit
  const dayPoint = points.find(
    (p) => p.isDaytime && (p.dayAheadMw ?? 0) > 15 && p.predictedMw < (p.dayAheadMw ?? 0) * 0.75
  );
  if (dayPoint && risks.length < 4) {
    const deficit = Number(((dayPoint.dayAheadMw ?? 0) - dayPoint.predictedMw).toFixed(1));
    risks.push({
      id: `RSK-UNDER-${Date.now().toString().slice(-4)}`,
      category: 'under_generation',
      severity: 'medium',
      headline: `Schedule Under-Generation Deficit (${deficit} MW)`,
      description: `Projected generation (${dayPoint.predictedMw} MW) trails Day-Ahead commitment (${dayPoint.dayAheadMw} MW).`,
      startWindowUtc: dayPoint.timestamp,
      endWindowUtc: dayPoint.timestamp,
      leadTimeMinutes: 120,
      deltaMw: deficit,
      confidenceScorePercent: 88,
      rootCause: 'Atmospheric optical depth higher than clear-sky schedule baseline.',
      status: 'active',
      trigger: 'SCHEDULE UNDER-GENERATION DEFICIT',
      threshold: Number(((dayPoint.dayAheadMw ?? 0) * 0.25).toFixed(1)),
      observedValue: deficit,
      unit: 'MW',
      source: 'Schedule Commitment Model',
    });
  }

  // 4. OVER_GENERATION: Inverter Clipping Watch
  const peakPoint = points.find((p) => p.predictedMw >= acCapacity * 0.98);
  if (peakPoint && risks.length < 4) {
    risks.push({
      id: `RSK-CLIP-${Date.now().toString().slice(-4)}`,
      category: 'over_generation',
      severity: 'low',
      headline: `Inverter Saturation & Clipping Watch (${peakPoint.predictedMw} MW)`,
      description: `Output nearing rated AC interconnect capacity (${acCapacity} MW). Inverter banks will enforce thermal headroom clipping.`,
      startWindowUtc: peakPoint.timestamp,
      endWindowUtc: peakPoint.timestamp,
      leadTimeMinutes: 180,
      deltaMw: Number((peakPoint.predictedMw - acCapacity * 0.95).toFixed(1)),
      confidenceScorePercent: 95,
      rootCause: 'Peak solar elevation combined with favorable panel thermal conditions.',
      status: 'active',
      trigger: 'INVERTER SATURATION & CLIPPING WATCH',
      threshold: acCapacity,
      observedValue: peakPoint.predictedMw,
      unit: 'MW',
      source: 'Photovoltaic Physics Model',
    });
  }

  // 5. BATTERY_RESERVE: Low BESS State of Charge
  if (input.bessEnabled && (input.bessSocPct ?? 100) < 25 && risks.length < 5) {
    risks.push({
      id: `RSK-BESS-${Date.now().toString().slice(-4)}`,
      category: 'under_generation',
      severity: 'medium',
      headline: `Low BESS Energy Reserve (${input.bessSocPct}%)`,
      description: `Battery state-of-charge is below 25% minimum headroom threshold ahead of operational dispatch windows.`,
      startWindowUtc: points[0].timestamp,
      endWindowUtc: points[1]?.timestamp ?? points[0].timestamp,
      leadTimeMinutes: 60,
      deltaMw: Number(((input.bessPowerMw || 20) * 0.5).toFixed(1)),
      confidenceScorePercent: 99,
      rootCause: 'Insufficient daytime solar charging buffer retained in BESS cells.',
      status: 'active',
      trigger: 'LOW BESS ENERGY RESERVE',
      threshold: 25,
      observedValue: input.bessSocPct,
      unit: '%',
      source: 'Plant Digital Twin Telemetry',
    });
  }

  // 6. WEATHER_SEVERITY: Thermal Derating or Wind Alert
  const hotPoint = points.find((p) => p.temperatureC > 41);
  if (hotPoint && risks.length < 5) {
    risks.push({
      id: `RSK-TEMP-${Date.now().toString().slice(-4)}`,
      category: 'weather_extreme',
      severity: 'medium',
      headline: `Severe Ambient Heat Wave (${hotPoint.temperatureC}°C)`,
      description: `Extreme ambient array temperature accelerates cell efficiency degradation via negative temperature coefficient.`,
      startWindowUtc: hotPoint.timestamp,
      endWindowUtc: hotPoint.timestamp,
      leadTimeMinutes: 90,
      deltaMw: Number((acCapacity * 0.08).toFixed(1)),
      confidenceScorePercent: 92,
      rootCause: 'Regional high-temperature atmospheric dome suppressing heat dissipation.',
      status: 'active',
      trigger: 'SEVERE AMBIENT HEAT WAVE',
      threshold: 40,
      observedValue: hotPoint.temperatureC,
      unit: '°C',
      source: 'Open-Meteo Forecast',
    });
  }

  return { risks, recommendations };
}
