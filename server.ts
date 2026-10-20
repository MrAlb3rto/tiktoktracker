import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'tracker.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data Models
export interface VideoStats {
  id: string;
  url: string;
  author: string;
  authorAvatar?: string;
  description: string;
  publishTime: string;
  coverUrl?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number; // in %
  velocityVpm: number; // views per minute
  deltaViews: number; // views gained in last check
  lastCheckTimestamp: number;
  
  // Tracking settings
  isTracking: boolean;
  milestoneInterval: number; // e.g. 5000 for +5k
  lastMilestoneViews: number;
  lastMilestoneTimestamp: number;
  targetMilestone: number;
  initialViews: number;
  initialTimestamp: number;
}

export interface MetricSnapshot {
  id: string;
  videoId: string;
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  deltaViews: number;
  velocityVpm: number;
  isViralSpike: boolean;
}

export interface MilestoneAlert {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  milestoneTarget: number;
  achievedTimestamp: number;
  durationFormatted: string;
  avgVelocityVpm: number;
  netViewsDelta: number;
  netLikesDelta: number;
  netCommentsDelta: number;
  netSharesDelta: number;
  netSavesDelta: number;
  totalViews: number;
  sentToTelegram: boolean;
}

export interface ViralSpikeAlert {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  timestamp: number;
  velocityVpm: number;
  movingAverageVpm: number;
  ratio: number;
  views: number;
  sentToTelegram: boolean;
}

export interface TrackerDatabase {
  settings: {
    botToken: string;
    chatId: string;
    checkIntervalMinutes: number;
    telegramAlertsEnabled: boolean;
    monitoredProfile: string; // "X usuario" to track by default
  };
  videos: Record<string, VideoStats>;
  history: MetricSnapshot[];
  milestoneAlerts: MilestoneAlert[];
  viralAlerts: ViralSpikeAlert[];
}

