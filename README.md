# 🚀 TikTok Video Tracker & Real-Time Analytics Portal (24/7)

Sistema integral de analítica temporal, telemetría y alertas push para vídeos de TikTok, optimizado para ejecutarse 24/7 en una **Raspberry Pi 5 (ARM64 / 8GB RAM)** o cualquier servidor Linux mediante **Portainer Stacks** y accesible vía **Portal Web interactivo** y/o **Bot de Telegram (`aiogram 3.x`)**.

---

## 🌟 Características Principales

1. **Portal Web de Analíticas en Tiempo Real:**
   - **Filtros Temporales:** Desglose y agregación de métricas **Por Hora (últimas 24h)**, **Por Día (7/14/30 días)**, **Por Semana** y **Histórico Total**.
   - **Monitoreo de "X Usuario":** Visualiza el aggregate global de tu cuenta o cualquier creador (total reproducciones, likes, comentarios, compartidos, guardados, engagement rate y velocidad media en tiempo real).
   - **Panel Detallado por Vídeo:** Métrica en vivo, engagement rate exacto, velocidad instantánea en visitas/minuto (`vpm`) y variación reciente ($\Delta$).
   - **Gráficas de Evolución Temporal:** Curva de crecimiento acumulado con barras de velocidad horaria e hitos destacados.
   - **Detector de Picos Virales:** Alerta temprana visual y push cuando la velocidad instantánea supera en más de 3x la media móvil de las últimas comprobaciones.
   - **Sistema de Hitos (Milestones):** Configuración de metas (+1k, +5k, +10k, +50k o personalizada) con cálculo del tiempo exacto del tramo y desglose neto de ganancias.
   - **Exportación de Datos (CSV):** Descarga el volcado completo de telemetría de cualquier vídeo para análisis en Excel, Pandas o Grafana.

2. **Doble Vía de Entrada:**
   - **Vía A (Enlace Directo):** Compatible con enlaces cortos (`vm.tiktok.com/...`, `vt.tiktok.com/...`) y enlaces estándar (`tiktok.com/@user/video/...`).
   - **Vía B (Explorador de Perfil `@usuario`):** Consulta los últimos vídeos públicos y actívalos en el tracker con un solo clic.

3. **Arquitectura Ligera para Raspberry Pi 5 (ARM64):**
   - 0 navegadores pesados headless (sin Chromium/Selenium que agoten la RAM).
   - Extracción híbrida ultrarrápida (`httpx` + JSON hydration `__UNIVERSAL_DATA_FOR_REHYDRATION__` con fallback no bloqueante).
   - Persistencia segura con SQLite en modo WAL (`PRAGMA journal_mode=WAL;`).

---

## 🛠️ Despliegue Rápido en Portainer (Paso a Paso)

### Opción 1: Despliegue Directo desde GitHub (Recomendado)

1. Sube este repositorio a tu cuenta de GitHub (ver sección *Conectar con tu GitHub* más abajo).
2. Entra en tu **Portainer** en la Raspberry Pi.
3. En el menú lateral, ve a **Stacks** ➡️ **Add stack**.
4. Selecciona el método **Repository**:
   - **Repository URL:** `https://github.com/TU_USUARIO/tiktok-tracker.git`
   - **Repository reference:** `refs/heads/main`
   - **Compose path:** `docker-compose.yml`
5. En la sección **Environment variables**, añade:
   - `BOT_TOKEN`: Token de tu bot de Telegram de @BotFather (opcional si solo quieres la web).
   - `TELEGRAM_CHAT_ID`: Tu ID de Telegram (de @userinfobot).
   - `CHECK_INTERVAL_MINUTES`: `5` (frecuencia de muestreo en minutos).
   - `TZ`: `Europe/Madrid` (o tu zona horaria).
6. Haz clic en **Deploy the stack**.
7. ¡Listo! Abre en tu navegador `http://IP_DE_TU_RASPBERRY:3000`.

---

## 🐙 Conectar este Proyecto con tu GitHub

Para subir el código generado a tu repositorio de GitHub:

```bash
# 1. Crea un repositorio vacío en github.com (ej. tiktok-tracker)
# 2. En la terminal de este proyecto, enlaza tu repositorio remoto:
git remote add origin https://github.com/TU_USUARIO/tiktok-tracker.git

# 3. Sube la rama principal:
git branch -M main
git push -u origin main
```

---

## 📁 Estructura del Proyecto

```
├── Dockerfile                  # Imagen multi-arch optimizada para linux/arm64 y linux/amd64
├── docker-compose.yml          # Stack listo para Portainer con volumen de datos persistente
├── stack.env.example           # Plantilla de variables de entorno
├── server.ts                   # Backend Express, motor de scraping, scheduler y API REST
├── src/                        # Frontend Web (React 19 + TypeScript + Tailwind CSS)
│   ├── App.tsx                 # Portal web principal con vistas temporal, perfil y alertas
│   ├── components/             # Gráficos SVG interactivos, paneles de métricas y modales
│   └── main.tsx                # Entrada cliente
├── bot/                        # Código del bot independiente de Telegram (aiogram 3.x)
│   ├── main.py                 # Entrada asíncrona del bot
│   ├── config.py               # Variables de configuración
│   ├── database.py             # SQLite asíncrono con WAL mode (aiosqlite)
│   ├── scraper.py              # Motor de scraping híbrido httpx + yt-dlp
│   ├── analytics.py            # Generador de gráficas matplotlib en memoria (BytesIO) y CSV
│   ├── handlers.py             # Enrutadores, callbacks y FSM
│   └── scheduler.py            # AsyncIOScheduler y detector de picos virales
└── data/                       # Volumen persistente mapeado en Docker (/app/data)
```

---

## 📱 Comandos del Bot de Telegram

- `/start`: Menú principal y bienvenida.
- `/mis_alertas`: Lista los vídeos actualmente monitorizados y su estado.
- Enviar `@usuario`: Muestra los últimos vídeos del perfil para trackearlos.
- Enviar URL de TikTok: Analiza y activa el panel interactivo del vídeo.
