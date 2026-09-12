"""
RENEWAI Database Layer (SQLite + SQL Engine)
Creates and manages real SQL database tables:
- profiles (users)
- dispatch_actions
- operator_preferences

Ensures all signups, logins, and dispatch actions are stored persistently in the database.
"""

import os
import sqlite3
import json
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "renewai.db")
USERS_JSON = os.path.join(os.path.dirname(__file__), "data", "users.json")
DISPATCH_JSON = os.path.join(os.path.dirname(__file__), "data", "dispatch_logs.json")

def get_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds initial users from existing files."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Profiles Table (Operators)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'Grid Operator',
        station TEXT DEFAULT 'Gujarat SLDC - Gotri, Vadodara',
        created_at TEXT NOT NULL
    );
    """)

    # 2. Dispatch Actions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispatch_actions (
        id TEXT PRIMARY KEY,
        operator_name TEXT NOT NULL,
        action_type TEXT NOT NULL,
        magnitude_mw REAL NOT NULL,
        target_facility TEXT NOT NULL,
        status TEXT DEFAULT 'EXECUTED',
        rationale TEXT,
        financial_savings_inr REAL DEFAULT 0,
        co2_avoided_kg REAL DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    # 3. Operator Preferences Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS operator_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        default_state TEXT DEFAULT 'gujarat',
        default_city TEXT DEFAULT 'ahmedabad',
        default_area TEXT DEFAULT 'sanand',
        theme TEXT DEFAULT 'light',
        updated_at TEXT NOT NULL
    );
    """)

    conn.commit()

    # Migrate existing users.json into the profiles table
    if os.path.exists(USERS_JSON):
        try:
            with open(USERS_JSON, "r") as f:
                users = json.load(f)
            for email, u in users.items():
                cursor.execute("""
                INSERT OR IGNORE INTO profiles (id, email, name, password_hash, role, station, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    u.get("id", f"usr-{secrets.token_hex(4)}"),
                    email.strip().lower(),
                    u.get("name", "Operator"),
                    u.get("password_hash", ""),
                    u.get("role", "Grid Operator"),
                    u.get("station", "Gujarat SLDC"),
                    u.get("created_at", datetime.now().isoformat())
                ))
            conn.commit()
        except Exception as e:
            print(f"[DB] Migration warning for users.json: {e}")

    # Migrate existing dispatch_logs.json into dispatch_actions table
    if os.path.exists(DISPATCH_JSON):
        try:
            with open(DISPATCH_JSON, "r") as f:
                logs = json.load(f)
            for d in logs:
                cursor.execute("""
                INSERT OR IGNORE INTO dispatch_actions (
                    id, operator_name, action_type, magnitude_mw, target_facility,
                    status, rationale, financial_savings_inr, co2_avoided_kg, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    d.get("id", f"dsp-{secrets.token_hex(3)}"),
                    d.get("operator_name", "Krish Patel"),
                    d.get("action_type", "BESS_DISCHARGE"),
                    float(d.get("magnitude_mw", 20.0)),
                    d.get("target_facility", "BESS Storage Unit 01"),
                    d.get("status", "EXECUTED"),
                    d.get("rationale", "Peak shaving"),
                    float(d.get("financial_savings_inr", 45000)),
                    float(d.get("co2_avoided_kg", 9800.0)),
                    d.get("timestamp", datetime.now().isoformat())
                ))
            conn.commit()
        except Exception as e:
            print(f"[DB] Migration warning for dispatch_logs.json: {e}")

    conn.close()

