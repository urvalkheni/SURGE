"""
train.py
--------
Main entrypoint to train, validate, benchmark ML models and save the best model.
"""

from src.training.train import train_and_evaluate

if __name__ == "__main__":
    train_and_evaluate()
