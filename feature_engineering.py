"""
feature_engineering.py
----------------------
Main entrypoint to construct solar geometry, clear-sky index,
cyclical time encodings, and atmospheric rolling features.
"""

from src.features.engineer_features import generate_features

if __name__ == "__main__":
    generate_features()