def db_create_user(name: str, email: str, password_hash: str, role: str, station: str) -> Dict[str, Any]:
    """Inserts a new user into the profiles table in SQLite DB."""
    conn = get_connection()
    cursor = conn.cursor()
    
    user_id = f"usr-{secrets.token_hex(4)}"
    created_at = datetime.now().isoformat()
    norm_email = email.strip().lower()

    cursor.execute("""
    INSERT INTO profiles (id, email, name, password_hash, role, station, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, norm_email, name.strip(), password_hash, role, station, created_at))
    conn.commit()
    conn.close()

    # Keep JSON file in sync as backup
    _sync_users_json()

    return {
        "id": user_id,
        "name": name.strip(),
        "email": norm_email,
        "role": role,
        "station": station,
        "created_at": created_at
    }

def db_get_user(email: str) -> Optional[Dict[str, Any]]:
    """Fetches user from profiles table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def db_log_dispatch(action: Dict[str, Any]) -> Dict[str, Any]:
    """Stores a dispatch action in dispatch_actions table."""
    conn = get_connection()
    cursor = conn.cursor()

    event_id = action.get("id") or f"dsp-{secrets.token_hex(3)}"
    created_at = action.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO dispatch_actions (
        id, operator_name, action_type, magnitude_mw, target_facility,
        status, rationale, financial_savings_inr, co2_avoided_kg, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event_id,
        action.get("operator_name", "Krish Patel"),
        action.get("action_type", "BESS_DISCHARGE"),
        float(action.get("magnitude_mw", 0)),
        action.get("target_facility", "Charanka BESS"),
        action.get("status", "EXECUTED"),
        action.get("rationale", ""),
        float(action.get("financial_savings_inr", 0)),
        float(action.get("co2_avoided_kg", 0)),
        created_at
    ))
    conn.commit()
    conn.close()

    # Sync to JSON backup
    _sync_dispatch_json()

    return {
        "id": event_id,
        "timestamp": created_at,
        "action_type": action.get("action_type"),
        "magnitude_mw": action.get("magnitude_mw"),
        "target_facility": action.get("target_facility"),
        "operator_name": action.get("operator_name"),
        "status": "EXECUTED",
        "rationale": action.get("rationale"),
        "financial_savings_inr": action.get("financial_savings_inr"),
        "co2_avoided_kg": action.get("co2_avoided_kg")
    }

def db_get_dispatch_history() -> List[Dict[str, Any]]:
    """Fetches dispatch logs from dispatch_actions table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dispatch_actions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    # Map created_at to timestamp for UI compatibility
    result = []
    for r in rows:
        d = dict(r)
        d["timestamp"] = d["created_at"]
        result.append(d)
    return result

def get_db_inspection() -> Dict[str, Any]:
    """Returns real-time inspection of database tables and record counts."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row["name"] for row in cursor.fetchall() if not row["name"].startswith("sqlite_")]

    table_stats = {}
    for t in tables:
        cursor.execute(f"SELECT COUNT(*) as cnt FROM {t}")
        cnt = cursor.fetchone()["cnt"]
        cursor.execute(f"PRAGMA table_info({t})")
        columns = [col["name"] for col in cursor.fetchall()]
        cursor.execute(f"SELECT * FROM {t} ORDER BY rowid DESC LIMIT 3")
        samples = [dict(r) for r in cursor.fetchall()]
        # Mask password hashes in inspect output
        for s in samples:
            if "password_hash" in s:
                s["password_hash"] = "***REDACTED***"
        table_stats[t] = {
            "record_count": cnt,
            "columns": columns,
            "recent_entries": samples
        }

    db_size_bytes = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
    conn.close()

    return {
        "status": "connected",
        "engine": "SQLite / PostgreSQL Compatible",
        "database_file": DB_PATH,
        "size_bytes": db_size_bytes,
        "tables": table_stats
    }

def _sync_users_json():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles")
        users_dict = {}
        for row in cursor.fetchall():
            d = dict(row)
            users_dict[d["email"]] = d
        conn.close()
        with open(USERS_JSON, "w") as f:
            json.dump(users_dict, f, indent=2)
    except Exception as e:
        print(f"[DB] Could not sync users.json: {e}")

def _sync_dispatch_json():
    try:
        logs = db_get_dispatch_history()
        with open(DISPATCH_JSON, "w") as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        print(f"[DB] Could not sync dispatch_logs.json: {e}")

# Automatically initialize database when module is imported
init_db()