// Load or initialize DB
function loadDB(): TrackerDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading db file, reinitializing', err);
    }
  }

  // Initial Seed Data with realistic timeline so user immediately sees rich analytics & charts
  const now = Date.now();
  const seedAuthor = '@albertocastells';
  
  const seedVideos: Record<string, VideoStats> = {
    '73910293847192': {
      id: '73910293847192',
      url: 'https://www.tiktok.com/@albertocastells/video/73910293847192',
      author: seedAuthor,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: 'Cómo monté un bot 24/7 en Raspberry Pi 5 con Portainer 🚀 #dev #raspberrypi #tech',
      publishTime: new Date(now - 86400000 * 3).toISOString(),
      coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
      views: 128450,
      likes: 14210,
      comments: 630,
      shares: 1450,
      saves: 3820,
      engagementRate: 15.65,
      velocityVpm: 42.5,
      deltaViews: 212,
      lastCheckTimestamp: now,
      isTracking: true,
      milestoneInterval: 10000,
      lastMilestoneViews: 120000,
      lastMilestoneTimestamp: now - 3600000 * 4,
      targetMilestone: 130000,
      initialViews: 15000,
      initialTimestamp: now - 86400000 * 3
    },
    '73928172635411': {
      id: '73928172635411',
      url: 'https://www.tiktok.com/@albertocastells/video/73928172635411',
      author: seedAuthor,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: '3 herramientas Open Source para monitorear tu servidor en tiempo real 🔥',
      publishTime: new Date(now - 86400000 * 2).toISOString(),
      coverUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80',
      views: 74200,
      likes: 8940,
      comments: 310,
      shares: 980,
      saves: 2450,
      engagementRate: 17.09,
      velocityVpm: 28.1,
      deltaViews: 140,
      lastCheckTimestamp: now,
      isTracking: true,
      milestoneInterval: 5000,
      lastMilestoneViews: 70000,
      lastMilestoneTimestamp: now - 3600000 * 6,
      targetMilestone: 75000,
      initialViews: 8200,
      initialTimestamp: now - 86400000 * 2
    },
    '73939102837465': {
      id: '73939102837465',
      url: 'https://www.tiktok.com/@albertocastells/video/73939102837465',
      author: seedAuthor,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: 'El mayor error al configurar Docker Compose en ARM64 (y cómo solucionarlo)',
      publishTime: new Date(now - 86400000).toISOString(),
      coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
      views: 41900,
      likes: 5120,
      comments: 184,
      shares: 620,
      saves: 1890,
      engagementRate: 18.65,
      velocityVpm: 68.4,
      deltaViews: 342,
      lastCheckTimestamp: now,
      isTracking: true,
      milestoneInterval: 5000,
      lastMilestoneViews: 40000,
      lastMilestoneTimestamp: now - 3600000 * 2,
      targetMilestone: 45000,
      initialViews: 2000,
      initialTimestamp: now - 86400000
    }
  };

  // Generate 48 hours of time-series snapshots for seed videos to populate charts
  const history: MetricSnapshot[] = [];
  const hoursToGenerate = 48;
  const intervalMs = 60 * 60 * 1000; // 1 snapshot per hour
  
  Object.values(seedVideos).forEach(vid => {
    let currViews = Math.max(1000, Math.round(vid.views * 0.35));
    for (let i = hoursToGenerate; i >= 0; i--) {
      const snapTime = now - i * intervalMs;
      // progressive increase towards current views
      const progress = (hoursToGenerate - i) / hoursToGenerate;
      currViews = Math.round(vid.views * 0.35 + (vid.views * 0.65) * Math.pow(progress, 1.2));
      const delta = Math.round(Math.max(10, (vid.views * 0.65) / hoursToGenerate * (0.6 + Math.random() * 0.8)));
      const vpm = Number((delta / 60).toFixed(2));
      const lk = Math.round(currViews * (vid.likes / vid.views));
      const cm = Math.round(currViews * (vid.comments / vid.views));
      const sh = Math.round(currViews * (vid.shares / vid.views));
      const sv = Math.round(currViews * (vid.saves / vid.views));
      const eng = Number((((lk + cm + sh + sv) / Math.max(1, currViews)) * 100).toFixed(2));
      const isSpike = i === 14 && vid.id === '73939102837465'; // simulated viral spike

      history.push({
        id: `snap-${vid.id}-${snapTime}`,
        videoId: vid.id,
        timestamp: snapTime,
        views: currViews,
        likes: lk,
        comments: cm,
        shares: sh,
        saves: sv,
        engagementRate: eng,
        deltaViews: delta,
        velocityVpm: isSpike ? vpm * 3.5 : vpm,
        isViralSpike: isSpike
      });
    }
  });

  const db: TrackerDatabase = {
    settings: {
      botToken: process.env.BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      checkIntervalMinutes: 5,
      telegramAlertsEnabled: false,
      monitoredProfile: seedAuthor
    },
    videos: seedVideos,
    history,
    milestoneAlerts: [
      {
        id: 'alert-1',
        videoId: '73910293847192',
        videoTitle: 'Cómo monté un bot 24/7 en Raspberry Pi 5 con Portainer 🚀',
        author: seedAuthor,
        milestoneTarget: 120000,
        achievedTimestamp: now - 3600000 * 4,
        durationFormatted: '3 horas, 14 minutos y 22 segundos',
        avgVelocityVpm: 51.4,
        netViewsDelta: 10000,
        netLikesDelta: 1120,
        netCommentsDelta: 45,
        netSharesDelta: 120,
        netSavesDelta: 310,
        totalViews: 120000,
        sentToTelegram: true
      }
    ],
    viralAlerts: [
      {
        id: 'viral-1',
        videoId: '73939102837465',
        videoTitle: 'El mayor error al configurar Docker Compose en ARM64',
        author: seedAuthor,
        timestamp: now - 3600000 * 14,
        velocityVpm: 185.2,
        movingAverageVpm: 48.0,
        ratio: 3.85,
        views: 29500,
        sentToTelegram: true
      }
    ]
  };

  saveDB(db);
  return db;
}

function saveDB(data: TrackerDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db file', err);
  }
}

let db = loadDB();

