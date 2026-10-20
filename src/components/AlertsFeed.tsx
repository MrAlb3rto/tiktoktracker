import React from 'react';
import { MilestoneAlert, ViralSpikeAlert } from '../types';
import { BellRing, Flame, Clock, CheckCircle2, Zap } from 'lucide-react';

interface AlertsFeedProps {
  milestones: MilestoneAlert[];
  viralSpikes: ViralSpikeAlert[];
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({ milestones, viralSpikes }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Milestones Column */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <BellRing className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Hitos Alcanzados Recientes</h3>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
            {milestones.length} superados
          </span>
        </div>

        {milestones.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No hay hitos alcanzados todavía en este periodo.</p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {milestones.map(m => (
              <div
                key={m.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">
                    🎯 Meta {m.milestoneTarget.toLocaleString()} views
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(m.achievedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 font-medium truncate">{m.videoTitle}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>⏱️ <strong>{m.durationFormatted}</strong></span>
                  <span>🚀 <strong>{m.avgVelocityVpm} vpm</strong></span>
                  <span className="text-emerald-400">+{m.netViewsDelta.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viral Spikes Column */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide">Picos Virales Detectados</h3>
          </div>
          <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20 font-semibold">
            &gt;3x Aceleración
          </span>
        </div>

        {viralSpikes.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No se han detectado picos inusuales recientemente.</p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {viralSpikes.map(v => (
              <div
                key={v.id}
                className="bg-slate-950/70 border border-orange-500/30 rounded-xl p-3 text-xs space-y-1.5 hover:border-orange-500/50 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Aceleración {v.ratio}x sobre la media</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 font-medium truncate">{v.videoTitle}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Velocidad: <strong className="text-white">{v.velocityVpm} vpm</strong> (Media: {v.movingAverageVpm} vpm)</span>
                  <span className="text-cyan-400 font-semibold">{v.views.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
