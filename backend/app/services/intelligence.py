from typing import Any


def detect_risks(plant: dict[str, Any], forecast_run_id: str, points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Create only evidence-backed forecast risks; never infer demand or grid constraints."""
    risks: list[dict[str, Any]] = []
    capacity = float(plant["capacity_mw"])
    for previous, current in zip(points, points[1:]):
        delta = abs(current["predicted_generation_mw"] - previous["predicted_generation_mw"])
        if delta >= capacity * 0.25:
            risks.append({"forecast_run_id": forecast_run_id, "plant_id": plant["id"], "risk_type": "RAMP", "severity": "HIGH" if delta >= capacity * .5 else "MEDIUM", "start_time": current["timestamp"], "end_time": current["timestamp"], "title": "Forecast generation ramp", "description": f"Expected generation changes by {delta:.2f} MW between consecutive hourly forecast points.", "confidence_score": min(previous["confidence_score"], current["confidence_score"])})
        if current["confidence_score"] < .60:
            risks.append({"forecast_run_id": forecast_run_id, "plant_id": plant["id"], "risk_type": "UNCERTAINTY", "severity": "HIGH" if current["confidence_score"] < .45 else "MEDIUM", "start_time": current["timestamp"], "end_time": current["timestamp"], "title": "Low forecast confidence", "description": "Weather-input uncertainty produces a wider generation range for this hour.", "confidence_score": current["confidence_score"]})
    return risks


def recommendations_for(risks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Human decision-support records only—there is deliberately no command or dispatch endpoint."""
    recommendations: list[dict[str, Any]] = []
    for risk in risks:
        if risk["risk_type"] == "RAMP":
            action, title, reason = "MONITOR", "Prepare for forecast ramp", "Review the upcoming ramp and available site operating procedures."
        else:
            action, title, reason = "MAINTAIN_RESERVE", "Maintain operational reserve", "Forecast uncertainty is elevated; retain flexibility until conditions stabilize."
        recommendations.append({"forecast_run_id": risk["forecast_run_id"], "plant_id": risk["plant_id"], "action_type": action, "title": title, "reason": reason, "confidence_score": risk["confidence_score"], "status": "PENDING"})
    return recommendations
