import React from 'react';
import { Eye, Heart, MessageCircle, Share2, Bookmark, Flame, Zap, Award } from 'lucide-react';
import { AnalyticsOverview } from '../types';

interface StatsCardsProps {
  overview: AnalyticsOverview | null;
  authorName: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ overview, authorName }) => {
  if (!overview) return null;

  const { totals, videoCount, recentViralSpikes, recentMilestones } = overview;

  return (
    <div className="space-y-4">
      {/* Top Banner with Creator Identity */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fe2c55] via-purple-600 to-[#00f2fe] p-0.5 shadow-[0_0_15px_rgba(254,44,85,0.3)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-white text-lg">
              {authorName.replace('@', '').slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{authorName}</h2>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Perfil Activo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoreo 24/7 de <span className="text-white font-medium">{videoCount} vídeos</span> con registro de telemetría y alertas automáticas
            </p>
          </div>
        </div>

        {/* Global Conversion Ratios Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Conversión Likes / 1k</span>
            <span className="text-pink-400 font-bold text-sm">
              {totals.conversionPer1k?.likes || 0} ❤️ / 1,000 views
            </span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Conversión Guardados / 1k</span>
            <span className="text-amber-400 font-bold text-sm">
              {totals.conversionPer1k?.saves || 0} 🔖 / 1,000 views
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Views */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Visualizaciones</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totals.views.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400/90 mt-1 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3 text-[#00f2fe]" />
            <span>{totals.currentVelocityVpm} vpm globales</span>
          </div>
        </div>

        {/* Likes */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-pink-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Me Gusta</span>
            <Heart className="w-4 h-4 text-[#fe2c55]" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totals.likes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {((totals.likes / Math.max(1, totals.views)) * 100).toFixed(1)}% ratio
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Engagement</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totals.avgEngagementRate}%
          </div>
          <div className="text-[11px] text-purple-300/80 mt-1 font-medium">
            Media ponderada
          </div>
        </div>

        {/* Guardados / Saves */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Guardados</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totals.saves.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Alta retención
          </div>
        </div>

        {/* Compartidos / Shares */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Compartidos</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {totals.shares.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            Viralidad externa
          </div>
        </div>

        {/* Viral Spikes */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-orange-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase">Picos Virales</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-extrabold text-orange-400 tracking-tight">
            {recentViralSpikes.length}
          </div>
          <div className="text-[11px] text-orange-300/70 mt-1 font-medium">
            Aceleración &gt;3x
          </div>
        </div>
      </div>
    </div>
  );
};
