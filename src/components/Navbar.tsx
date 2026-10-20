import React from 'react';
import { Activity, Plus, RefreshCw, Bot, GitBranch, Bell, Shield, Radio } from 'lucide-react';

interface NavbarProps {
  onRefreshAll: () => void;
  onOpenAddModal: () => void;
  onOpenTelegramModal: () => void;
  onOpenPortainerModal: () => void;
  onToggleAlertsView: () => void;
  showAlertsView: boolean;
  isRefreshing: boolean;
  unseenAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefreshAll,
  onOpenAddModal,
  onOpenTelegramModal,
  onOpenPortainerModal,
  onToggleAlertsView,
  showAlertsView,
  isRefreshing,
  unseenAlertsCount
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fe2c55] via-purple-600 to-[#00f2fe] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(254,44,85,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>TikTok Tracker</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  24/7
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Raspberry Pi 5 ARM64 Ready
              </span>
              <span>•</span>
              <span>WAL SQLite Mode</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Refresh manual check */}
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Forzar comprobación de métricas en vivo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          {/* Alerts Toggle */}
          <button
            onClick={onToggleAlertsView}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors relative ${
              showAlertsView
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Alertas</span>
            {unseenAlertsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {unseenAlertsCount}
              </span>
            )}
          </button>

          {/* Telegram Settings */}
          <button
            onClick={onOpenTelegramModal}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Configurar Bot de Telegram"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">Bot Telegram</span>
          </button>

          {/* GitHub & Portainer Deploy */}
          <button
            onClick={onOpenPortainerModal}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-300 font-medium flex items-center gap-1.5 transition-colors"
            title="Guía Portainer y GitHub"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Portainer & GitHub</span>
          </button>

          {/* Add Video Primary Button */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Vídeo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
