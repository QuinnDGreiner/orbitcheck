import sqlite3
import json
from datetime import datetime, timezone

DB_PATH = "results.db"


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS results (
                id         TEXT PRIMARY KEY,
                data       TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def store_result(result_id: str, data: dict) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO results (id, data, created_at) VALUES (?, ?, ?)",
            (result_id, json.dumps(data), datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()


def get_result(result_id: str) -> dict | None:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT data FROM results WHERE id = ?", (result_id,)
        ).fetchone()
    return json.loads(row[0]) if row else None
