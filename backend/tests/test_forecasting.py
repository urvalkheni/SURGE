from app.services.forecasting import build_forecast


def test_solar_predictions_are_bounded_and_night_is_zero():
    plant = {"capacity_mw": 10, "energy_type": "SOLAR"}
    weather = {"hourly": {"time": ["2026-01-01T00:00", "2026-01-01T12:00"], "cloud_cover": [0, 0], "shortwave_radiation": [0, 900]}}
    points, _, _ = build_forecast(plant, weather, 24)
    assert points[0]["predicted_generation_mw"] == 0
    assert points[1]["predicted_generation_mw"] == 10
    assert all(0 <= point["predicted_generation_mw"] <= 10 for point in points)
