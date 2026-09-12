"""
Verification script: Demonstrates creating tables and storing records in the database.
"""

import sys
import os
import json
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from db import db_create_user, db_get_user, db_log_dispatch, db_get_dispatch_history, get_db_inspection, init_db

def main():
    print("=" * 60)
    print("1. INITIALIZING DATABASE AND CREATING TABLES...")
    init_db()

    inspection = get_db_inspection()
    print(f"Database Engine : {inspection['engine']}")
    print(f"Database Path   : {inspection['database_file']}")
    print(f"Tables Created  : {list(inspection['tables'].keys())}")
    print("=" * 60)

    print("\n2. CREATING OPERATOR AND STORING IN DATABASE...")
    user = db_create_user(
        name="Sunil Mehta",
        email="sunil.mehta@sldc.gujarat.gov.in",
        password_hash="mock_hash_12345",
        role="Senior Dispatch Engineer",
        station="Gujarat SLDC - Gotri"
    )
    print(f"Stored user in 'profiles' table: ID={user['id']}, Email={user['email']}")

    # Verify retrieval
    stored = db_get_user(user['email'])
    assert stored is not None, "Failed to retrieve user from database!"
    print(f"Verified retrieval from DB: {stored['name']} ({stored['role']})")

    print("\n3. STORING DISPATCH EVENT IN DATABASE...")
    event = db_log_dispatch({
        "operator_name": user['name'],
        "action_type": "BESS_DISCHARGE",
        "magnitude_mw": 42.5,
        "target_facility": "Khavda BESS Array 3",
        "rationale": "Automated frequency stabilization",
        "financial_savings_inr": 125000,
        "co2_avoided_kg": 18200.0
    })
    print(f"Stored dispatch event in 'dispatch_actions' table: ID={event['id']}")

    print("\n4. FINAL DATABASE INSPECTION:")
    updated_insp = get_db_inspection()
    for table_name, meta in updated_insp["tables"].items():
        print(f"  - Table '{table_name}': {meta['record_count']} rows, columns: {meta['columns']}")

    print("\nSUCCESS: All tables created and records stored in database!")
    print("=" * 60)

if __name__ == "__main__":
    main()
