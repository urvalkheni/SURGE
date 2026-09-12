"""
RENEWAI Database Layer (Supabase Production PostgreSQL + Local SQLite Resilience Mirror)

Provides direct persistence to:
- Supabase PostgreSQL: public.profiles, public.dispatch_actions, public.operator_preferences
- Local SQLite mirror: data/renewai.db & data/users.json for offline resilience and fast caching

Every user registration, profile edit, and grid dispatch action is saved directly to Supabase.
"""

import os
import sqlite3
import json
import secrets
from datetime import datetime
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    PSYCOPG2_AVAILABLE = True
except ImportError:
    PSYCOPG2_AVAILABLE = False

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "renewai.db")
USERS_JSON = os.path.join(os.path.dirname(__file__), "data", "users.json")
DISPATCH_JSON = os.path.join(os.path.dirname(__file__), "data", "dispatch_logs.json")


# =====================================================================
# 1. DATABASE CONNECTIONS (PostgreSQL + SQLite)
# =====================================================================

def get_pg_connection():
    """
    Returns a live connection to Supabase PostgreSQL using DATABASE_URL.
    Returns None if PSYCOPG2 is missing or connection fails.
    """
    if not PSYCOPG2_AVAILABLE:
        return None
    db_url = os.getenv("DATABASE_URL")
    if not db_url or "postgres" not in db_url:
        return None
    try:
        conn = psycopg2.connect(db_url, connect_timeout=8)
        return conn
    except Exception as e:
        print(f"[Supabase PG] Connection notice: {e}")
        return None


