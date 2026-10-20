import io
import csv
import aiosqlite
from typing import Tuple, Dict, Any, Optional
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from config import DB_PATH

async def get_video_analytics(video_id: str) -> Dict[str, Any]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM metrics_history WHERE video_id = ? ORDER BY timestamp ASC", (video_id,)) as cursor:
            rows = await cursor.fetchall()
            
        async with db.execute("SELECT * FROM tracked_videos WHERE video_id = ?", (video_id,)) as cursor:
            video = await cursor.fetchone()

    if not rows or not video:
        return {}

    max_vpm = 0.0
    peak_timestamp = 0.0
    peak_views = 0
    total_views = video["views"]
    total_likes = video["likes"]
    total_saves = video["saves"]

    for r in rows:
        if r["velocity_vpm"] > max_vpm:
            max_vpm = r["velocity_vpm"]
            peak_timestamp = r["timestamp"]
            peak_views = r["views"]

    likes_per_1k = (total_likes / max(1, total_views)) * 1000
    saves_per_1k = (total_saves / max(1, total_views)) * 1000

    return {
        "video": dict(video),
        "history_count": len(rows),
        "peak_vpm": max_vpm,
        "peak_timestamp": peak_timestamp,
        "peak_views": peak_views,
        "likes_per_1k": round(likes_per_1k, 1),
        "saves_per_1k": round(saves_per_1k, 1)
    }

async def generate_chart_png(video_id: str) -> Optional[io.BytesIO]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT timestamp, views, velocity_vpm FROM metrics_history WHERE video_id = ? ORDER BY timestamp ASC", (video_id,)) as cursor:
            rows = await cursor.fetchall()

    if not rows:
        return None

    dates = [datetime.fromtimestamp(r["timestamp"]) for r in rows]
    views = [r["views"] for r in rows]
    vpm = [r["velocity_vpm"] for r in rows]

    plt.style.use('dark_background')
    fig, ax1 = plt.subplots(figsize=(10, 5), dpi=150)
    fig.patch.set_facecolor('#0f172a')
    ax1.set_facecolor('#0f172a')

    # Dual axis: line for views, bars for vpm
    color_views = '#00f2fe'
    ax1.plot(dates, views, color=color_views, linewidth=2.5, label='Visualizaciones')
    ax1.set_ylabel('Visualizaciones Acumuladas', color=color_views, fontsize=11, fontweight='bold')
    ax1.tick_params(axis='y', labelcolor=color_views)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%d/%m %H:%M'))
    plt.xticks(rotation=30, ha='right')

    ax2 = ax1.twinx()
    color_vpm = '#fe2c55'
    ax2.bar(dates, vpm, width=0.015, color=color_vpm, alpha=0.35, label='Velocidad (vpm)')
    ax2.set_ylabel('Velocidad (visitas/min)', color=color_vpm, fontsize=11, fontweight='bold')
    ax2.tick_params(axis='y', labelcolor=color_vpm)

    plt.title(f"Evolución y Tracción Temporal - Vídeo {video_id}", color='#ffffff', fontsize=13, fontweight='bold', pad=15)
    fig.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close(fig)
    buf.seek(0)
    return buf

async def generate_csv_bytes(video_id: str) -> io.BytesIO:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM metrics_history WHERE video_id = ? ORDER BY timestamp ASC", (video_id,)) as cursor:
            rows = await cursor.fetchall()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "video_id", "timestamp", "datetime_iso", "views", "likes", 
        "comments", "shares", "saves", "engagement_rate", "delta_views", "velocity_vpm", "is_viral_spike"
    ])
    for r in rows:
        writer.writerow([
            r["video_id"],
            r["timestamp"],
            datetime.fromtimestamp(r["timestamp"]).isoformat(),
            r["views"],
            r["likes"],
            r["comments"],
            r["shares"],
            r["saves"],
            r["engagement_rate"],
            r["delta_views"],
            r["velocity_vpm"],
            r["is_viral_spike"]
        ])

    buf = io.BytesIO(output.getvalue().encode('utf-8'))
    buf.seek(0)
    return buf
