import asyncio
import os
import sys
from aiogram import Bot, Dispatcher
from config import BOT_TOKEN
from database import init_db
from handlers import router
from scheduler import run_telemetry_scheduler

async def main():
    if not BOT_TOKEN:
        print("[AVISO] BOT_TOKEN no configurado en variables de entorno. Configúralo en el archivo .env o en Portainer.")
        # Keep process alive or wait
    
    print("🚀 Inicializando base de datos SQLite (WAL mode)...")
    await init_db()

    bot = Bot(token=BOT_TOKEN) if BOT_TOKEN else None
    dp = Dispatcher()
    dp.include_router(router)

    admin_chat_id = os.getenv("TELEGRAM_CHAT_ID", "")

    if bot:
        print("🤖 Iniciando planificador de telemetría asíncrono...")
        asyncio.create_task(run_telemetry_scheduler(bot, admin_chat_id))
        print("✅ Bot de Telegram iniciado. Escuchando mensajes...")
        await dp.start_polling(bot)
    else:
        print("ℹ️ Modo pasivo activo. Configura BOT_TOKEN para habilitar polling de Telegram.")
        while True:
            await asyncio.sleep(3600)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        print("Bot detenido.")