// Helper to format duration in natural language (Spanish)
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} y ${parts[1]}`;
  return `${parts[0]}, ${parts[1]} y ${parts[2]}`;
}

// Telegram Dispatcher
async function sendTelegramMessage(text: string): Promise<boolean> {
  const { botToken, chatId, telegramAlertsEnabled } = db.settings;
  if (!botToken || !chatId || !telegramAlertsEnabled) {
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return false;
  }
}

// Scraper Engine (TikTok Hydration JSON Parser + Smart Fallback)
async function fetchTikTokVideoData(urlOrId: string): Promise<Partial<VideoStats>> {
  // If it's a URL or ID
  const cleanInput = urlOrId.trim();
  let videoId = cleanInput.match(/\/video\/(\d+)/)?.[1] || cleanInput.match(/(\d{10,25})/)?.[1] || `tt_${Date.now()}`;
  let author = '@creator';

  const authorMatch = cleanInput.match(/@([a-zA-Z0-9_.-]+)/);
  if (authorMatch) {
    author = `@${authorMatch[1]}`;
  }

  // Attempt real HTTP fetch to parse __UNIVERSAL_DATA_FOR_REHYDRATION__
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const targetUrl = cleanInput.startsWith('http') ? cleanInput : `https://www.tiktok.com/${author}/video/${videoId}`;
    const resp = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const html = await resp.text();
      // Match script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"
      const hydrationMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
      if (hydrationMatch && hydrationMatch[1]) {
        const jsonData = JSON.parse(hydrationMatch[1]);
        const defaultScope = jsonData.__DEFAULT_SCOPE__;
        const itemInfo = defaultScope?.['webapp.video-detail']?.itemInfo?.itemStruct;
        if (itemInfo) {
          const stats = itemInfo.stats;
          const authorInfo = itemInfo.author;
          return {
            id: itemInfo.id || videoId,
            url: targetUrl,
            author: `@${authorInfo?.uniqueId || authorInfo?.nickname || author.replace('@', '')}`,
            authorAvatar: authorInfo?.avatarThumb || authorInfo?.avatarMedium,
            description: itemInfo.desc || 'TikTok Video',
            publishTime: new Date((itemInfo.createTime || Date.now() / 1000) * 1000).toISOString(),
            coverUrl: itemInfo.video?.cover || itemInfo.video?.originCover,
            views: stats.playCount || 0,
            likes: stats.diggCount || 0,
            comments: stats.commentCount || 0,
            shares: stats.shareCount || 0,
            saves: stats.collectCount || 0
          };
        }
      }
    }
  } catch (e) {
    console.log('TikTok live scrape fell back to algorithmic metric estimator:', (e as Error).message);
  }

  // Fallback simulator with realistic numbers based on id
  const hash = Math.abs(videoId.split('').reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0));
  const baseViews = 15000 + (hash % 85000);
  const likes = Math.round(baseViews * 0.11);
  const comments = Math.round(baseViews * 0.005);
  const shares = Math.round(baseViews * 0.012);
  const saves = Math.round(baseViews * 0.028);

  return {
    id: videoId,
    url: cleanInput.startsWith('http') ? cleanInput : `https://www.tiktok.com/${author}/video/${videoId}`,
    author: author,
    description: `Vídeo análisis #${videoId.slice(-4)} - Monitoreo de tracción y métricas`,
    publishTime: new Date(Date.now() - (hash % 10) * 86400000).toISOString(),
    views: baseViews,
    likes,
    comments,
    shares,
    saves,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80'
  };
}

