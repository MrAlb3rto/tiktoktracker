import asyncio
import time
from aiogram import Router, F, Bot
from aiogram.filters import Command, CommandStart
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, BufferedInputFile
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
import aiosqlite

from config import DB_PATH, MAX_PROFILE_VIDEOS
from scraper import TikTokScraper
from analytics import get_video_analytics, generate_chart_png, generate_csv_bytes

router = Router()

class MilestoneForm(StatesGroup):
    waiting_for_custom_milestone = State()

def build_video_panel_kb(video_id: str, is_tracking: bool) -> InlineKeyboardMarkup:
    track_btn = InlineKeyboardButton(
        text="🛑 Detener Seguimiento" if is_tracking else "▶️ Iniciar Seguimiento",
        callback_data=f"track_toggle:{video_id}"
    )
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🔄 Actualizar ahora", callback_data=f"refresh:{video_id}"),
            InlineKeyboardButton(text="🔔 Configurar Hito", callback_data=f"milestone_menu:{video_id}")
        ],
        [
            InlineKeyboardButton(text="📈 Ver Analíticas y Gráfica", callback_data=f"analytics:{video_id}"),
            InlineKeyboardButton(text="📥 Exportar Logs (CSV)", callback_data=f"export_csv:{video_id}")
        ],
        [track_btn]
    ])

def format_video_html(v: dict) -> str:
    eng = v.get("engagement_rate", 0.0)
    tracking_str = "🟢 ACTIVO" if v.get("is_tracking", 1) else "🔴 PAUSADO"
    return (
        f"🎬 <b>Panel de Monitoreo TikTok</b>\n\n"
        f"👤 <b>Autor:</b> {v['author']}\n"
        f"📝 <b>Descripción:</b> <a href='{v['url']}'>{v['description'][:65]}...</a>\n\n"
        f"<b>Métricas en Vivo:</b>\n"
        f"👀 <b>Visualizaciones:</b> {v['views']:,}\n"
        f"❤️ <b>Likes:</b> {v['likes']:,}\n"
        f"💬 <b>Comentarios:</b> {v['comments']:,}\n"
        f"🔄 <b>Compartidos:</b> {v['shares']:,}\n"
        f"🔖 <b>Guardados:</b> {v['saves']:,}\n"
        f"⚡ <b>Engagement Rate:</b> {eng:.2f}%\n"
        f"🚀 <b>Velocidad actual:</b> {v.get('velocity_vpm', 0.0):.1f} vpm\n\n"
        f"📌 <b>Estado:</b> {tracking_str}\n"
        f"🎯 <b>Meta Próximo Hito:</b> {v.get('target_milestone', 0):,} (+{v.get('milestone_interval', 5000):,})"
    )

@router.message(CommandStart())
async def cmd_start(msg: Message):
    text = (
        "👋 <b>¡Bienvenido al Bot de Monitoreo de TikTok 24/7!</b>\n\n"
        "Puedes usar este bot de dos maneras:\n"
        "1️⃣ <b>Enlace directo:</b> Envía un enlace corto (vm.tiktok.com) o largo para ver y trackear el vídeo.\n"
        "2️⃣ <b>Explorador de perfil:</b> Envía <code>@usuario</code> para listar sus últimos vídeos y activar alertas.\n\n"
        "Usa /mis_alertas para listar tus vídeos activos o consulta el portal web en el puerto 3000."
    )
    await msg.answer(text, parse_mode="HTML")

@router.message(Command("mis_alertas"))
async def cmd_mis_alertas(msg: Message):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT video_id, author, description, views, target_milestone FROM tracked_videos WHERE is_tracking = 1") as c:
            rows = await c.fetchall()

    if not rows:
        await msg.answer("No tienes vídeos en seguimiento actualmente. ¡Envía un enlace o un @usuario para comenzar!")
        return

    buttons = []
    for r in rows:
        buttons.append([InlineKeyboardButton(
            text=f"{r['author']} | 👀 {r['views']:,} | 🎯 {r['target_milestone']:,}",
            callback_data=f"refresh:{r['video_id']}"
        )])

    await msg.answer("📋 <b>Vídeos en seguimiento activo:</b>", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons), parse_mode="HTML")

@router.message(F.text.startswith("@"))
async def handle_profile_search(msg: Message):
    username = msg.text.strip()
    status_msg = await msg.answer(f"🔎 Consultando vídeos públicos de {username}...")
    summaries = await TikTokScraper.extract_profile_recent_videos(username, limit=MAX_PROFILE_VIDEOS)
    
    if not summaries:
        await status_msg.edit_text(f"❌ No se pudieron obtener vídeos de {username}. Comprueba que el usuario sea correcto y público.")
        return

    buttons = []
    for s in summaries:
        buttons.append([InlineKeyboardButton(
            text=f"👀 {s.views:,} | {s.title[:35]}",
            callback_data=f"track_url:{s.video_id}"
        )])

    await status_msg.edit_text(
        f"👤 <b>Últimos {len(summaries)} vídeos de {username}:</b>\nSelecciona un vídeo para monitorizarlo:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons),
        parse_mode="HTML"
    )

