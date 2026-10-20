import React, { useEffect, useState } from 'react';
import { VideoStats, MetricSnapshot, MilestoneAlert, ViralSpikeAlert } from '../types';
import { TimeSeriesChart } from './TimeSeriesChart';
import { X, ExternalLink, Download, BellRing, Flame, Zap, Clock, Award, ShieldCheck, Heart, MessageCircle, Share2, Bookmark, Eye, ArrowUpRight } from 'lucide-react';

interface VideoDetailModalProps {
  video: VideoStats | null;
  onClose: () => void;
  onUpdateMilestone: (videoId: string, interval: number, customTarget?: number) => void;
}

interface DetailData {
  video: VideoStats;
  history: MetricSnapshot[];
  milestones: MilestoneAlert[];
  viral: ViralSpikeAlert[];
  peakPerformance: {
    peakVpm: number;
    timestamp: number;
    viewsAtPeak: number;
  };
  conversionPer1k: {
    likes: number;
    saves: number;
  };
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({
  video,
  onClose,
  onUpdateMilestone
}) => {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState<number>(video?.milestoneInterval || 5000);
  const [customMilestone, setCustomMilestone] = useState<string>('');

  useEffect(() => {
    if (!video) return;
    setLoading(true);
    fetch(`/api/videos/${video.id}`)
      .then(res => res.json())
      .then(data => {
        setDetail(data);
        setSelectedInterval(data.video.milestoneInterval || 5000);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [video]);

  if (!video) return null;

  const handleSaveMilestone = () => {
    const custom = customMilestone ? parseInt(customMilestone, 10) : undefined;
    onUpdateMilestone(video.id, selectedInterval, custom);
    if (detail) {
      setDetail({
        ...detail,
        video: {
          ...detail.video,
          milestoneInterval: selectedInterval,
          targetMilestone: custom || (detail.video.views + selectedInterval)
        }
      });
    }
  };

  // Prepare chart data from history
  const chartData = (detail?.history || []).map(h => ({
    label: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: h.timestamp,
    deltaViews: h.deltaViews,
    velocityVpm: h.velocityVpm,
    approxLikes: h.likes,
    approxSaves: h.saves
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#fe2c55]/20 to-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Telemetría y Rendimiento</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {video.id}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Análisis detallado de tracción, picos de aceleración e hitos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/export/csv?videoId=${video.id}`}
              download
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Video Header Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start">
            <div className="w-full md:w-44 h-32 rounded-xl bg-slate-900 overflow-hidden relative flex-shrink-0">
              {video.coverUrl ? (
                <img src={video.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800" />
              )}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center text-white opacity-90 transition-opacity"
              >
                <span className="bg-black/60 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
                  Ver Vídeo <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            </div>

            <div className="flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-cyan-400">{video.author}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Publicado: {new Date(video.publishTime).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">{video.description}</p>

              {/* Engagement formula callout */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400">Engagement:</span>
                  <strong className="text-purple-300 font-bold">{video.engagementRate}%</strong>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#fe2c55]" />
                  <span className="text-slate-400">Velocidad actual:</span>
                  <strong className="text-[#fe2c55] font-bold">{video.velocityVpm} vpm</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Overview 6-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Visualizaciones</span>
              <span className="text-base font-extrabold text-white">{video.views.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Likes</span>
              <span className="text-base font-extrabold text-pink-400">{video.likes.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Comentarios</span>
              <span className="text-base font-extrabold text-blue-400">{video.comments.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Compartidos</span>
              <span className="text-base font-extrabold text-emerald-400">{video.shares.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Guardados</span>
              <span className="text-base font-extrabold text-amber-400">{video.saves.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Delta ($\Delta$)</span>
              <span className="text-base font-extrabold text-cyan-400">+{video.deltaViews.toLocaleString()}</span>
            </div>
          </div>

          {/* Peak Traction & Interactivity Metrics */}
          {detail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peak Performance Box */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Pico de Tracción Histórico (Peak Performance)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {detail.peakPerformance.peakVpm}
                  </span>
                  <span className="text-xs font-semibold text-amber-300">visitas / minuto</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Alcanzado el {new Date(detail.peakPerformance.timestamp).toLocaleString()} cuando el vídeo sumaba {detail.peakPerformance.viewsAtPeak.toLocaleString()} visualizaciones.
                </p>
              </div>

              {/* Conversion Ratios Box */}
              <div className="bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Tasa de Conversión de Interacciones</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Likes por 1k views:</span>
                    <span className="text-lg font-extrabold text-pink-400">
                      {detail.conversionPer1k.likes} ❤️
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Guardados por 1k views:</span>
                    <span className="text-lg font-extrabold text-amber-400">
                      {detail.conversionPer1k.saves} 🔖
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Mide el ratio de valor percibido y guardado de este contenido específico.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Time Series Chart for this video */}
          <div>
            <TimeSeriesChart
              data={chartData}
              title={`Evolución Temporal del Vídeo`}
              subtitle={`Historial cronológico de reproducciones y aceleración (vpm)`}
              periodLabel="Historial completo"
              height={260}
            />
          </div>

          {/* Milestone Settings Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Configuración del Hito de Visitas</h4>
              </div>
              <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Próxima Meta: {video.targetMilestone.toLocaleString()} views
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Cada vez que el vídeo sume el intervalo establecido, el bot enviará una alerta push con el tiempo del tramo y métricas netas.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {[1000, 5000, 10000, 50000, 100000].map(val => (
                <button
                  key={val}
                  onClick={() => setSelectedInterval(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedInterval === val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                placeholder="Meta numérica personalizada (ej. 150000)"
                value={customMilestone}
                onChange={e => setCustomMilestone(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveMilestone}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Guardar Hito
              </button>
            </div>
          </div>

          {/* Milestones History Table */}
          {detail && detail.milestones.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hitos Superados ({detail.milestones.length})
              </h4>
              <div className="space-y-2">
                {detail.milestones.map(m => (
                  <div
                    key={m.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="text-amber-400">🎯 Meta {m.milestoneTarget.toLocaleString()}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300">Duración: {m.durationFormatted}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                        <span>Velocidad tramo: <strong>{m.avgVelocityVpm} vpm</strong></span>
                        <span>Neto: <strong>+{m.netViewsDelta.toLocaleString()} views</strong></span>
                        <span>❤️ +{m.netLikesDelta.toLocaleString()}</span>
                        <span>🔖 +{m.netSavesDelta.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(m.achievedTimestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
