import React, { useState } from 'react';
import { TelegramSettings } from '../types';
import { X, Send, Check, AlertCircle, Bot, Sliders, BellRing, Loader2 } from 'lucide-react';

interface TelegramSettingsModalProps {
  settings: TelegramSettings;
  onClose: () => void;
  onSave: (newSettings: TelegramSettings) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [botToken, setBotToken] = useState(settings.botToken || '');
  const [chatId, setChatId] = useState(settings.chatId || '');
  const [interval, setInterval] = useState(settings.checkIntervalMinutes || 5);
  const [alertsEnabled, setAlertsEnabled] = useState(settings.telegramAlertsEnabled || false);
  const [monitoredProfile, setMonitoredProfile] = useState(settings.monitoredProfile || '@albertocastells');
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      checkIntervalMinutes: interval,
      telegramAlertsEnabled: alertsEnabled,
      monitoredProfile: monitoredProfile.trim()
    });
    onClose();
  };

  const handleTestMessage = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({ success: false, message: 'Por favor introduce el Bot Token y el Chat ID primero.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fallo en la prueba de conexión');
      }

      setTestResult({ success: true, message: '¡Mensaje de prueba recibido en Telegram con éxito! Revisa tu chat.' });
    } catch (err) {
      setTestResult({ success: false, message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Configuración del Bot de Telegram</h3>
              <p className="text-xs text-slate-400">Recibe alertas push instantáneas en tu móvil cuando ocurra un hito o pico viral</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Active alerts toggle */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Alertas Push a Telegram</h4>
                <p className="text-[11px] text-slate-400">Enviar notificación cuando se alcance un hito o aceleración &gt;3x</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={e => setAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Telegram Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Bot Token
              </label>
              <input
                type="password"
                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ (de @BotFather)"
                value={botToken}
                onChange={e => setBotToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Crea un bot gratis hablando con <strong>@BotFather</strong> en Telegram y copia el token API.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tu Chat ID de Telegram
              </label>
              <input
                type="text"
                placeholder="987654321 (de @userinfobot)"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Envía cualquier mensaje a <strong>@userinfobot</strong> en Telegram para obtener tu ID numérico.
              </span>
            </div>

            {/* Test alert button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestMessage}
                disabled={testing}
                className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Conectando con Telegram API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Probar Envío de Alerta en Telegram en Vivo</span>
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`mt-2 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-300 border border-red-500/30'
                  }`}
                >
                  {testResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scheduler Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">Configuración del Planificador en Segundo Plano</h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Intervalo de Comprobación Silenciosa (Minutos)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 15].map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setInterval(m)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      interval === m
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cada {m} min
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Frecuencia con la que el motor toma una instantánea silenciosa en la base de datos para calcular $\Delta$ y velocidad.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Perfil Predeterminado a Trackear ("X Usuario")
              </label>
              <input
                type="text"
                value={monitoredProfile}
                onChange={e => setMonitoredProfile(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
