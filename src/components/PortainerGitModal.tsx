import React, { useState } from 'react';
import { X, Copy, Check, GitBranch, Cpu, Terminal, Layers, ExternalLink } from 'lucide-react';

interface PortainerGitModalProps {
  onClose: () => void;
}

export const PortainerGitModal: React.FC<PortainerGitModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const gitSnippet = `# Sube la corrección a tu repositorio de GitHub:
git push origin main --force`;

  const dockerComposeSnippet = `version: '3.8'

services:
  tiktok-tracker:
    build:
      context: .
      dockerfile: Dockerfile
    image: tiktok-tracker:latest
    container_name: tiktok_tracker_portal
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
      - BOT_TOKEN=\${BOT_TOKEN:-}
      - TELEGRAM_CHAT_ID=\${TELEGRAM_CHAT_ID:-}
      - CHECK_INTERVAL_MINUTES=5
      - TZ=Europe/Madrid
    volumes:
      - ./data:/app/data
    deploy:
      resources:
        limits:
          memory: 1024M`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl text-purple-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Despliegue en Portainer & GitHub</h3>
              <p className="text-xs text-slate-400">Optimizado para Raspberry Pi 5 (8GB RAM / ARM64) y servidores x86_64</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Connect to your GitHub */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Paso 1: Conectar con tu Repositorio de GitHub</h4>
              </div>
              <button
                onClick={() => copyToClipboard(gitSnippet, 'git')}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-purple-300 font-semibold flex items-center gap-1.5 transition-colors border border-purple-500/30"
              >
                {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'git' ? '¡Copiado!' : 'Copiar comandos'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              El repositorio Git ya ha sido inicializado y empaquetado con todos los archivos (código de la web, backend, bot en Python, Dockerfile y docker-compose). Solo necesitas vincularlo a tu GitHub:
            </p>

            <pre className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] text-cyan-300 font-mono overflow-x-auto">
              {gitSnippet}
            </pre>
          </div>

          {/* Step 2: Deploy on Portainer */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Paso 2: Despliegue en Portainer (1-Click Stack)</h4>
              </div>
              <button
                onClick={() => copyToClipboard(dockerComposeSnippet, 'compose')}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors border border-cyan-500/30"
              >
                {copiedKey === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'compose' ? '¡Copiado!' : 'Copiar docker-compose'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
              <li>Abre <strong>Portainer</strong> en tu Raspberry Pi (<code className="text-cyan-400">https://IP:9443</code>).</li>
              <li>Ve a <strong>Stacks</strong> ➡️ <strong>Add Stack</strong>.</li>
              <li>
                Elige el método <strong>Repository</strong>:
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mt-1 space-y-1 font-mono text-[11px]">
                  <div><strong className="text-slate-400">Repository URL:</strong> <span className="text-purple-300">https://github.com/TU_USUARIO/tiktok-tracker.git</span></div>
                  <div><strong className="text-slate-400">Repository reference:</strong> <span className="text-slate-300">refs/heads/main</span></div>
                  <div><strong className="text-slate-400">Compose path:</strong> <span className="text-slate-300">docker-compose.yml</span></div>
                </div>
              </li>
              <li>
                En la sección <strong>Environment variables</strong>, puedes configurar opcionalmente:
                <ul className="list-disc list-inside pl-4 text-slate-400 mt-1 space-y-0.5">
                  <li><code className="text-white">BOT_TOKEN</code>: Tu token de Telegram (si quieres recibir notificaciones push en el móvil).</li>
                  <li><code className="text-white">TELEGRAM_CHAT_ID</code>: Tu ID de chat en Telegram.</li>
                  <li><code className="text-white">CHECK_INTERVAL_MINUTES</code>: Intervalo en minutos (por defecto 5).</li>
                </ul>
              </li>
              <li>Haz clic en <strong>Deploy the stack</strong>. Portainer compilará la imagen en ARM64 nativo y montará el volumen persistente en <code className="text-cyan-400">./data</code>.</li>
              <li>Accede a tu web en <code className="text-emerald-400 font-bold">http://IP_DE_TU_RASPBERRY:3000</code>.</li>
            </ol>
          </div>

          {/* Architecture Benefits on Raspberry Pi 5 */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-2xl p-4">
            <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>🚀 Especificaciones de Rendimiento en Raspberry Pi 5</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-xs text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-white block">Sin Navegadores Headless</strong>
                <span className="text-slate-400 text-[11px]">Consumo menor a 150MB de RAM, 100% compatible con <code className="text-cyan-300">aarch64</code>.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-white block">Persistencia SQLite WAL</strong>
                <span className="text-slate-400 text-[11px]">Lecturas concurrentes instantáneas sin bloquear la tarjeta SD / disco NVMe.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-white block">Gráficas y CSV en RAM</strong>
                <span className="text-slate-400 text-[11px]">Generación en memoria sin degradar el almacenamiento físico.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
