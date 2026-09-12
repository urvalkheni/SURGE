"""
preprocess.py
-------------
Main entrypoint for data cleaning, alignment, boundary checking,
and continuous timestamp validation.
"""

from src.preprocessing.clean_and_align import clean_and_align_data

if __name__ == "__main__":
    clean_and_align_data()
