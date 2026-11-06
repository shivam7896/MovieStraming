import React, { useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX, Plus, Check, Star } from 'lucide-react';
import { handleImageFallback, FALLBACK_BACKDROP } from '../services/api';

export default function HeroBanner({
  featuredList,
  onPlay,
  onMoreInfo,
  myList,
  onToggleMyList
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Auto-rotate hero every 12 seconds with buttery smooth crossfade
  useEffect(() => {
    if (!featuredList || featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [featuredList]);

  if (!featuredList || featuredList.length === 0) return null;

  const currentMedia = featuredList[currentIndex] || featuredList[0];
  const isInList = myList.some((item) => item.id === currentMedia.id);

  return (
    <div className="hero-banner">
      {/* Background Backdrop Image Crossfade Layers */}
      <div className="hero-backdrop-container">
        {featuredList.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={item.id}
              className={`hero-slide-layer ${isActive ? 'active' : ''}`}
            >
              <img
                src={item.backdrop || item.poster || FALLBACK_BACKDROP}
                alt={item.title}
                className="hero-backdrop-img"
                onError={(e) => handleImageFallback(e, FALLBACK_BACKDROP, item.poster)}
              />
            </div>
          );
        })}

        {/* Cinematic Vignette Gradients */}
        <div className="hero-vignette-left"></div>
        <div className="hero-vignette-bottom"></div>
        <div className="hero-vignette-top"></div>
      </div>

      {/* Hero Content with Smooth Keyed Slide-In */}
      <div key={currentMedia.id} className="hero-content hero-content-animated">
        <div className="hero-badges">
          <span className="hero-badge-tag">
            {currentMedia.type === 'movie' ? '🎬 FEATURED MOVIE' : '📺 ORIGINAL SERIES'}
          </span>
        </div>

        <h1 className="hero-title">{currentMedia.title}</h1>

        {currentMedia.tagline && (
          <p className="hero-tagline">"{currentMedia.tagline}"</p>
        )}

        <p className="hero-overview">{currentMedia.overview}</p>

        {/* Rating, Match & Quality Badges - directly above Play Now button */}
        <div className="hero-meta-strip">
          <span className="hero-badge-score">
            <Star size={14} fill="#FFB800" color="#FFB800" /> {currentMedia.rating} / 10
          </span>
          <span className="hero-badge-match">{currentMedia.matchScore}% Match</span>
          <span className="hero-badge-quality">{currentMedia.quality}</span>
        </div>

        {/* Action Buttons */}
        <div className="hero-actions">
          <button
            className="btn btn-primary"
            onClick={() => onPlay(currentMedia)}
          >
            <Play size={20} fill="currentColor" />
            <span>Play Now</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onMoreInfo(currentMedia)}
          >
            <Info size={20} />
            <span>More Info</span>
          </button>

          <button
            className="btn btn-circle"
            onClick={() => onToggleMyList(currentMedia)}
            title={isInList ? 'Remove from My List' : 'Add to My List'}
          >
            {isInList ? <Check size={18} color="#46d369" /> : <Plus size={18} />}
          </button>
        </div>

        {/* Hero Genre Pills */}
        <div className="hero-genres">
          {currentMedia.genres.map((g) => (
            <span key={g} className="genre-pill">{g}</span>
          ))}
        </div>
      </div>

      {/* Right Side: Maturity & Sound Controls */}
      <div className="hero-right-controls">
        <button
          className="audio-preview-btn"
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute Audio Preview' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <div className="maturity-badge">
          <span>{currentMedia.maturity}</span>
        </div>
      </div>

      {/* Bottom Slider Indicators with Smooth Expansion */}
      <div className="hero-indicators">
        {featuredList.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setCurrentIndex(idx)}
            className={`hero-dot ${idx === currentIndex ? 'active' : ''}`}
            title={item.title}
          />
        ))}
      </div>
    </div>
  );
}