def get_sqlite_connection() -> sqlite3.Connection:
    """Returns local SQLite connection for fallback resilience."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


get_connection = get_sqlite_connection


# =====================================================================
# 2. SCHEMA INITIALIZATION & DATA SEEDING
# =====================================================================

def init_db():
    """
    Initializes both local SQLite tables and remote Supabase PostgreSQL schema,
    migrating existing local JSON data to ensure both are synchronized.
    """
    # 1. Initialize local SQLite tables
    sconn = get_sqlite_connection()
    scur = sconn.cursor()

    scur.execute("""
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

    scur.execute("""
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

    scur.execute("""
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
    sconn.commit()

    # Seed SQLite from users.json if needed
    if os.path.exists(USERS_JSON):
        try:
            with open(USERS_JSON, "r") as f:
                users = json.load(f)
            for email, u in users.items():
                scur.execute("""
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
            sconn.commit()
        except Exception as e:
            print(f"[DB] SQLite user seed notice: {e}")

    sconn.close()

    # 2. Sync to Supabase PostgreSQL if available
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor() as cur:
                # Ensure password_hash column exists on Supabase profiles
                cur.execute("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash text;")
                pg_conn.commit()

                # Seed Supabase profiles from users.json if needed
                if os.path.exists(USERS_JSON):
                    with open(USERS_JSON, "r") as f:
                        users = json.load(f)
                    for email, u in users.items():
                        cur.execute("""
                        INSERT INTO public.profiles (email, full_name, role, station, password_hash, updated_at)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (email) DO UPDATE
                        SET full_name = EXCLUDED.full_name,
                            role = EXCLUDED.role,
                            station = EXCLUDED.station,
                            password_hash = COALESCE(EXCLUDED.password_hash, public.profiles.password_hash),
                            updated_at = NOW();
                        """, (
                            email.strip().lower(),
                            u.get("name", "Operator").strip(),
                            u.get("role", "Grid Operator").strip(),
                            u.get("station", "Gujarat SLDC").strip(),
                            u.get("password_hash")
                        ))
                    pg_conn.commit()
            print("[Supabase PG] Connected and profiles table verified.")
        except Exception as e:
            print(f"[Supabase PG] Init notice: {e}")
        finally:
            pg_conn.close()


# =====================================================================
# 3. USER MANAGEMENT (Profiles)
# =====================================================================

def db_create_user(name: str, email: str, password_hash: str, role: str, station: str) -> Dict[str, Any]:
    """
    Creates a new user profile directly in Supabase PostgreSQL public.profiles table,
    and simultaneously mirrors to SQLite and users.json for fast offline resilience.
    """
    norm_email = email.strip().lower()
    norm_name = name.strip()
    norm_role = role.strip() if role else "Grid Operator"
    norm_station = station.strip() if station else "National Load Despatch Centre"
    created_at_iso = datetime.now().isoformat()
    assigned_id = f"usr-{secrets.token_hex(4)}"

    # 1. Insert directly into Supabase PostgreSQL
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                INSERT INTO public.profiles (email, full_name, role, station, password_hash, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (email) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    station = EXCLUDED.station,
                    password_hash = EXCLUDED.password_hash,
                    updated_at = NOW()
                RETURNING id, email, full_name, role, station, created_at;
                """, (norm_email, norm_name, norm_role, norm_station, password_hash))
                row = cur.fetchone()
                pg_conn.commit()
                if row:
                    assigned_id = str(row["id"])
                    created_at_iso = row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"])
                    print(f"[Supabase PG] Created user in public.profiles: {norm_email} (UUID: {assigned_id})")
        except Exception as e:
            print(f"[Supabase PG] User creation warning: {e}")
        finally:
            pg_conn.close()

    # 2. Mirror into local SQLite
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("""
        INSERT OR REPLACE INTO profiles (id, email, name, password_hash, role, station, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (assigned_id, norm_email, norm_name, password_hash, norm_role, norm_station, created_at_iso))
        sconn.commit()
        sconn.close()
    except Exception as e:
        print(f"[SQLite] Mirror insert error: {e}")

    # 3. Mirror into local JSON
    _sync_users_json()

    return {
        "id": assigned_id,
        "name": norm_name,
        "full_name": norm_name,
        "email": norm_email,
        "role": norm_role,
        "station": norm_station,
        "created_at": created_at_iso
    }


def db_get_user(email: str) -> Optional[Dict[str, Any]]:
    """
    Fetches user profile by email from Supabase PostgreSQL first,
    falling back to SQLite if unreachable or row not found.
    """
    norm_email = email.strip().lower()

    # 1. Try Supabase PostgreSQL
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                SELECT id, email, full_name, role, station, password_hash, created_at
                FROM public.profiles
                WHERE LOWER(email) = %s;
                """, (norm_email,))
                row = cur.fetchone()
                if row:
                    return {
                        "id": str(row["id"]),
                        "name": row["full_name"] or "",
                        "full_name": row["full_name"] or "",
                        "email": row["email"],
                        "role": row["role"] or "Grid Operator",
                        "station": row["station"] or "Gujarat SLDC - Gotri, Vadodara",
                        "password_hash": row["password_hash"] or "",
                        "created_at": row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"])
                    }
        except Exception as e:
            print(f"[Supabase PG] Fetch user warning: {e}")
        finally:
            pg_conn.close()

    # 2. Fallback to SQLite
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("SELECT * FROM profiles WHERE LOWER(email) = ?", (norm_email,))
        row = scur.fetchone()
        sconn.close()
        if row:
            d = dict(row)
            d["full_name"] = d.get("name", "")
            return d
    except Exception as e:
        print(f"[SQLite] Fetch user error: {e}")

    # 3. Fallback to users.json
    if os.path.exists(USERS_JSON):
        try:
            with open(USERS_JSON, "r") as f:
                users = json.load(f)
            u = users.get(norm_email)
            if u:
                u["full_name"] = u.get("name", "")
                return u
        except Exception:
            pass

    return None


def db_save_user_profile(email: str, name: str, role: str, station: str) -> Dict[str, Any]:
    """
    Updates user profile in Supabase PostgreSQL public.profiles table,
    and mirrors to local SQLite and users.json.
    """
    norm_email = email.strip().lower()
    norm_name = name.strip()
    norm_role = role.strip()
    norm_station = station.strip()
    assigned_id = f"usr-{secrets.token_hex(4)}"
    created_at_iso = datetime.now().isoformat()

    # 1. Update Supabase PostgreSQL
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                INSERT INTO public.profiles (email, full_name, role, station, updated_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (email) DO UPDATE
                SET full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    station = EXCLUDED.station,
                    updated_at = NOW()
                RETURNING id, email, full_name, role, station, created_at;
                """, (norm_email, norm_name, norm_role, norm_station))
                row = cur.fetchone()
                pg_conn.commit()
                if row:
                    assigned_id = str(row["id"])
                    created_at_iso = row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"])
                    print(f"[Supabase PG] Saved profile for {norm_email} in public.profiles")
        except Exception as e:
            print(f"[Supabase PG] Save profile warning: {e}")
        finally:
            pg_conn.close()

    # 2. Mirror into SQLite
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("SELECT id, password_hash, created_at FROM profiles WHERE LOWER(email) = ?", (norm_email,))
        existing = scur.fetchone()
        if existing:
            pw_hash = existing["password_hash"]
            created_at_iso = existing["created_at"]
            scur.execute("""
                UPDATE profiles 
                SET name = ?, role = ?, station = ?
                WHERE LOWER(email) = ?
            """, (norm_name, norm_role, norm_station, norm_email))
        else:
            pw_hash = ""
            scur.execute("""
                INSERT INTO profiles (id, email, name, password_hash, role, station, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (assigned_id, norm_email, norm_name, pw_hash, norm_role, norm_station, created_at_iso))
        sconn.commit()
        sconn.close()
    except Exception as e:
        print(f"[SQLite] Save profile mirror error: {e}")

    # 3. Mirror into users.json
    _sync_users_json()

    return {
        "id": assigned_id,
        "name": norm_name,
        "full_name": norm_name,
        "email": norm_email,
        "role": norm_role,
        "station": norm_station,
        "created_at": created_at_iso
    }


# =====================================================================
# 4. DISPATCH ACTIONS & AUDIT TRAIL
# =====================================================================

def db_log_dispatch(action: Dict[str, Any]) -> Dict[str, Any]:
    """
    Stores a physical grid dispatch action into Supabase PostgreSQL public.dispatch_actions,
    mirroring to SQLite and dispatch_logs.json.
    """
    event_id = action.get("id") or f"dsp-{secrets.token_hex(3)}"
    created_at_str = action.get("timestamp") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    op_name = action.get("operator_name", "Krish Patel")
    action_type = action.get("action_type", "BESS_DISCHARGE")
    mag_mw = float(action.get("magnitude_mw", 0))
    target = action.get("target_facility", "Sanand BESS")
    rationale = action.get("rationale", "")
    savings = float(action.get("financial_savings_inr", 0))
    co2 = float(action.get("co2_avoided_kg", 0))
    status = action.get("status", "EXECUTED")

    # 1. Insert into Supabase PostgreSQL
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                INSERT INTO public.dispatch_actions (
                    operator_name, action_type, magnitude_mw, target_facility,
                    rationale, financial_savings_inr, co2_avoided_kg, status, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                RETURNING id, operator_name, action_type, magnitude_mw, target_facility, rationale, financial_savings_inr, co2_avoided_kg, status, created_at;
                """, (op_name, action_type, mag_mw, target, rationale, savings, co2, status))
                row = cur.fetchone()
                pg_conn.commit()
                if row:
                    event_id = str(row["id"])
                    created_at_str = row["created_at"].isoformat() if hasattr(row["created_at"], "isoformat") else str(row["created_at"])
                    print(f"[Supabase PG] Logged dispatch action in public.dispatch_actions (UUID: {event_id})")
        except Exception as e:
            print(f"[Supabase PG] Dispatch log warning: {e}")
        finally:
            pg_conn.close()

    # 2. Mirror into local SQLite
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("""
        INSERT OR REPLACE INTO dispatch_actions (
            id, operator_name, action_type, magnitude_mw, target_facility,
            status, rationale, financial_savings_inr, co2_avoided_kg, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (event_id, op_name, action_type, mag_mw, target, status, rationale, savings, co2, created_at_str))
        sconn.commit()
        sconn.close()
    except Exception as e:
        print(f"[SQLite] Dispatch mirror error: {e}")

    _sync_dispatch_json()

    return {
        "id": event_id,
        "timestamp": created_at_str,
        "action_type": action_type,
        "magnitude_mw": mag_mw,
        "target_facility": target,
        "operator_name": op_name,
        "status": status,
        "rationale": rationale,
        "financial_savings_inr": savings,
        "co2_avoided_kg": co2
    }


def db_get_dispatch_history() -> List[Dict[str, Any]]:
    """
    Fetches dispatch logs from Supabase PostgreSQL public.dispatch_actions first,
    falling back to SQLite if unreachable.
    """
    # 1. Try Supabase PostgreSQL
    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                SELECT id, operator_name, action_type, magnitude_mw, target_facility,
                       rationale, financial_savings_inr, co2_avoided_kg, status, created_at
                FROM public.dispatch_actions
                ORDER BY created_at DESC
                LIMIT 100;
                """)
                rows = cur.fetchall()
                if rows:
                    results = []
                    for r in rows:
                        d = dict(r)
                        d["id"] = str(d["id"])
                        d["magnitude_mw"] = float(d.get("magnitude_mw") or 0)
                        d["financial_savings_inr"] = float(d.get("financial_savings_inr") or 0)
                        d["co2_avoided_kg"] = float(d.get("co2_avoided_kg") or 0)
                        d["timestamp"] = d["created_at"].isoformat() if hasattr(d["created_at"], "isoformat") else str(d["created_at"])
                        results.append(d)
                    return results
        except Exception as e:
            print(f"[Supabase PG] Fetch dispatch history warning: {e}")
        finally:
            pg_conn.close()

    # 2. Fallback to SQLite
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("SELECT * FROM dispatch_actions ORDER BY created_at DESC LIMIT 100")
        rows = scur.fetchall()
        sconn.close()
        results = []
        for r in rows:
            d = dict(r)
            d["timestamp"] = d["created_at"]
            results.append(d)
        return results
    except Exception as e:
        print(f"[SQLite] Fetch dispatch history error: {e}")
        return []


# =====================================================================
# 5. DATABASE INSPECTION & METRICS (Live Health)
# =====================================================================

def get_db_inspection() -> Dict[str, Any]:
    """
    Returns real-time health inspection of both the live Supabase PostgreSQL
    database and the local resilience SQLite mirror.
    """
    supabase_stats = {
        "status": "disconnected",
        "engine": "Supabase PostgreSQL (Production Cloud)",
        "host": "aws-0-ap-southeast-1.pooler.supabase.com",
        "tables": {}
    }

    pg_conn = get_pg_connection()
    if pg_conn:
        try:
            with pg_conn.cursor(cursor_factory=RealDictCursor) as cur:
                supabase_stats["status"] = "connected"
                
                # Check profiles table
                cur.execute("SELECT COUNT(*) as cnt FROM public.profiles;")
                profiles_count = cur.fetchone()["cnt"]
                cur.execute("SELECT id, email, full_name, role, station, created_at FROM public.profiles ORDER BY updated_at DESC LIMIT 5;")
                recent_profiles = []
                for r in cur.fetchall():
                    item = dict(r)
                    item["id"] = str(item["id"])
                    item["created_at"] = str(item["created_at"])
                    recent_profiles.append(item)

                supabase_stats["tables"]["public.profiles"] = {
                    "record_count": profiles_count,
                    "columns": ["id", "email", "full_name", "role", "station", "avatar_url", "password_hash", "created_at", "updated_at"],
                    "recent_entries": recent_profiles
                }

                # Check dispatch_actions table
                cur.execute("SELECT COUNT(*) as cnt FROM public.dispatch_actions;")
                dispatch_count = cur.fetchone()["cnt"]
                cur.execute("SELECT id, operator_name, action_type, magnitude_mw, target_facility, status, created_at FROM public.dispatch_actions ORDER BY created_at DESC LIMIT 5;")
                recent_dispatch = []
                for r in cur.fetchall():
                    item = dict(r)
                    item["id"] = str(item["id"])
                    item["magnitude_mw"] = float(item.get("magnitude_mw") or 0)
                    item["created_at"] = str(item["created_at"])
                    recent_dispatch.append(item)

                supabase_stats["tables"]["public.dispatch_actions"] = {
                    "record_count": dispatch_count,
                    "columns": ["id", "operator_name", "action_type", "magnitude_mw", "target_facility", "rationale", "financial_savings_inr", "co2_avoided_kg", "status", "created_at"],
                    "recent_entries": recent_dispatch
                }
        except Exception as e:
            supabase_stats["error"] = str(e)
        finally:
            pg_conn.close()

    # Local SQLite stats
    sqlite_stats = {
        "status": "connected",
        "database_file": DB_PATH,
        "size_bytes": os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0,
        "tables": {}
    }
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row["name"] for row in scur.fetchall() if not row["name"].startswith("sqlite_")]
        for t in tables:
            scur.execute(f"SELECT COUNT(*) as cnt FROM {t}")
            cnt = scur.fetchone()["cnt"]
            sqlite_stats["tables"][t] = {"record_count": cnt}
        sconn.close()
    except Exception as e:
        sqlite_stats["error"] = str(e)

    return {
        "status": "active",
        "active_primary_db": "Supabase PostgreSQL" if supabase_stats["status"] == "connected" else "SQLite (Fallback)",
        "supabase_postgresql": supabase_stats,
        "sqlite_local_mirror": sqlite_stats
    }


def _sync_users_json():
    """Keeps data/users.json mirrored with profiles table."""
    try:
        sconn = get_sqlite_connection()
        scur = sconn.cursor()
        scur.execute("SELECT * FROM profiles")
        users_dict = {}
        for row in scur.fetchall():
            d = dict(row)
            users_dict[d["email"]] = d
        sconn.close()
        with open(USERS_JSON, "w") as f:
            json.dump(users_dict, f, indent=2, default=str)
    except Exception as e:
        print(f"[DB] Could not sync users.json: {e}")


def _sync_dispatch_json():
    """Keeps data/dispatch_logs.json mirrored with dispatch_actions."""
    try:
        logs = db_get_dispatch_history()
        with open(DISPATCH_JSON, "w") as f:
            json.dump(logs, f, indent=2, default=str)
    except Exception as e:
        print(f"[DB] Could not sync dispatch_logs.json: {e}")


# Initialize database automatically on load
init_db()
