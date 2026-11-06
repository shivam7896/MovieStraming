import React, { useRef } from 'react';

/**
 * Vidrift Embedded Player Component
 * Plays movies and TV shows using TMDB ID and query parameters.
 * Automatically loads the 'orion' provider which includes Hindi, Tamil, Telugu & Multi-Audio dubs.
 * 
 * Usage:
 * <Player tmdbId="27205" title="Inception" provider="orion" />
 */
export function Player({
  tmdbId = '27205',
  type = 'movie',
  season = 1,
  episode = 1,
  title = 'Inception',
  provider = 'orion', // 'orion' unlocks Hindi & international dubs
  style = {}
}) {
  const iframeRef = useRef(null);
  const encodedTitle = encodeURIComponent(title || 'Movie');
  const providerParam = provider ? `&provider=${encodeURIComponent(provider)}` : '';

  const src =
    type === 'tv'
      ? `https://embed.vidrift.net/embed/tv/${tmdbId}/${season}/${episode}?title=${encodedTitle}${providerParam}`
      : `https://embed.vidrift.net/embed/movie/${tmdbId}?title=${encodedTitle}${providerParam}`;

  return (
    <div
      style={{
        position: 'relative',
        paddingBottom: '56.25%',
        height: 0,
        width: '100%',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        ...style
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 0
        }}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        title={title || 'Vidrift Player'}
      />
    </div>
  );
}

export default Player;
