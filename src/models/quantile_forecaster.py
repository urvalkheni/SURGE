"""
quantile_forecaster.py
----------------------
Site-Calibrated Multi-Quantile XGBoost Forecaster.
Trains separate quantile regressors for P10, P50, and P90 generation predictions,
enforcing physical bounds (solar night cutoff, wind cut-in/cut-out limits)
and monotonic ordering (P10 <= P50 <= P90).
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Optional
from xgboost import XGBRegressor


class SiteQuantileForecaster:
    """
    Multi-Quantile XGBoost regressor predicting P10, P50, and P90 output (MW).
    Calibrated directly on site-specific historical (weather, generation) pairs.
    """

    def __init__(
        self,
        target_type: str = "solar",
        max_capacity_mw: float = 100.0,
        feature_columns: Optional[List[str]] = None,
        quantiles: Optional[List[float]] = None
    ):
        self.target_type = target_type.lower()
        self.max_capacity_mw = float(max_capacity_mw)
        self.quantiles = quantiles or [0.10, 0.50, 0.90]
        self.feature_columns = feature_columns or []
        self.models: Dict[str, XGBRegressor] = {}

    def fit(self, X: pd.DataFrame, y: pd.Series, verbose: bool = False):
        """
        Trains independent quantile gradient boosting models using the pinball loss.
        """
        if not self.feature_columns:
            self.feature_columns = list(X.columns)

        X_train = X[self.feature_columns]

        for q in self.quantiles:
            q_key = f"p{int(round(q * 100))}"
            if verbose:
                print(f"[SiteQuantileForecaster] Fitting {self.target_type.upper()} model for quantile {q_key} (alpha={q})...")

            model = XGBRegressor(
                objective="reg:quantileerror",
                quantile_alpha=q,
                n_estimators=150,
                max_depth=5,
                learning_rate=0.07,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
                n_jobs=-1
            )
            model.fit(X_train, y)
            self.models[q_key] = model

    def predict_quantiles(self, X_input: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Generates P10, P50, and P90 predictions with physics bounds and monotonicity checks.
        """
        missing = [c for c in self.feature_columns if c not in X_input.columns]
        if missing:
            raise ValueError(f"Missing required feature columns for inference: {missing}")

        X_feat = X_input[self.feature_columns]
        raw_preds: Dict[str, np.ndarray] = {}

        for q_key, model in self.models.items():
            p = model.predict(X_feat)
            # Global capacity clipping
            p = np.clip(p, 0.0, self.max_capacity_mw)
            raw_preds[q_key] = p

        # 1. Physics Boundary Enforcements
        if self.target_type == "solar":
            # If solar elevation is <= 0 or clearsky GHI is ~0, nighttime generation is strictly 0 MW
            if "solar_elevation" in X_input.columns:
                night_mask = X_input["solar_elevation"].values <= 0.0
                for k in raw_preds:
                    raw_preds[k][night_mask] = 0.0
            elif "shortwave_radiation" in X_input.columns:
                night_mask = X_input["shortwave_radiation"].values <= 1.0
                for k in raw_preds:
                    raw_preds[k][night_mask] = 0.0

        elif self.target_type == "wind":
            # Aerodynamic cut-in (<3 m/s) and cut-out (>=25 m/s)
            wind_col = "wind_speed_100m" if "wind_speed_100m" in X_input.columns else "wind_speed_10m"
            if wind_col in X_input.columns:
                w_speed = X_input[wind_col].values
                cut_mask = (w_speed < 3.0) | (w_speed >= 25.0)
                for k in raw_preds:
                    raw_preds[k][cut_mask] = 0.0

        # 2. Strict Monotonic Sorting: P10 <= P50 <= P90
        p10 = raw_preds.get("p10", np.zeros(len(X_input)))
        p50 = raw_preds.get("p50", np.zeros(len(X_input)))
        p90 = raw_preds.get("p90", np.zeros(len(X_input)))

        p50 = np.maximum(p10, p50)
        p90 = np.maximum(p50, p90)

        return {
            "p10": np.round(p10, 2),
            "p50": np.round(p50, 2),
            "p90": np.round(p90, 2)
        }

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        data = {
            "target_type": self.target_type,
            "max_capacity_mw": self.max_capacity_mw,
            "quantiles": self.quantiles,
            "feature_columns": self.feature_columns,
            "models": self.models
        }
        joblib.dump(data, filepath)

    @classmethod
    def load(cls, filepath: str) -> "SiteQuantileForecaster":
        data = joblib.load(filepath)
        instance = cls(
            target_type=data["target_type"],
            max_capacity_mw=data["max_capacity_mw"],
            feature_columns=data["feature_columns"],
            quantiles=data["quantiles"]
        )
        instance.models = data["models"]
        return instance
