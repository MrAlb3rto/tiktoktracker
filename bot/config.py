import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
CHECK_INTERVAL_MINUTES: int = int(os.getenv("CHECK_INTERVAL_MINUTES", "5"))
MAX_PROFILE_VIDEOS: int = int(os.getenv("MAX_PROFILE_VIDEOS", "10"))
DB_PATH: str = os.getenv("DB_PATH", "/app/data/tracker.db")
TZ: str = os.getenv("TZ", "Europe/Madrid")
WEB_PORT: int = int(os.getenv("PORT", "3000"))