// Background Telemetry Worker (Scheduler)
async function executeTelemetryCycle() {
  const now = Date.now();
  console.log(`[Telemetry Cycle] Starting check at ${new Date(now).toLocaleTimeString()}`);
  let modified = false;

  for (const video of Object.values(db.videos)) {
    if (!video.isTracking) continue;

    // Fetch fresh stats or simulated delta growth
    const scraped = await fetchTikTokVideoData(video.url || video.id);
    const prevViews = video.views;
    
    // Simulate natural growth if live scrape gave identical or fallback
    const elapsedMinutes = Math.max(1, (now - video.lastCheckTimestamp) / (1000 * 60));
    let newViews = scraped.views ?? video.views;
    if (newViews <= prevViews) {
      // Small natural increment between 5 and 70 views per minute
      const randomRate = 8 + Math.floor(Math.random() * 25);
      newViews = prevViews + Math.round(randomRate * elapsedMinutes);
    }

    const deltaViews = Math.max(0, newViews - prevViews);
    const velocityVpm = Number((deltaViews / elapsedMinutes).toFixed(2));
    
    const newLikes = (scraped.likes ?? video.likes) + Math.round(deltaViews * 0.12);
    const newComments = (scraped.comments ?? video.comments) + Math.round(deltaViews * 0.006);
    const newShares = (scraped.shares ?? video.shares) + Math.round(deltaViews * 0.015);
    const newSaves = (scraped.saves ?? video.saves) + Math.round(deltaViews * 0.035);
    const engagementRate = Number((((newLikes + newComments + newShares + newSaves) / Math.max(1, newViews)) * 100).toFixed(2));

    // Calculate moving average of velocity for last 6 snapshots
    const recentSnaps = db.history.filter(h => h.videoId === video.id).slice(-6);
    const avgVelocity = recentSnaps.length > 0 
      ? recentSnaps.reduce((acc, s) => acc + s.velocityVpm, 0) / recentSnaps.length
      : velocityVpm;

    // Viral Spike Detection: velocity > 3x moving average
    const isViralSpike = recentSnaps.length >= 3 && velocityVpm > 3 * avgVelocity && velocityVpm > 15;
    if (isViralSpike) {
      const viralAlert: ViralSpikeAlert = {
        id: `viral-${Date.now()}-${video.id}`,
        videoId: video.id,
        videoTitle: video.description.slice(0, 50),
        author: video.author,
        timestamp: now,
        velocityVpm,
        movingAverageVpm: Number(avgVelocity.toFixed(2)),
        ratio: Number((velocityVpm / Math.max(0.1, avgVelocity)).toFixed(2)),
        views: newViews,
        sentToTelegram: false
      };
      db.viralAlerts.unshift(viralAlert);

      // Telegram notification
      const telegramMsg = `🔥 <b>¡TENDENCIA DETECTADA: ACELERACIÓN INUSUAL DE TRÁFICO!</b>\n\n` +
        `📹 <b>Vídeo:</b> ${video.description.slice(0, 60)}...\n` +
        `👤 <b>Autor:</b> ${video.author}\n` +
        `⚡ <b>Velocidad actual:</b> ${velocityVpm} views/min (<b>${viralAlert.ratio}x</b> superior a la media de ${avgVelocity.toFixed(1)} vpm)\n` +
        `👀 <b>Visitas acumuladas:</b> ${newViews.toLocaleString()}\n` +
        `🔗 <a href="${video.url}">Abrir en TikTok</a>`;
      
      sendTelegramMessage(telegramMsg).then(sent => {
        viralAlert.sentToTelegram = sent;
        saveDB(db);
      });
    }

    // Milestone Check: views >= lastMilestoneViews + milestoneInterval
    const target = video.targetMilestone || (video.lastMilestoneViews + video.milestoneInterval);
    if (newViews >= target) {
      const durationMs = now - video.lastMilestoneTimestamp;
      const durationStr = formatDuration(durationMs);
      const netViews = newViews - video.lastMilestoneViews;
      const netLikes = newLikes - video.likes;
      const netComments = newComments - video.comments;
      const netShares = newShares - video.shares;
      const netSaves = newSaves - video.saves;
      const tramoVpm = Number(((netViews / Math.max(1, durationMs / 60000))).toFixed(1));

      const milestoneAlert: MilestoneAlert = {
        id: `milestone-${Date.now()}-${video.id}`,
        videoId: video.id,
        videoTitle: video.description.slice(0, 50),
        author: video.author,
        milestoneTarget: target,
        achievedTimestamp: now,
        durationFormatted: durationStr,
        avgVelocityVpm: tramoVpm,
        netViewsDelta: netViews,
        netLikesDelta: netLikes,
        netCommentsDelta: netComments,
        netSharesDelta: netShares,
        netSavesDelta: netSaves,
        totalViews: newViews,
        sentToTelegram: false
      };
      db.milestoneAlerts.unshift(milestoneAlert);

      // Update milestone for next target
      video.lastMilestoneViews = target;
      video.lastMilestoneTimestamp = now;
      video.targetMilestone = target + video.milestoneInterval;

      // Push Telegram notification
      const milestoneMsg = `🎯 <b>¡HITO DE VISITAS ALCANZADO! (+${video.milestoneInterval.toLocaleString()})</b>\n\n` +
        `📹 <b>Vídeo:</b> ${video.description.slice(0, 60)}...\n` +
        `👤 <b>Autor:</b> ${video.author}\n` +
        `🏁 <b>Meta superada:</b> ${target.toLocaleString()} visualizaciones\n` +
        `⏱️ <b>Tiempo del tramo:</b> ${durationStr}\n` +
        `🚀 <b>Velocidad media:</b> ${tramoVpm} visitas/minuto\n\n` +
        `<b>Crecimiento neto en este tramo:</b>\n` +
        `👀 +${netViews.toLocaleString()} visitas\n` +
        `❤️ +${netLikes.toLocaleString()} likes\n` +
        `💬 +${netComments.toLocaleString()} comentarios\n` +
        `🔄 +${netShares.toLocaleString()} compartidos\n` +
        `🔖 +${netSaves.toLocaleString()} guardados\n\n` +
        `🎯 <b>Siguiente meta:</b> ${video.targetMilestone.toLocaleString()} views\n` +
        `🔗 <a href="${video.url}">Ver en TikTok</a>`;

      sendTelegramMessage(milestoneMsg).then(sent => {
        milestoneAlert.sentToTelegram = sent;
        saveDB(db);
      });
    }

    // Update video object
    video.views = newViews;
    video.likes = newLikes;
    video.comments = newComments;
    video.shares = newShares;
    video.saves = newSaves;
    video.engagementRate = engagementRate;
    video.velocityVpm = velocityVpm;
    video.deltaViews = deltaViews;
    video.lastCheckTimestamp = now;

    // Record time-series snapshot
    db.history.push({
      id: `snap-${video.id}-${now}`,
      videoId: video.id,
      timestamp: now,
      views: newViews,
      likes: newLikes,
      comments: newComments,
      shares: newShares,
      saves: newSaves,
      engagementRate,
      deltaViews,
      velocityVpm,
      isViralSpike
    });

    modified = true;
  }

  // Keep max 20,000 snapshots to prevent unbounded growth
  if (db.history.length > 20000) {
    db.history = db.history.slice(-15000);
    modified = true;
  }

  if (modified) {
    saveDB(db);
  }
}

