import React, { useState } from 'react';
import { X, Link2, User, Search, Plus, Check, Loader2 } from 'lucide-react';

interface AddVideoModalProps {
  onClose: () => void;
  onVideoAdded: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ onClose, onVideoAdded }) => {
  const [activeTab, setActiveTab] = useState<'url' | 'profile'>('url');
  
  // URL tab states
  const [urlInput, setUrlInput] = useState('');
  const [milestoneInterval, setMilestoneInterval] = useState(5000);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Profile tab states
  const [profileInput, setProfileInput] = useState('@albertocastells');
  const [profileVideos, setProfileVideos] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setLoadingUrl(true);
    setUrlError('');

    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlInput.trim(),
          milestoneInterval
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al agregar vídeo');
      }

      onVideoAdded();
      onClose();
    } catch (err) {
      setUrlError((err as Error).message);
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleSearchProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInput.trim()) return;
    setLoadingProfile(true);
    setProfileError('');
    setProfileVideos([]);

    try {
      const cleanUser = profileInput.trim().replace('@', '');
      const res = await fetch(`/api/profile/${cleanUser}/videos`);
      if (!res.ok) throw new Error('Error al consultar perfil');
      const data = await res.json();
      setProfileVideos(data.videos || []);
    } catch (err) {
      setProfileError('No se pudieron obtener vídeos de este perfil. Comprueba que sea público.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleTrackProfileVideo = async (vid: any) => {
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: vid.url,
          milestoneInterval: 5000
        })
      });
      if (res.ok) {
        setAddedMap(prev => ({ ...prev, [vid.id]: true }));
        onVideoAdded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Añadir Vídeos al Tracker</h2>
            <p className="text-xs text-slate-400">Elige enlace directo o explora los vídeos públicos de un usuario</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Vía A: Enlace Directo (URL)</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'profile' ? 'bg-[#fe2c55]/20 text-[#fe2c55] border border-[#fe2c55]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Vía B: Explorador de Perfil (@user)</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'url' ? (
            <form onSubmit={handleAddByUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL o Enlace Corto del Vídeo
                </label>
                <input
                  type="text"
                  placeholder="https://vm.tiktok.com/ZM... o https://www.tiktok.com/@user/video/..."
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Soporta enlaces cortos (<code className="text-cyan-400">vm.tiktok.com</code>) y enlaces largos estándar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Intervalo Inicial del Hito (Milestone)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 5000, 10000, 50000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setMilestoneInterval(val)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        milestoneInterval === val
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val} views
                    </button>
                  ))}
                </div>
              </div>

              {urlError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
                  {urlError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingUrl}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loadingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extrayendo métricas de TikTok...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Iniciar Monitoreo 24/7</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSearchProfile} className="flex gap-2">
                <input
                  type="text"
                  placeholder="@usuario (ej. @albertocastells)"
                  value={profileInput}
                  onChange={e => setProfileInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#fe2c55]"
                />
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-[#fe2c55] hover:bg-[#fe2c55]/90 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  {loadingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Explorar</span>
                </button>
              </form>

              {profileError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
                  {profileError}
                </div>
              )}

              {profileVideos.length > 0 && (
                <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>Vídeos encontrados ({profileVideos.length}):</span>
                    <span>Clic para trackear</span>
                  </div>
                  {profileVideos.map(v => {
                    const isAdded = addedMap[v.id] || v.isTracking;
                    return (
                      <div
                        key={v.id}
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                            {v.coverUrl ? (
                              <img src={v.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-800" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate max-w-sm">{v.description}</p>
                            <span className="text-[11px] text-cyan-400">👀 {v.views.toLocaleString()} visitas</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTrackProfileVideo(v)}
                          disabled={isAdded}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                              : 'bg-slate-800 hover:bg-[#fe2c55] hover:text-white text-slate-300'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>En Tracker</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Trackear</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
