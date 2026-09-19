import os
import sqlite3
import time
from typing import Optional, Dict, Any

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at REAL NOT NULL
        );
    """)
    conn.commit()
    conn.close()

def create_user(username: str, email: str, password_hash: str, salt: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = time.time()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
            (username.strip(), email.strip().lower(), password_hash, salt, now)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "username": username.strip(),
            "email": email.strip().lower(),
            "created_at": now
        }
    except sqlite3.IntegrityError as e:
        conn.close()
        err_str = str(e).lower()
        if "username" in err_str:
            raise ValueError("Username is already taken.")
        elif "email" in err_str:
            raise ValueError("Email address is already registered.")
        else:
            raise ValueError("Username or email already exists.")
    finally:
        conn.close()

def get_user_by_email_or_username(identifier: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    clean_id = identifier.strip().lower()
    cursor.execute(
        "SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?",
        (clean_id, clean_id)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

# Initialize table on import
init_db()
