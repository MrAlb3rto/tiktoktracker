import React, { useEffect, useState, useCallback } from 'react';
import { VideoStats, AnalyticsOverview, TelegramSettings } from './types';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { VideoGrid } from './components/VideoGrid';
import { AlertsFeed } from './components/AlertsFeed';
import { VideoDetailModal } from './components/VideoDetailModal';
import { AddVideoModal } from './components/AddVideoModal';
import { MilestoneConfigModal } from './components/MilestoneConfigModal';
import { TelegramSettingsModal } from './components/TelegramSettingsModal';
import { PortainerGitModal } from './components/PortainerGitModal';
import { Clock, Calendar, CalendarDays, Globe, Flame, BellRing, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoStats[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [settings, setSettings] = useState<TelegramSettings>({
    botToken: '',
    chatId: '',
    checkIntervalMinutes: 5,
    telegramAlertsEnabled: false,
    monitoredProfile: '@albertocastells'
  });
  
  // Temporal period filter: 'hour' | 'day' | 'week' | 'all'
  const [period, setPeriod] = useState<'hour' | 'day' | 'week' | 'all'>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlertsView, setShowAlertsView] = useState(false);

  // Modals state
  const [selectedVideo, setSelectedVideo] = useState<VideoStats | null>(null);
  const [milestoneVideo, setMilestoneVideo] = useState<VideoStats | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showPortainerModal, setShowPortainerModal] = useState(false);

  // Fetch Videos
  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  }, []);

  // Fetch Analytics Overview for selected period
  const fetchOverview = useCallback(async (selectedPeriod = period) => {
    try {
      const res = await fetch(`/api/analytics/overview?period=${selectedPeriod}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
    }
  }, [period]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchOverview(period);
    fetchSettings();

    // Auto-refresh data every 20 seconds
    const interval = setInterval(() => {
      fetchVideos();
      fetchOverview(period);
    }, 20000);

    return () => clearInterval(interval);
  }, [period, fetchVideos, fetchOverview, fetchSettings]);

  // Handle manual full telemetry scan
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/telemetry/refresh', { method: 'POST' });
      await fetchVideos();
      await fetchOverview(period);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Toggle Video Tracking
  const handleToggleTracking = async (video: VideoStats) => {
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTracking: !video.isTracking })
      });
      if (res.ok) {
        fetchVideos();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Video
  const handleDeleteVideo = async (video: VideoStats) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el seguimiento del vídeo de ${video.author}?`)) return;
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVideos();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Milestone
  const handleSaveMilestone = async (videoId: string, interval: number, customTarget?: number) => {
    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneInterval: interval,
          customTarget
        })
      });
      if (res.ok) {
        fetchVideos();
        fetchOverview();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: TelegramSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(newSettings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalAlerts = (overview?.recentMilestones?.length || 0) + (overview?.recentViralSpikes?.length || 0);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-[#fe2c55]/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onRefreshAll={handleRefreshAll}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenTelegramModal={() => setShowTelegramModal(true)}
        onOpenPortainerModal={() => setShowPortainerModal(true)}
        onToggleAlertsView={() => setShowAlertsView(!showAlertsView)}
        showAlertsView={showAlertsView}
        isRefreshing={isRefreshing}
        unseenAlertsCount={totalAlerts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Creator Identity & Aggregate Stats */}
        <StatsCards overview={overview} authorName={settings.monitoredProfile || '@albertocastells'} />

        {/* Temporal Breakdown Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 px-4 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Estadísticas por Periodo:</span>
            </span>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setPeriod('hour')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                period === 'hour'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Por Hora (24h)</span>
            </button>

            <button
              onClick={() => setPeriod('day')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                period === 'day'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Por Día (7 días)</span>
            </button>

            <button
              onClick={() => setPeriod('week')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                period === 'week'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Por Semana (30d)</span>
            </button>

            <button
              onClick={() => setPeriod('all')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                period === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Histórico Total</span>
            </button>
          </div>
        </div>

        {/* Global Aggregate Time-Series Chart */}
        {overview && overview.timeSeries && (
          <TimeSeriesChart
            data={overview.timeSeries}
            title={`Tracción Temporal Global - ${period === 'hour' ? 'Últimas 24 Horas' : period === 'day' ? 'Últimos 7 Días' : period === 'week' ? 'Últimas 4 Semanas' : 'Histórico Total'}`}
            subtitle={`Visualizaciones netas sumadas por tramo y velocidad instantánea media en visitas/minuto`}
            periodLabel={period === 'hour' ? 'Por Horas' : period === 'day' ? 'Por Días' : period === 'week' ? 'Por Semanas' : 'Global'}
            height={260}
          />
        )}

        {/* Optional Collapsible Alerts Feed */}
        {showAlertsView && overview && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertsFeed
              milestones={overview.recentMilestones || []}
              viralSpikes={overview.recentViralSpikes || []}
            />
          </div>
        )}

        {/* Tracked Videos Portal & List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Portal de Vídeos Monitorizados</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {videos.length} vídeos
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Monitoreo activo 24/7 con cálculo automático de engagement, delta e hitos
              </p>
            </div>
          </div>

          <VideoGrid
            videos={videos}
            onSelectVideo={vid => setSelectedVideo(vid)}
            onOpenMilestone={vid => setMilestoneVideo(vid)}
            onToggleTracking={handleToggleTracking}
            onDeleteVideo={handleDeleteVideo}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>TikTok Video Tracker & Telegram Bot • Despliegue en Portainer (Raspberry Pi 5 ARM64)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPortainerModal(true)}
              className="hover:text-purple-300 transition-colors"
            >
              Comandos Git y Stack Portainer
            </button>
            <span>•</span>
            <button
              onClick={() => setShowTelegramModal(true)}
              className="hover:text-blue-300 transition-colors"
            >
              Configurar Bot Telegram
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onUpdateMilestone={handleSaveMilestone}
        />
      )}

      {milestoneVideo && (
        <MilestoneConfigModal
          video={milestoneVideo}
          onClose={() => setMilestoneVideo(null)}
          onSave={handleSaveMilestone}
        />
      )}

      {showAddModal && (
        <AddVideoModal
          onClose={() => setShowAddModal(false)}
          onVideoAdded={() => {
            fetchVideos();
            fetchOverview();
          }}
        />
      )}

      {showTelegramModal && (
        <TelegramSettingsModal
          settings={settings}
          onClose={() => setShowTelegramModal(false)}
          onSave={handleSaveSettings}
        />
      )}

      {showPortainerModal && (
        <PortainerGitModal onClose={() => setShowPortainerModal(false)} />
      )}
    </div>
  );
}
