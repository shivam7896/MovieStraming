import React, { useState, useEffect, useRef } from 'react';
import {
  X, Maximize, Minimize, RefreshCw, SkipForward, SkipBack
} from 'lucide-react';
import { getVidriftUrl, getStoredVidriftProvider, resolveTmdbMedia, recordWatchHistory, FALLBACK_BACKDROP } from '../services/api';

export default function VideoPlayerModal({
  media,
  season = 1,
  episode = 1,
  onClose,
  onNextEpisode,
  onPrevEpisode,
  onSelectEpisode,
  onHistoryUpdated
}) {
  const [activeMedia, setActiveMedia] = useState(media);
  const [vidriftProvider, setVidriftProvider] = useState(() => getStoredVidriftProvider());
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Dynamically verify and resolve media from TMDB API to guarantee authentic ID & type
  useEffect(() => {
    let isCancelled = false;
    resolveTmdbMedia(media).then((resolved) => {
      if (!isCancelled && resolved) {
        setActiveMedia(resolved);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [media]);

  const currentItem = activeMedia || media;

  // Persist user watch history to localStorage whenever stream starts or episode changes
  useEffect(() => {
    if (currentItem && currentItem.title) {
      const episodeData = currentItem.seasons
        ?.find((s) => s.seasonNumber === season)
        ?.episodes?.find((e) => e.episodeNumber === episode);
      recordWatchHistory(currentItem, season, episode, episodeData?.title || '');
      if (onHistoryUpdated) onHistoryUpdated();
    }
  }, [currentItem, season, episode]);

  // Compute Vidrift embed URL with verified dynamic TMDB ID
  const embedUrl = getVidriftUrl(
    currentItem.type,
    currentItem.tmdbId,
    currentItem.title,
    season,
    episode,
    vidriftProvider
  );


  // Keyboard navigation for Escape and Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement && containerRef.current) {
          containerRef.current.requestFullscreen().catch(() => {});
          setIsFullscreen(true);
        } else if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Sync fullscreen state if user exits via browser ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentSeasonData = currentItem.seasons?.find((s) => s.seasonNumber === season) || currentItem.seasons?.[0];
  const currentEpisodeData = currentSeasonData?.episodes?.find((e) => e.episodeNumber === episode);

  return (
    <div ref={containerRef} className="video-player-container">
      {/* Top Header Bar */}
      <div className="player-top-bar">
        <div className="player-top-left">
          <button className="player-back-btn" onClick={onClose} title="Back to Browse (Esc)">
            <X size={20} />
          </button>
          <div className="player-title-box">
            <h2 className="stream-title">{currentItem.title}</h2>
            {currentItem.type === 'tv' && (
              <span className="stream-sub">
                Season {season} • Episode {episode}
                {currentEpisodeData?.title ? `: "${currentEpisodeData.title}"` : ''}
              </span>
            )}
          </div>
        </div>

        {/* TV Episode Quick Navigation */}
        {currentItem.type === 'tv' && (
          <div className="player-episode-nav">
            {onPrevEpisode && episode > 1 && (
              <button className="nav-ep-btn" onClick={onPrevEpisode} title="Previous Episode">
                <SkipBack size={15} />
                <span className="nav-ep-text">Prev Ep</span>
              </button>
            )}

            {currentItem.seasons && (
              <select
                value={episode}
                onChange={(e) => onSelectEpisode && onSelectEpisode(season, Number(e.target.value))}
                className="player-ep-select"
                aria-label="Select Episode"
              >
                {currentSeasonData?.episodes?.map((ep) => (
                  <option key={ep.episodeNumber} value={ep.episodeNumber}>
                    Ep {ep.episodeNumber}: {ep.title}
                  </option>
                ))}
              </select>
            )}

            {onNextEpisode && (
              <button className="nav-ep-btn highlight" onClick={onNextEpisode} title="Next Episode">
                <span className="nav-ep-text">Next Ep</span>
                <SkipForward size={15} />
              </button>
            )}
          </div>
        )}

        {/* Top Right Controls */}
        <div className="player-top-right">
          <button
            className="player-refresh-btn"
            onClick={() => setIframeKey((k) => k + 1)}
            title="Reload Video Stream"
          >
            <RefreshCw size={17} />
          </button>
          <button
            className="player-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
          </button>
        </div>
      </div>

      {/* Main Vidrift Display Area */}
      <div className="player-screen-area">
        <div className="embed-stream-wrapper" style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#07070a' }}>
          <iframe
            key={`vidrift-${currentItem.type}-${currentItem.tmdbId}-${season}-${episode}-${vidriftProvider}-${iframeKey}`}
            src={embedUrl}
            className="embed-iframe"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="origin"
            title={`${currentItem.title} Vidrift Stream`}
          />
        </div>
      </div>

      {/* Streaming Tip Footer */}
      <div className="player-footer-tip">
        <span>💡 Streaming powered exclusively by <strong>Vidrift Premier</strong>. Click the <strong>gear icon (⚙️)</strong> inside player to switch Audio tracks &amp; Subtitles.</span>
      </div>
    </div>
  );
}
