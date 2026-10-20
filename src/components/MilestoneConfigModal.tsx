import React, { useState } from 'react';
import { VideoStats } from '../types';
import { X, BellRing, Target, Check } from 'lucide-react';

interface MilestoneConfigModalProps {
  video: VideoStats | null;
  onClose: () => void;
  onSave: (videoId: string, interval: number, customTarget?: number) => void;
}

export const MilestoneConfigModal: React.FC<MilestoneConfigModalProps> = ({ video, onClose, onSave }) => {
  if (!video) return null;

  const [interval, setInterval] = useState(video.milestoneInterval || 5000);
  const [customTarget, setCustomTarget] = useState(video.targetMilestone.toString());

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const custom = customTarget ? parseInt(customTarget, 10) : undefined;
    onSave(video.id, interval, custom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Configurar Alerta por Hito</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{video.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Visitas Actuales:</span>
              <strong className="text-white font-extrabold">{video.views.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Última Base Registrada:</span>
              <span className="text-slate-300">{video.lastMilestoneViews.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Intervalo de Hito Rápido:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000, 25000, 50000, 100000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => {
                    setInterval(val);
                    setCustomTarget((video.views + val).toString());
                  }}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                    interval === val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Próxima Meta Exacta de Reproducciones:</span>
            </label>
            <input
              type="number"
              value={customTarget}
              onChange={e => setCustomTarget(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Cuando el vídeo alcance esta cifra, se disparará una alerta push con el tiempo del tramo y métricas netas.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Meta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
