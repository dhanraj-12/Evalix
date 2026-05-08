export default function MediaPlayer({ media, className = '' }) {
  if (!media || media.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {media.map((m) => {
        if (!m || !m.url) return null;
        const key = m._id || m.url;
        return (
          <div key={key} className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface-50">
            {m.type === 'image' && (
              <img
                src={m.url.trim()}
                alt="Question media"
                className="w-full max-h-72 object-contain bg-black/30 p-3"
                onError={(e) => { e.target.style.display = 'none'; }}
                loading="lazy"
              />
            )}
            {m.type === 'audio' && (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                  <span className="text-sm text-neutral-400 font-medium">Audio Clip</span>
                </div>
                <audio controls className="w-full" preload="metadata" style={{ filter: 'invert(1)', opacity: 0.7 }}>
                  <source src={m.url} />
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}
            {m.type === 'video' && (
              <div className="p-2">
                <video controls className="w-full rounded-lg max-h-80" preload="metadata" playsInline>
                  <source src={m.url} />
                  Your browser does not support video playback.
                </video>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
