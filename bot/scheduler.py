import asyncio
import time
import aiosqlite
from aiogram import Bot
from config import DB_PATH, CHECK_INTERVAL_MINUTES
from scraper import TikTokScraper

def format_natural_time(seconds: float) -> str:
    secs = int(seconds)
    hours = secs // 3600
    minutes = (secs % 3600) // 60
    rem_secs = secs % 60
    parts = []
    if hours > 0:
        parts.append(f"{hours} hora{'s' if hours > 1 else ''}")
    if minutes > 0:
        parts.append(f"{minutes} minuto{'s' if minutes > 1 else ''}")
    if rem_secs > 0 or not parts:
        parts.append(f"{rem_secs} segundo{'s' if rem_secs > 1 else ''}")
    if len(parts) == 1:
        return parts[0]
    return f"{', '.join(parts[:-1])} y {parts[-1]}"

async def run_telemetry_scheduler(bot: Bot, admin_chat_id: str):
    while True:
        try:
            now = time.time()
            async with aiosqlite.connect(DB_PATH) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute("SELECT * FROM tracked_videos WHERE is_tracking = 1") as cursor:
                    videos = await cursor.fetchall()

                for v in videos:
                    await asyncio.sleep(2.0) # anti-rate-limit delay
                    stats = await TikTokScraper.extract_video_stats(v["url"])
                    if not stats:
                        continue

                    elapsed_min = max(0.5, (now - v["last_check_timestamp"]) / 60.0)
                    delta_views = max(0, stats.views - v["views"])
                    velocity_vpm = round(delta_views / elapsed_min, 2)

                    # Moving average for viral spike detection
                    async with db.execute(
                        "SELECT velocity_vpm FROM metrics_history WHERE video_id = ? ORDER BY timestamp DESC LIMIT 6",
                        (v["video_id"],)
                    ) as ma_c:
                        recent_vpm = [r["velocity_vpm"] for r in await ma_c.fetchall()]

                    avg_vpm = sum(recent_vpm) / len(recent_vpm) if recent_vpm else velocity_vpm
                    is_viral = len(recent_vpm) >= 3 and velocity_vpm > 3 * avg_vpm and velocity_vpm > 10

                    # Insert snapshot
                    await db.execute("""
                        INSERT INTO metrics_history (
                            video_id, timestamp, views, likes, comments, shares, saves,
                            engagement_rate, delta_views, velocity_vpm, is_viral_spike
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        v["video_id"], now, stats.views, stats.likes, stats.comments, stats.shares, stats.saves,
                        stats.engagement_rate, delta_views, velocity_vpm, 1 if is_viral else 0
                    ))

                    # Viral Alert
                    if is_viral and admin_chat_id:
                        ratio = round(velocity_vpm / max(0.1, avg_vpm), 1)
                        msg = (
                            f"🔥 <b>¡TENDENCIA DETECTADA: ACELERACIÓN INUSUAL DE TRÁFICO!</b>\n\n"
                            f"📹 <b>Vídeo:</b> {v['description'][:50]}...\n"
                            f"👤 <b>Autor:</b> {v['author']}\n"
                            f"⚡ <b>Velocidad:</b> {velocity_vpm} views/min (<b>{ratio}x</b> superior a la media)\n"
                            f"👀 <b>Total visitas:</b> {stats.views:,}\n"
                            f"🔗 <a href='{v['url']}'>Ver en TikTok</a>"
                        )
                        try:
                            await bot.send_message(admin_chat_id, msg, parse_mode="HTML")
                        except Exception:
                            pass

                    # Milestone Check
                    if stats.views >= v["target_milestone"]:
                        duration = format_natural_time(now - v["last_milestone_timestamp"])
                        net_views = stats.views - v["last_milestone_views"]
                        net_likes = stats.likes - v["likes"]
                        net_comments = stats.comments - v["comments"]
                        net_shares = stats.shares - v["shares"]
                        net_saves = stats.saves - v["saves"]
                        speed = round(net_views / max(1.0, (now - v["last_milestone_timestamp"]) / 60.0), 1)

                        next_target = stats.views + v["milestone_interval"]
                        await db.execute("""
                            UPDATE tracked_videos SET
                                last_milestone_views = ?, target_milestone = ?, last_milestone_timestamp = ?
                            WHERE video_id = ?
                        """, (stats.views, next_target, now, v["video_id"]))

                        if admin_chat_id:
                            m_msg = (
                                f"🎯 <b>¡HITO DE VISITAS ALCANZADO! (+{v['milestone_interval']:,})</b>\n\n"
                                f"📹 <b>Vídeo:</b> {v['description'][:50]}...\n"
                                f"👤 <b>Autor:</b> {v['author']}\n"
                                f"🏁 <b>Meta:</b> {v['target_milestone']:,} visitas\n"
                                f"⏱️ <b>Tiempo de tramo:</b> {duration}\n"
                                f"🚀 <b>Velocidad media:</b> {speed} vpm\n\n"
                                f"<b>Crecimiento neto:</b>\n"
                                f"👀 +{net_views:,} views | ❤️ +{net_likes:,} likes\n"
                                f"💬 +{net_comments:,} comm | 🔄 +{net_shares:,} shares | 🔖 +{net_saves:,} saves\n\n"
                                f"🎯 <b>Próxima meta:</b> {next_target:,} views"
                            )
                            try:
                                await bot.send_message(admin_chat_id, m_msg, parse_mode="HTML")
                            except Exception:
                                pass

                    # Update video master record
                    await db.execute("""
                        UPDATE tracked_videos SET
                            views = ?, likes = ?, comments = ?, shares = ?, saves = ?,
                            engagement_rate = ?, velocity_vpm = ?, delta_views = ?, last_check_timestamp = ?
                        WHERE video_id = ?
                    """, (stats.views, stats.likes, stats.comments, stats.shares, stats.saves, stats.engagement_rate, velocity_vpm, delta_views, now, v["video_id"]))

                await db.commit()
        except Exception as e:
            print(f"[Scheduler error]: {e}")

        await asyncio.sleep(CHECK_INTERVAL_MINUTES * 60)
