import aiosqlite
import os
from config import DB_PATH

async def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS tracked_videos (
                video_id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT,
                publish_time TEXT,
                views INTEGER NOT NULL,
                likes INTEGER NOT NULL,
                comments INTEGER NOT NULL,
                shares INTEGER NOT NULL,
                saves INTEGER NOT NULL,
                engagement_rate REAL NOT NULL,
                velocity_vpm REAL DEFAULT 0.0,
                delta_views INTEGER DEFAULT 0,
                is_tracking INTEGER DEFAULT 1,
                milestone_interval INTEGER DEFAULT 5000,
                last_milestone_views INTEGER NOT NULL,
                target_milestone INTEGER NOT NULL,
                last_milestone_timestamp REAL NOT NULL,
                initial_views INTEGER NOT NULL,
                initial_timestamp REAL NOT NULL,
                last_check_timestamp REAL NOT NULL
            );
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                views INTEGER NOT NULL,
                likes INTEGER NOT NULL,
                comments INTEGER NOT NULL,
                shares INTEGER NOT NULL,
                saves INTEGER NOT NULL,
                engagement_rate REAL NOT NULL,
                delta_views INTEGER NOT NULL,
                velocity_vpm REAL NOT NULL,
                is_viral_spike INTEGER DEFAULT 0,
                FOREIGN KEY (video_id) REFERENCES tracked_videos(video_id)
            );
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS video_cache (
                cache_key TEXT PRIMARY KEY,
                data_json TEXT NOT NULL,
                created_at REAL NOT NULL
            );
        """)
        await db.commit()