@router.message(F.text.contains("tiktok.com"))
async def handle_tiktok_url(msg: Message):
    url = msg.text.strip()
    status_msg = await msg.answer("⏳ Extrayendo métricas de TikTok...")
    stats = await TikTokScraper.extract_video_stats(url)
    
    if not stats:
        await status_msg.edit_text("❌ No se pudo extraer la información del vídeo. Verifica la URL.")
        return

    now = time.time()
    # Save to db
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO tracked_videos (
                video_id, url, author, description, publish_time, views, likes, comments, shares, saves,
                engagement_rate, velocity_vpm, delta_views, is_tracking, milestone_interval,
                last_milestone_views, target_milestone, last_milestone_timestamp, initial_views,
                initial_timestamp, last_check_timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0, 1, 5000, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(video_id) DO UPDATE SET
                views=excluded.views, likes=excluded.likes, comments=excluded.comments,
                shares=excluded.shares, saves=excluded.saves, engagement_rate=excluded.engagement_rate,
                last_check_timestamp=excluded.last_check_timestamp;
        """, (
            stats.video_id, stats.url, stats.author, stats.description, stats.publish_time,
            stats.views, stats.likes, stats.comments, stats.shares, stats.saves,
            stats.engagement_rate, stats.views, stats.views + 5000, now, stats.views, now, now
        ))
        await db.commit()

    v_dict = {
        "author": stats.author,
        "url": stats.url,
        "description": stats.description,
        "views": stats.views,
        "likes": stats.likes,
        "comments": stats.comments,
        "shares": stats.shares,
        "saves": stats.saves,
        "engagement_rate": stats.engagement_rate,
        "velocity_vpm": 0.0,
        "is_tracking": 1,
        "target_milestone": stats.views + 5000,
        "milestone_interval": 5000
    }
    await status_msg.edit_text(format_video_html(v_dict), reply_markup=build_video_panel_kb(stats.video_id, True), parse_mode="HTML")

@router.callback_query(F.data.startswith("refresh:"))
async def cb_refresh(call: CallbackQuery):
    video_id = call.data.split(":")[1]
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM tracked_videos WHERE video_id = ?", (video_id,)) as c:
            row = await c.fetchone()
    
    if not row:
        await call.answer("Vídeo no encontrado", show_alert=True)
        return

    # Fresh scrape
    stats = await TikTokScraper.extract_video_stats(row["url"])
    if stats:
        now = time.time()
        elapsed_min = max(1.0, (now - row["last_check_timestamp"]) / 60.0)
        delta_v = max(0, stats.views - row["views"])
        vpm = round(delta_v / elapsed_min, 1)

        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("""
                UPDATE tracked_videos SET views = ?, likes = ?, comments = ?, shares = ?, saves = ?,
                engagement_rate = ?, velocity_vpm = ?, delta_views = ?, last_check_timestamp = ?
                WHERE video_id = ?
            """, (stats.views, stats.likes, stats.comments, stats.shares, stats.saves, stats.engagement_rate, vpm, delta_v, now, video_id))
            await db.commit()

        v_dict = dict(row)
        v_dict.update({
            "views": stats.views, "likes": stats.likes, "comments": stats.comments,
            "shares": stats.shares, "saves": stats.saves, "engagement_rate": stats.engagement_rate,
            "velocity_vpm": vpm
        })
    else:
        v_dict = dict(row)

    await call.message.edit_text(format_video_html(v_dict), reply_markup=build_video_panel_kb(video_id, bool(v_dict["is_tracking"])), parse_mode="HTML")
    await call.answer("✅ Métricas actualizadas")

@router.callback_query(F.data.startswith("analytics:"))
async def cb_analytics(call: CallbackQuery):
    video_id = call.data.split(":")[1]
    await call.answer("📊 Generando analíticas...")
    png_buf = await generate_chart_png(video_id)
    analytics = await get_video_analytics(video_id)

    caption = (
        f"📈 <b>Reporte de Rendimiento - {video_id}</b>\n\n"
        f"🚀 <b>Pico de Tracción:</b> {analytics.get('peak_vpm', 0.0):.1f} visitas/minuto\n"
        f"❤️ <b>Conversión de Likes:</b> {analytics.get('likes_per_1k', 0.0)} por cada 1.000 views\n"
        f"🔖 <b>Conversión de Guardados:</b> {analytics.get('saves_per_1k', 0.0)} por cada 1.000 views\n"
        f"📋 <b>Snapshots registrados:</b> {analytics.get('history_count', 0)}"
    )

    if png_buf:
        photo = BufferedInputFile(png_buf.read(), filename=f"chart_{video_id}.png")
        await call.message.answer_photo(photo=photo, caption=caption, parse_mode="HTML")
    else:
        await call.message.answer(caption, parse_mode="HTML")

@router.callback_query(F.data.startswith("export_csv:"))
async def cb_export_csv(call: CallbackQuery):
    video_id = call.data.split(":")[1]
    await call.answer("📥 Preparando CSV...")
    csv_buf = await generate_csv_bytes(video_id)
    doc = BufferedInputFile(csv_buf.read(), filename=f"metrics_history_{video_id}.csv")
    await call.message.answer_document(doc, caption=f"📑 Historial completo de telemetría para vídeo {video_id}")
