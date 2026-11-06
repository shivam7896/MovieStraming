import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check } from 'lucide-react';
import { handleImageFallback, FALLBACK_BACKDROP } from '../services/api';

export default function DetailModal({
  media,
  onClose,
  onPlay,
  myList,
  onToggleMyList,
  catalog
}) {
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!media) return null;

  const isInList = myList.some((item) => item.id === media.id);
  const seasonsList = media.seasons && media.seasons.length > 0
    ? media.seasons
    : media.type === 'tv'
    ? [
        {
          seasonNumber: 1,
          title: 'Season 1',
          episodes: Array.from({ length: 8 }, (_, i) => ({
            episodeNumber: i + 1,
            title: `Episode ${i + 1}`,
            duration: '45m',
            overview: `Stream Season 1 Episode ${i + 1} instantly on Vidrift.`
          }))
        }
      ]
    : [];
  const currentSeasonData = seasonsList.find((s) => s.seasonNumber === selectedSeason) || seasonsList[0];
  const similarTitles = catalog.filter((item) => item.id !== media.id && item.genres?.some((g) => media.genres?.includes(g))).slice(0, 6);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        {/* Modal Banner */}
        <div className="modal-banner">
          <img
            src={media.backdrop || media.poster || FALLBACK_BACKDROP}
            alt={media.title}
            className="modal-banner-img"
            onError={(e) => handleImageFallback(e, FALLBACK_BACKDROP, media.poster)}
          />
          <div className="modal-banner-gradient"></div>

          <div className="modal-banner-content">
            <h1 className="modal-title">{media.title}</h1>

            <div className="modal-banner-actions">
              <button
                className="btn btn-primary"
                onClick={() => onPlay(media, selectedSeason, 1)}
              >
                <Play size={20} fill="currentColor" />
                <span>Play</span>
              </button>

              <button
                className="btn btn-circle"
                onClick={() => onToggleMyList(media)}
                title={isInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInList ? <Check size={18} color="#46d369" /> : <Plus size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="modal-grid-cols">
            {/* Left Column: Metadata & Overview */}
            <div className="modal-left-col">
              <div className="modal-meta-row">
                <span className="modal-match-score">{media.matchScore}% Match</span>
                <span className="modal-year">{media.releaseYear}</span>
                <span className="modal-badge-age">{media.maturity}</span>
                <span className="modal-duration">
                  {media.type === 'movie' ? media.duration : `${media.seasonsCount} Season${media.seasonsCount > 1 ? 's' : ''}`}
                </span>
                <span className="modal-badge-quality">{media.quality}</span>
              </div>

              {media.tagline && (
                <p className="modal-tagline">"{media.tagline}"</p>
              )}

              <p className="modal-overview">{media.overview}</p>
            </div>

            {/* Right Column: Cast, Genres, Creator */}
            <div className="modal-right-col">
              <div className="meta-info-item">
                <span className="meta-label">Cast: </span>
                <span className="meta-value">{media.cast?.join(', ')}</span>
              </div>

              <div className="meta-info-item">
                <span className="meta-label">Genres: </span>
                <span className="meta-value">{media.genres?.join(', ')}</span>
              </div>

              <div className="meta-info-item">
                <span className="meta-label">{media.director ? 'Director:' : 'Creator:'} </span>
                <span className="meta-value">{media.director || media.creator}</span>
              </div>
            </div>
          </div>

          {/* TV Shows: Episode Guide & Season Picker */}
          {media.type === 'tv' && seasonsList.length > 0 && (
            <div className="modal-episodes-section">
              <div className="episodes-header">
                <h3>Episodes</h3>
                <div className="season-selector-wrapper">
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="season-select"
                  >
                    {seasonsList.map((s) => (
                      <option key={s.seasonNumber} value={s.seasonNumber}>
                        {s.title} ({s.episodes.length} Episodes)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="episodes-list">
                {currentSeasonData?.episodes.map((ep) => (
                  <div
                    key={ep.episodeNumber}
                    className="episode-card"
                    onClick={() => onPlay(media, selectedSeason, ep.episodeNumber)}
                  >
                    <div className="episode-index">{ep.episodeNumber}</div>
                    <div className="episode-thumb-container">
                      <img
                        src={media.backdrop || media.poster || FALLBACK_BACKDROP}
                        alt={ep.title}
                        className="episode-thumb"
                        onError={(e) => handleImageFallback(e, FALLBACK_BACKDROP, media.poster)}
                      />
                      <div className="episode-play-overlay">
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                    <div className="episode-info">
                      <div className="episode-title-row">
                        <span className="episode-title">{ep.title}</span>
                        <span className="episode-duration">{ep.duration}</span>
                      </div>
                      <p className="episode-overview">{ep.overview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Recommendations */}
          {similarTitles.length > 0 && (
            <div className="modal-similar-section">
              <h3>More Like This</h3>
              <div className="similar-grid">
                {similarTitles.map((item) => (
                  <div
                    key={item.id}
                    className="similar-card"
                    onClick={() => onPlay(item)}
                  >
                    <div className="similar-thumb-wrap">
                      <img
                        src={item.backdrop || item.poster || FALLBACK_BACKDROP}
                        alt={item.title}
                        className="similar-thumb"
                        onError={(e) => handleImageFallback(e, FALLBACK_BACKDROP, item.poster)}
                      />
                      <span className="similar-duration">{item.duration || `${item.seasonsCount} Seasons`}</span>
                    </div>
                    <div className="similar-body">
                      <div className="similar-title-row">
                        <span className="similar-title">{item.title}</span>
                        <span className="similar-match">{item.matchScore}%</span>
                      </div>
                      <p className="similar-desc">{item.overview.slice(0, 95)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
