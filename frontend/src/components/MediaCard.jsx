import React, { useState } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown, X } from 'lucide-react';
import { handleImageFallback, FALLBACK_POSTER, FALLBACK_BACKDROP } from '../services/api';

export default function MediaCard({
  media,
  rank,
  isTop10 = false,
  onPlay,
  onMoreInfo,
  myList = [],
  onToggleMyList,
  onCardHover,
  onRemoveFromHistory
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Instant response with zero timer delay
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onCardHover) onCardHover(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onCardHover) onCardHover(false);
  };

  const isInList = myList.some((item) => item.id === media.id);

  // Resume playback at last watched season and episode if present
  const handlePlayCard = (e) => {
    if (e) e.stopPropagation();
    onPlay(
      media,
      media.watchedSeason || 1,
      media.watchedEpisode || 1
    );
  };

  return (
    <div
      className={`media-card-wrapper ${isTop10 ? 'top10-card-wrapper' : ''} ${isHovered ? 'active-hover' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top 10 Rank Number if Top 10 */}
      {isTop10 && rank && (
        <div className="rank-number-container">
          <span className="rank-number">{rank}</span>
        </div>
      )}

      {/* Main Base Card */}
      <div className="media-card-base" onClick={() => onMoreInfo(media)}>
        <img
          src={isTop10 ? (media.poster || media.backdrop || FALLBACK_POSTER) : (media.backdrop || media.poster || FALLBACK_BACKDROP)}
          alt={media.title}
          className="media-card-img"
          loading="lazy"
          onError={(e) =>
            handleImageFallback(
              e,
              isTop10 ? FALLBACK_POSTER : FALLBACK_BACKDROP,
              isTop10 ? media.backdrop : media.poster
            )
          }
        />

        {/* History / Continue Watching Red Progress Bar */}
        {media.isContinueWatching && (
          <div className="card-progress-bar">
            <div
              className="card-progress-fill"
              style={{ width: `${media.progressPercentage || 75}%` }}
            />
          </div>
        )}

        <div className="media-card-gradient-overlay"></div>
        <div className="media-card-static-info">
          <span className="static-title">{media.title}</span>
          <span className={`static-type ${media.isContinueWatching ? 'continue-badge' : ''}`}>
            {media.isContinueWatching && media.type === 'tv'
              ? `S${media.watchedSeason || 1}:E${media.watchedEpisode || 1}`
              : media.isContinueWatching
              ? 'Resume'
              : media.type === 'movie'
              ? 'Movie'
              : `${media.seasonsCount || 1} Season${media.seasonsCount > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Hover Preview Card Popup with 0ms Delay & Smooth CSS Expansion */}
      <div
        className="media-card-hover-popup"
        onClick={() => onMoreInfo(media)}
      >
        {/* Card Image Banner */}
        <div className="hover-media-header">
          <img
            src={media.backdrop || media.poster || FALLBACK_BACKDROP}
            alt={media.title}
            className="hover-backdrop"
            onError={(e) => handleImageFallback(e, FALLBACK_BACKDROP, media.poster)}
          />
          <div className="hover-gradient"></div>
          <span className="hover-title">{media.title}</span>

          {media.isContinueWatching && (
            <span className="hover-continue-pill">
              {media.type === 'tv'
                ? `Continue S${media.watchedSeason || 1}:E${media.watchedEpisode || 1}`
                : 'Resume Movie'}
            </span>
          )}
        </div>

        {/* Quick Actions Row */}
        <div className="hover-body">
          <div className="hover-actions-row">
            <div className="hover-actions-left">
              <button
                className="quick-action-btn primary"
                onClick={handlePlayCard}
                title={media.isContinueWatching ? 'Resume Stream' : 'Play'}
              >
                <Play size={16} fill="currentColor" />
              </button>

              <button
                className="quick-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMyList(media);
                }}
                title={isInList ? 'Remove from My List' : 'Add to My List'}
              >
                {isInList ? <Check size={16} color="#46d369" /> : <Plus size={16} />}
              </button>

              <button
                className={`quick-action-btn ${isLiked ? 'liked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                title="I like this"
              >
                <ThumbsUp
                  size={15}
                  fill={isLiked ? '#E50914' : 'none'}
                  color={isLiked ? '#E50914' : 'currentColor'}
                />
              </button>

              {onRemoveFromHistory && (
                <button
                  className="quick-action-btn remove-history-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromHistory(media.id);
                  }}
                  title="Remove from Watch History"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              className="quick-action-btn expand"
              onClick={(e) => {
                e.stopPropagation();
                onMoreInfo(media);
              }}
              title="More Details & Episodes"
            >
              <ChevronDown size={17} />
            </button>
          </div>

          {/* Hover Meta Specs */}
          <div className="hover-meta-row">
            <span className="hover-match">{media.matchScore}% Match</span>
            <span className="hover-badge-age">{media.maturity}</span>
            <span className="hover-duration">
              {media.type === 'movie' ? media.duration : `${media.seasonsCount || 1} Season${media.seasonsCount > 1 ? 's' : ''}`}
            </span>
            <span className="hover-badge-hd">HD</span>
          </div>

          {/* Genres */}
          <div className="hover-genres-row">
            {media.genres.slice(0, 3).map((g, i) => (
              <span key={g} className="hover-genre-item">
                {g}
                {i < Math.min(media.genres.length - 1, 2) && <span className="dot">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