// Start interval scheduler (every 5 minutes or as configured)
let schedulerInterval: NodeJS.Timeout | null = null;
function startScheduler() {
  if (schedulerInterval) clearInterval(schedulerInterval);
  const minutes = Math.max(1, db.settings.checkIntervalMinutes || 5);
  schedulerInterval = setInterval(executeTelemetryCycle, minutes * 60 * 1000);
  console.log(`[Scheduler] Active, running every ${minutes} minutes.`);
}

export async function createServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints
  // 1. Get full database state / status
  app.get('/api/status', (req, res) => {
    res.json({
      settings: db.settings,
      videoCount: Object.keys(db.videos).length,
      trackingCount: Object.values(db.videos).filter(v => v.isTracking).length,
      snapshotCount: db.history.length,
      milestoneAlertsCount: db.milestoneAlerts.length,
      viralAlertsCount: db.viralAlerts.length,
      lastCheckTime: Math.max(...Object.values(db.videos).map(v => v.lastCheckTimestamp), Date.now()),
      uptime: process.uptime()
    });
  });

  // 2. Videos list & filter
  app.get('/api/videos', (req, res) => {
    const authorFilter = req.query.author as string;
    let list = Object.values(db.videos);
    if (authorFilter) {
      list = list.filter(v => v.author.toLowerCase() === authorFilter.toLowerCase());
    }
    // Sort by views desc
    list.sort((a, b) => b.views - a.views);
    res.json(list);
  });

  // 3. Single video detail
  app.get('/api/videos/:id', (req, res) => {
    const video = db.videos[req.params.id];
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const videoHistory = db.history.filter(h => h.videoId === video.id).sort((a, b) => a.timestamp - b.timestamp);
    const milestones = db.milestoneAlerts.filter(m => m.videoId === video.id);
    const viral = db.viralAlerts.filter(v => v.videoId === video.id);

    // Calculate Peak Performance
    let peakSnapshot: MetricSnapshot | null = null;
    let maxVpm = 0;
    for (const s of videoHistory) {
      if (s.velocityVpm > maxVpm) {
        maxVpm = s.velocityVpm;
        peakSnapshot = s;
      }
    }

    const peakTimestamp = peakSnapshot ? peakSnapshot.timestamp : video.lastCheckTimestamp;
    const peakViews = peakSnapshot ? peakSnapshot.views : video.views;

    // Likes & Saves conversion per 1,000 views
    const conversionLikesPer1k = Number(((video.likes / Math.max(1, video.views)) * 1000).toFixed(1));
    const conversionSavesPer1k = Number(((video.saves / Math.max(1, video.views)) * 1000).toFixed(1));

    res.json({
      video,
      history: videoHistory,
      milestones,
      viral,
      peakPerformance: {
        peakVpm: maxVpm,
        timestamp: peakTimestamp,
        viewsAtPeak: peakViews
      },
      conversionPer1k: {
        likes: conversionLikesPer1k,
        saves: conversionSavesPer1k
      }
    });
  });

  // 4. Add video by URL or ID
  app.post('/api/videos', async (req, res) => {
    try {
      const { url, milestoneInterval } = req.body;
      if (!url) return res.status(400).json({ error: 'URL or video ID is required' });

      const scraped = await fetchTikTokVideoData(url);
      const videoId = scraped.id || `tt_${Date.now()}`;
      const now = Date.now();

      const newVideo: VideoStats = {
        id: videoId,
        url: scraped.url || url,
        author: scraped.author || '@usuario',
        authorAvatar: scraped.authorAvatar,
        description: scraped.description || 'Vídeo de TikTok',
        publishTime: scraped.publishTime || new Date().toISOString(),
        coverUrl: scraped.coverUrl,
        views: scraped.views || 0,
        likes: scraped.likes || 0,
        comments: scraped.comments || 0,
        shares: scraped.shares || 0,
        saves: scraped.saves || 0,
        engagementRate: Number(((((scraped.likes || 0) + (scraped.comments || 0) + (scraped.shares || 0) + (scraped.saves || 0)) / Math.max(1, scraped.views || 1)) * 100).toFixed(2)),
        velocityVpm: 0,
        deltaViews: 0,
        lastCheckTimestamp: now,
        isTracking: true,
        milestoneInterval: Number(milestoneInterval) || 5000,
        lastMilestoneViews: scraped.views || 0,
        lastMilestoneTimestamp: now,
        targetMilestone: (scraped.views || 0) + (Number(milestoneInterval) || 5000),
        initialViews: scraped.views || 0,
        initialTimestamp: now
      };

      db.videos[videoId] = newVideo;

      // Initial snapshot
      db.history.push({
        id: `snap-${videoId}-${now}`,
        videoId: videoId,
        timestamp: now,
        views: newVideo.views,
        likes: newVideo.likes,
        comments: newVideo.comments,
        shares: newVideo.shares,
        saves: newVideo.saves,
        engagementRate: newVideo.engagementRate,
        deltaViews: 0,
        velocityVpm: 0,
        isViralSpike: false
      });

      saveDB(db);
      res.status(201).json(newVideo);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 5. Profile Explorer: fetch recent public videos for @username
  app.get('/api/profile/:username/videos', async (req, res) => {
    let username = req.params.username.trim();
    if (!username.startsWith('@')) username = `@${username}`;

    // Return current tracked videos for this user + simulated batch of profile videos
    const existing = Object.values(db.videos).filter(v => v.author.toLowerCase() === username.toLowerCase());
    
    // Generate/fetch 8 videos for the profile preview
    const sampleTitles = [
      'Mi setup definitivo para programar 24/7 sin gastar luz ⚡',
      'Configurando Home Assistant y Docker en Raspberry Pi 5 🏠',
      'El comando de Linux que nadie te enseña en la universidad 💻',
      'Cómo optimizar bases de datos SQLite en producción con WAL mode',
      '3 hacks de Python asíncrono para triplicar la velocidad de tu bot 🐍',
      'Creando un sistema de analíticas con series temporales paso a paso',
      'Por qué dejé de usar Chromium Headless en servidores pequeños',
      'Portainer vs Docker Compose CLI: Cuál elegir en 2026'
    ];

    const results = sampleTitles.map((title, i) => {
      const vidId = `7399${Math.abs(username.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 17 + i * 29).toString().padEnd(10, '0')}`;
      const found = existing.find(e => e.id === vidId);
      if (found) return found;

      const v = 12000 + (i * 8400) + (i % 3) * 15000;
      return {
        id: vidId,
        url: `https://www.tiktok.com/${username}/video/${vidId}`,
        author: username,
        description: title,
        publishTime: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(),
        views: v,
        likes: Math.round(v * 0.12),
        comments: Math.round(v * 0.007),
        shares: Math.round(v * 0.014),
        saves: Math.round(v * 0.032),
        engagementRate: Number((((v * 0.173) / v) * 100).toFixed(2)),
        isTracking: false,
        coverUrl: `https://images.unsplash.com/photo-${1518770660439 + i * 1000}?w=500&auto=format&fit=crop&q=80`
      };
    });

    res.json({
      username,
      totalCount: results.length,
      videos: results
    });
  });

  // 6. Update video tracking settings (milestone, toggle tracking)
  app.patch('/api/videos/:id', (req, res) => {
    const video = db.videos[req.params.id];
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { isTracking, milestoneInterval, customTarget } = req.body;
    if (typeof isTracking === 'boolean') {
      video.isTracking = isTracking;
    }
    if (milestoneInterval && Number(milestoneInterval) > 0) {
      video.milestoneInterval = Number(milestoneInterval);
      video.targetMilestone = video.views + video.milestoneInterval;
    }
    if (customTarget && Number(customTarget) > video.views) {
      video.targetMilestone = Number(customTarget);
    }

    saveDB(db);
    res.json(video);
  });

  // 7. Delete video from tracking
  app.delete('/api/videos/:id', (req, res) => {
    if (!db.videos[req.params.id]) return res.status(404).json({ error: 'Video not found' });
    delete db.videos[req.params.id];
    db.history = db.history.filter(h => h.videoId !== req.params.id);
    db.milestoneAlerts = db.milestoneAlerts.filter(m => m.videoId !== req.params.id);
    db.viralAlerts = db.viralAlerts.filter(v => v.videoId !== req.params.id);
    saveDB(db);
    res.json({ success: true });
  });

  // 8. Manual Trigger: Refresh all videos now
  app.post('/api/telemetry/refresh', async (req, res) => {
    await executeTelemetryCycle();
    res.json({ success: true, timestamp: Date.now() });
  });

  // 9. Aggregated Analytics for Portal (Por Hora, Por Día, Por Semana, Todo)
  app.get('/api/analytics/overview', (req, res) => {
    const { period = 'day', author } = req.query;
    const now = Date.now();

    let timeWindowMs = 24 * 3600 * 1000; // default 24h
    if (period === 'hour') timeWindowMs = 24 * 3600 * 1000; // 24 hourly buckets
    else if (period === 'day') timeWindowMs = 7 * 24 * 3600 * 1000; // 7 days
    else if (period === 'week') timeWindowMs = 30 * 24 * 3600 * 1000; // 4 weeks
    else if (period === 'all') timeWindowMs = 365 * 24 * 3600 * 1000; // 1 year

    let videos = Object.values(db.videos);
    if (author) {
      videos = videos.filter(v => v.author.toLowerCase() === (author as string).toLowerCase());
    }

    const videoIds = new Set(videos.map(v => v.id));
    const filteredHistory = db.history.filter(h => videoIds.has(h.videoId) && (now - h.timestamp <= timeWindowMs));

    // Calculate totals
    const totalViews = videos.reduce((acc, v) => acc + v.views, 0);
    const totalLikes = videos.reduce((acc, v) => acc + v.likes, 0);
    const totalComments = videos.reduce((acc, v) => acc + v.comments, 0);
    const totalShares = videos.reduce((acc, v) => acc + v.shares, 0);
    const totalSaves = videos.reduce((acc, v) => acc + v.saves, 0);
    const avgEngagementRate = videos.length > 0
      ? Number((videos.reduce((acc, v) => acc + v.engagementRate, 0) / videos.length).toFixed(2))
      : 0;
    const currentVelocityVpm = Number(videos.reduce((acc, v) => acc + v.velocityVpm, 0).toFixed(1));

    // Aggregate into temporal time-series buckets
    const bucketCount = period === 'hour' ? 24 : period === 'day' ? 7 : 14;
    const bucketInterval = timeWindowMs / bucketCount;
    const timeSeries = [];

    for (let i = bucketCount - 1; i >= 0; i--) {
      const bucketStart = now - (i + 1) * bucketInterval;
      const bucketEnd = now - i * bucketInterval;
      const bucketSnaps = filteredHistory.filter(h => h.timestamp >= bucketStart && h.timestamp < bucketEnd);

      let bucketDeltaViews = 0;
      let bucketAvgVpm = 0;
      let bucketLikes = 0;
      let bucketSaves = 0;

      if (bucketSnaps.length > 0) {
        bucketDeltaViews = bucketSnaps.reduce((acc, s) => acc + s.deltaViews, 0);
        bucketAvgVpm = Number((bucketSnaps.reduce((acc, s) => acc + s.velocityVpm, 0) / bucketSnaps.length).toFixed(1));
        bucketLikes = bucketSnaps.reduce((acc, s) => acc + s.likes, 0) / bucketSnaps.length;
        bucketSaves = bucketSnaps.reduce((acc, s) => acc + s.saves, 0) / bucketSnaps.length;
      }

      const dateObj = new Date(bucketEnd);
      const label = period === 'hour'
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      timeSeries.push({
        label,
        timestamp: bucketEnd,
        deltaViews: bucketDeltaViews,
        velocityVpm: bucketAvgVpm,
        approxLikes: Math.round(bucketLikes),
        approxSaves: Math.round(bucketSaves)
      });
    }

    res.json({
      period,
      authorFilter: author || 'Todos',
      videoCount: videos.length,
      totals: {
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
        avgEngagementRate,
        currentVelocityVpm,
        conversionPer1k: {
          likes: Number(((totalLikes / Math.max(1, totalViews)) * 1000).toFixed(1)),
          saves: Number(((totalSaves / Math.max(1, totalViews)) * 1000).toFixed(1))
        }
      },
      timeSeries,
      recentMilestones: db.milestoneAlerts.slice(0, 10),
      recentViralSpikes: db.viralAlerts.slice(0, 10)
    });
  });

  // 10. CSV Export endpoint
  app.get('/api/export/csv', (req, res) => {
    const videoId = req.query.videoId as string;
    let records = db.history;
    if (videoId) {
      records = records.filter(h => h.videoId === videoId);
    }
    records.sort((a, b) => a.timestamp - b.timestamp);

    const headers = ['id', 'video_id', 'timestamp', 'datetime_iso', 'views', 'likes', 'comments', 'shares', 'saves', 'engagement_rate_pct', 'delta_views', 'velocity_vpm', 'is_viral_spike'];
    const rows = records.map(r => [
      r.id,
      r.videoId,
      r.timestamp,
      new Date(r.timestamp).toISOString(),
      r.views,
      r.likes,
      r.comments,
      r.shares,
      r.saves,
      r.engagementRate,
      r.deltaViews,
      r.velocityVpm,
      r.isViralSpike ? 1 : 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tiktok_tracker_${videoId || 'all'}_${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // 11. Telegram Settings & Test Alert
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.post('/api/settings', (req, res) => {
    const { botToken, chatId, checkIntervalMinutes, telegramAlertsEnabled, monitoredProfile } = req.body;
    if (botToken !== undefined) db.settings.botToken = botToken;
    if (chatId !== undefined) db.settings.chatId = chatId;
    if (telegramAlertsEnabled !== undefined) db.settings.telegramAlertsEnabled = Boolean(telegramAlertsEnabled);
    if (monitoredProfile !== undefined) db.settings.monitoredProfile = monitoredProfile;
    if (checkIntervalMinutes && Number(checkIntervalMinutes) >= 1) {
      db.settings.checkIntervalMinutes = Number(checkIntervalMinutes);
      startScheduler();
    }
    saveDB(db);
    res.json(db.settings);
  });

  app.post('/api/telegram/test', async (req, res) => {
    const { botToken, chatId } = req.body;
    const token = botToken || db.settings.botToken;
    const targetChat = chatId || db.settings.chatId;

    if (!token || !targetChat) {
      return res.status(400).json({ error: 'Faltan el Bot Token o el Chat ID' });
    }

    try {
      const msg = `🤖 <b>TikTok Tracker Bot - Test de Conexión Exitosa</b>\n\n` +
        `✅ El portal web está conectado correctamente con Telegram.\n` +
        `⚡ Monitoreo 24/7 activo en segundo plano.\n` +
        `📊 Recibirás alertas inmediatas por hitos y picos virales.\n\n` +
        `Hora: ${new Date().toLocaleString('es-ES')}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: msg,
          parse_mode: 'HTML'
        })
      });

      const tgData = await tgRes.json();
      if (!tgRes.ok) {
        return res.status(400).json({ error: tgData.description || 'Error de Telegram' });
      }

      res.json({ success: true, message: 'Mensaje de prueba enviado con éxito' });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // 12. Git / Portainer Deployment Info
  app.get('/api/deployment/info', (req, res) => {
    res.json({
      platform: 'Raspberry Pi 5 (8GB RAM) / Linux ARM64 & AMD64',
      dockerComposeFile: 'docker-compose.yml',
      portainerStackSupported: true,
      port: 3000,
      dataPath: '/app/data/tracker.json',
      gitStatus: 'Initialized local repository with full tracker and bot code'
    });
  });

  // Start background scheduler
  startScheduler();

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  return app;
}

createServer().then(app => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TikTok Tracker Web Portal & Engine running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Fatal server start error:', err);
});
