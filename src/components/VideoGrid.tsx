import React, { useState } from 'react';
import { VideoStats } from '../types';
import { Eye, Heart, MessageCircle, Share2, Bookmark, Zap, Flame, ExternalLink, BarChart3, BellRing, Download, Pause, Play, Trash2, Search, LayoutGrid, List } from 'lucide-react';

interface VideoGridProps {
  videos: VideoStats[];
  onSelectVideo: (video: VideoStats) => void;
  onOpenMilestone: (video: VideoStats) => void;
  onToggleTracking: (video: VideoStats) => void;
  onDeleteVideo: (video: VideoStats) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onSelectVideo,
  onOpenMilestone,
  onToggleTracking,
  onDeleteVideo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterTracking, setFilterTracking] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'views' | 'velocity' | 'engagement' | 'date'>('views');

  // Filter & Sort
  const filtered = videos.filter(v => {
    const matchesSearch = v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.includes(searchTerm);
    if (!matchesSearch) return false;

    if (filterTracking === 'active') return v.isTracking;
    if (filterTracking === 'paused') return !v.isTracking;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'velocity') return b.velocityVpm - a.velocityVpm;
    if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
    if (sortBy === 'date') return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descripción, autor o ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Filter and Sort Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex rounded-xl bg-slate-950/70 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterTracking('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTracking === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({videos.length})
            </button>
            <button
              onClick={() => setFilterTracking('active')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTracking === 'active' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos ({videos.filter(v => v.isTracking).length})
            </button>
            <button
              onClick={() => setFilterTracking('paused')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterTracking === 'paused' ? 'bg-slate-800 text-slate-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pausados ({videos.filter(v => !v.isTracking).length})
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="views">Ordenar por Visitas</option>
            <option value="velocity">Ordenar por Velocidad (vpm)</option>
            <option value="engagement">Ordenar por Engagement Rate</option>
            <option value="date">Ordenar por Fecha</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-slate-950/70 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">No se encontraron vídeos que coincidan con la búsqueda o filtro.</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(video => {
            const milestoneProgress = Math.min(
              100,
              Math.max(0, ((video.views - video.lastMilestoneViews) / Math.max(1, video.milestoneInterval)) * 100)
            );
            const isSpike = video.velocityVpm > 30;

            return (
              <div
                key={video.id}
                className={`bg-slate-900/70 border rounded-2xl overflow-hidden shadow-lg transition-all hover:shadow-cyan-500/5 hover:-translate-y-0.5 flex flex-col justify-between ${
                  video.isTracking ? 'border-slate-800/80 hover:border-slate-700' : 'border-slate-800/40 opacity-75'
                }`}
              >
                <div>
                  {/* Card Header with Cover & Author */}
                  <div className="relative h-36 bg-slate-950 overflow-hidden group">
                    {video.coverUrl ? (
                      <img
                        src={video.coverUrl}
                        alt="TikTok Cover"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md ${
                          video.isTracking
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {video.isTracking ? '● Trackeando 24/7' : '○ Pausado'}
                      </span>
                      {isSpike && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1 backdrop-blur-md animate-pulse">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>Pico Viral</span>
                        </span>
                      )}
                    </div>

                    {/* External Link */}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                      title="Abrir en TikTok"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Author & Velocity on Cover Bottom */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-300 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {video.author}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        <Zap className="w-3 h-3 text-[#fe2c55]" />
                        <span>{video.velocityVpm} vpm</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3.5">
                    {/* Description */}
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>

                    {/* Primary metrics pill grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Visitas</span>
                        <span className="text-sm font-extrabold text-white">{video.views.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Likes</span>
                        <span className="text-sm font-extrabold text-pink-400">{video.likes.toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800/80 p-2 rounded-xl">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">Engagement</span>
                        <span className="text-sm font-extrabold text-purple-400">{video.engagementRate}%</span>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-slate-500" />
                        <span>{video.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-slate-500" />
                        <span>{video.shares.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-slate-500" />
                        <span>{video.saves.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <BellRing className="w-3 h-3 text-amber-400" />
                          <span>Próximo Hito</span>
                        </span>
                        <span className="font-semibold text-amber-400">
                          {video.targetMilestone.toLocaleString()} views
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-[#fe2c55] h-full rounded-full transition-all duration-500"
                          style={{ width: `${milestoneProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Base: {video.lastMilestoneViews.toLocaleString()}</span>
                        <span>Faltan: {Math.max(0, video.targetMilestone - video.views).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => onSelectVideo(video)}
                    className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Analíticas</span>
                  </button>
                  <button
                    onClick={() => onOpenMilestone(video)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 transition-colors"
                    title="Configurar Hito"
                  >
                    <BellRing className="w-4 h-4" />
                  </button>
                  <a
                    href={`/api/export/csv?videoId=${video.id}`}
                    download
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Descargar CSV de telemetría"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onToggleTracking(video)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      video.isTracking
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    }`}
                    title={video.isTracking ? 'Pausar Monitoreo' : 'Reanudar Monitoreo'}
                  >
                    {video.isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => onDeleteVideo(video)}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Eliminar vídeo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vídeo</th>
                  <th className="py-3 px-4">Visitas</th>
                  <th className="py-3 px-4">Likes</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4">Velocidad</th>
                  <th className="py-3 px-4">Próximo Hito</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(video => (
                  <tr key={video.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden flex-shrink-0">
                          {video.coverUrl ? (
                            <img src={video.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-800" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white truncate max-w-[200px]">{video.description}</p>
                          <span className="text-[10px] text-cyan-400">{video.author}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{video.views.toLocaleString()}</td>
                    <td className="py-3 px-4 text-pink-400">{video.likes.toLocaleString()}</td>
                    <td className="py-3 px-4 text-purple-400 font-semibold">{video.engagementRate}%</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-slate-200">
                        <Zap className="w-3 h-3 text-[#fe2c55]" />
                        {video.velocityVpm} vpm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-semibold">{video.targetMilestone.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          video.isTracking ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {video.isTracking ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectVideo(video)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300"
                          title="Ver analíticas"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenMilestone(video)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300"
                          title="Configurar Hito"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/api/export/csv?videoId=${video.id}`}
                          download
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
