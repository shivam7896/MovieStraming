/**
 * Vidrift Stream URL Generator
 * Embeds movies and tv shows by TMDB ID with title and provider query params.
 * 'provider=orion' unlocks the multi-audio engine with Hindi, English, and other dubbed tracks.
 */
export const getVidriftUrl = (
  type,
  tmdbId,
  title = '',
  season = 1,
  episode = 1,
  provider = 'orion'
) => {
  const encodedTitle = encodeURIComponent(title || 'Movie');
  const providerParam = provider ? `&provider=${encodeURIComponent(provider)}` : '';
  if (type === 'movie') {
    return `https://embed.vidrift.net/embed/movie/${tmdbId}?title=${encodedTitle}${providerParam}`;
  }
  return `https://embed.vidrift.net/embed/tv/${tmdbId}/${season}/${episode}?title=${encodedTitle}${providerParam}`;
};

/**
 * Retrieves the stored Vidrift Provider preference (defaults to 'orion' for Multi-Audio)
 */
export function getStoredVidriftProvider() {
  return localStorage.getItem('cinepro_vidrift_provider') || 'orion';
}

/**
 * Stores Vidrift Provider preference
 */
export function setStoredVidriftProvider(provider) {
  if (provider) {
    localStorage.setItem('cinepro_vidrift_provider', provider.trim());
  } else {
    localStorage.removeItem('cinepro_vidrift_provider');
  }
}

/**
 * Retrieves the stored TMDB Key from localStorage
 */
export function getStoredTmdbKey() {
  return localStorage.getItem('cinepro_tmdb_key') || '7424e4bd26a6db3b261f749f2f91f765';
}

/**
 * Stores custom TMDB Key
 */
export function setStoredTmdbKey(key) {
  if (key) {
    localStorage.setItem('cinepro_tmdb_key', key.trim());
  } else {
    localStorage.removeItem('cinepro_tmdb_key');
  }
}

/**
 * High-definition, resilient SVG data URIs that never fail, 404, or require external network requests.
 */
export const FALLBACK_BACKDROP =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a1a26"/><stop offset="100%" stop-color="%230b0b10"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><circle cx="640" cy="330" r="64" fill="%23222232"/><polygon points="625,300 668,330 625,360" fill="%23e50914"/><text x="640" y="440" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="28" font-weight="800" fill="%23ffffff" text-anchor="middle" letter-spacing="1">CINEPRO PREMIER</text><text x="640" y="475" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="16" font-weight="600" fill="%238e8ea0" text-anchor="middle">Stream Available in Ultra HD</text></svg>';

export const FALLBACK_POSTER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a1a26"/><stop offset="100%" stop-color="%230b0b10"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23bg)"/><circle cx="250" cy="340" r="54" fill="%23222232"/><polygon points="238,315 272,340 238,365" fill="%23e50914"/><text x="250" y="435" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="22" font-weight="800" fill="%23ffffff" text-anchor="middle" letter-spacing="1">CINEPRO</text><text x="250" y="468" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="14" font-weight="600" fill="%238e8ea0" text-anchor="middle">Streaming in HD</text></svg>';

export const FALLBACK_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="100%" height="100%" fill="%23e50914" rx="24"/><text x="50%" y="62%" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="48" font-weight="900" fill="%23ffffff" text-anchor="middle">C</text></svg>';

/**
 * Universal safe image fallback handler for onError events
 */
export function handleImageFallback(e, fallbackUrl = FALLBACK_POSTER, secondaryUrl = null) {
  if (!e || !e.target) return;
  const currentSrc = e.target.src;

  // If a secondary source is available (e.g. poster -> backdrop or backdrop -> poster), try it first
  if (secondaryUrl && currentSrc !== secondaryUrl && !currentSrc.startsWith('data:image')) {
    e.target.src = secondaryUrl;
    return;
  }

  // Prevent infinite loop if already on fallback
  if (currentSrc !== fallbackUrl) {
    e.target.src = fallbackUrl;
  }
}

/**
 * Retrieves the stored user watch history from localStorage
 */
export function getStoredWatchHistory() {
  try {
    const raw = localStorage.getItem('cinepro_watch_history');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load watch history from localStorage:', err);
    return [];
  }
}

/**
 * Records or updates a title in user watch history in localStorage
 */
export function recordWatchHistory(media, season = 1, episode = 1, episodeTitle = '') {
  if (!media) return getStoredWatchHistory();
  try {
    const history = getStoredWatchHistory();
    const mediaId = String(media.id || media.tmdbId || '');

    // Remove previous entry for this media if present
    const filtered = history.filter((item) => {
      const existingId = String(item.id || item.tmdbId || '');
      return existingId !== mediaId;
    });

    // Create fresh history entry
    const entry = {
      id: media.id || media.tmdbId,
      tmdbId: media.tmdbId || media.id,
      title: media.title,
      type: media.type || 'movie',
      poster: media.poster,
      backdrop: media.backdrop || media.poster,
      overview: media.overview || '',
      genres: media.genres || [],
      matchScore: media.matchScore || 95,
      maturity: media.maturity || 'U/A 13+',
      duration: media.duration || '',
      quality: media.quality || '4K HDR',
      rating: media.rating || '8.5',
      releaseYear: media.releaseYear || new Date().getFullYear(),
      seasonsCount: media.seasonsCount || (media.seasons ? media.seasons.length : 1),
      seasons: media.seasons || [],
      categories: ['trending'],
      watchedSeason: Number(season) || 1,
      watchedEpisode: Number(episode) || 1,
      episodeTitle: episodeTitle || (media.type === 'tv' ? `Episode ${episode}` : ''),
      watchedAt: Date.now(),
      progressPercentage: 75,
      isContinueWatching: true
    };

    // Prepend to top and cap at 50 items
    const updated = [entry, ...filtered].slice(0, 50);
    localStorage.setItem('cinepro_watch_history', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to record watch history in localStorage:', err);
    return getStoredWatchHistory();
  }
}

/**
 * Removes a specific title from watch history in localStorage
 */
export function removeFromWatchHistory(mediaId) {
  try {
    const history = getStoredWatchHistory();
    const targetId = String(mediaId);
    const updated = history.filter((item) => {
      const itemId = String(item.id || item.tmdbId || '');
      return itemId !== targetId;
    });
    localStorage.setItem('cinepro_watch_history', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to remove from watch history in localStorage:', err);
    return getStoredWatchHistory();
  }
}

/**
 * Clears all user watch history from localStorage
 */
export function clearWatchHistory() {
  try {
    localStorage.removeItem('cinepro_watch_history');
    return [];
  } catch (err) {
    console.error('Failed to clear watch history from localStorage:', err);
    return [];
  }
}

/**
 * Genre dictionary mapping TMDB genre IDs to human-readable names
 */
export const TMDB_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

/**
 * Formats a raw TMDB result into CinePro's standard Media model
 */
export function formatTmdbItem(item, defaultCats = ['trending']) {
  const isTv = item.media_type === 'tv' || (!item.title && Boolean(item.name));
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date || '';
  const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : 2024;
  const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.4;
  const matchScore = Math.min(99, Math.max(65, Math.round(rating * 10) + 3));

  const genres = (item.genre_ids || [])
    .map((gid) => TMDB_GENRES[gid])
    .filter(Boolean);

  if (genres.length === 0) {
    genres.push(isTv ? 'TV Series' : 'Movie');
  }

  const categories = [...defaultCats];
  if (isTv && !categories.includes('series')) categories.push('series');
  if (genres.includes('Action') && !categories.includes('action')) categories.push('action');
  if (genres.includes('Sci-Fi') && !categories.includes('scifi')) categories.push('scifi');
  if (genres.includes('Drama') && !categories.includes('drama')) categories.push('drama');
  if (genres.includes('Animation') && !categories.includes('animation')) categories.push('animation');
  if (genres.includes('Romance') && !categories.includes('romance')) categories.push('romance');

  const isTaskaree = Number(item.id) === 308482 || title.toLowerCase().includes('taskaree');

  return {
    id: `${isTv ? 's' : 'm'}-${item.id}`,
    tmdbId: item.id,
    type: isTv ? 'tv' : 'movie',
    title: isTaskaree ? "Taskaree: The Smuggler's Web" : title,
    tagline: isTaskaree ? 'Every shipment has a price. Every secret has a cost.' : (item.tagline || ''),
    overview: item.overview || 'Stream available immediately in HD/4K with multi-language audio on Vidrift.',
    backdrop: isTaskaree
      ? '/taskaree_hero.jpg'
      : item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
    poster: isTaskaree
      ? '/taskaree_hero.jpg'
      : item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item.backdrop_path
      ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
      : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80',
    rating,
    matchScore,
    releaseYear,
    duration: isTv ? '45m' : '2h 05m',
    seasonsCount: isTv ? (item.number_of_seasons || 1) : undefined,
    maturity: rating >= 8.0 ? '16+' : '13+',
    quality: '4K Ultra HD',
    genres,
    categories,
    seasons: isTv
      ? [
          {
            seasonNumber: 1,
            title: 'Season 1',
            episodes: Array.from(
              { length: isTaskaree ? 7 : (item.number_of_episodes || 8) },
              (_, i) => ({
                episodeNumber: i + 1,
                title: isTaskaree
                  ? [
                      "The Smuggler's Web",
                      'Red Alert',
                      'The Shadow Cargo',
                      'Double Cross',
                      'The Interception',
                      'Deep Water',
                      'The Final Reckoning'
                    ][i] || `Episode ${i + 1}`
                  : `Episode ${i + 1}`,
                duration: '45m',
                overview: isTaskaree
                  ? `Superintendent Arjun Meena tracks high-value contraband and uncovers syndicate ties in Episode ${i + 1}.`
                  : `Stream Episode ${i + 1} instantly on Vidrift.`
              })
            )
          }
        ]
      : undefined
  };
}

/**
 * Searches TMDB for movies and TV shows
 */
export async function searchTmdb(query, customKey = '') {
  if (!query || !query.trim()) return [];

  const apiKey = customKey || getStoredTmdbKey();
  const trimmedQuery = encodeURIComponent(query.trim());
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${trimmedQuery}&include_adult=false&language=en-US&page=1`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TMDB HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    // Filter to only movies and TV shows with poster or backdrop
    return data.results
      .filter(
        (item) =>
          (item.media_type === 'movie' || item.media_type === 'tv') &&
          (item.poster_path || item.backdrop_path || item.id === 308482)
      )
      .map((item) => formatTmdbItem(item, ['trending']));
  } catch (err) {
    console.warn('TMDB search fetch bypassed/failed:', err.message);
    return [];
  }
}

/**
 * Dynamically resolves any title or media object from TMDB API
 * Guarantees real TMDB ID, correct media type (tv vs movie), and seasons data.
 */
export async function resolveTmdbMedia(mediaOrQuery, preferredType = null, customKey = '') {
  if (!mediaOrQuery) return mediaOrQuery;

  const apiKey = customKey || getStoredTmdbKey();
  const query = typeof mediaOrQuery === 'string' ? mediaOrQuery : mediaOrQuery.title || '';

  if (!query.trim()) return mediaOrQuery;

  try {
    const trimmedQuery = encodeURIComponent(query.trim());
    const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${trimmedQuery}&include_adult=false&language=en-US`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return mediaOrQuery;
    const data = await res.json();
    const results = (data.results || []).filter(
      (r) => r.media_type === 'movie' || r.media_type === 'tv'
    );

    if (results.length === 0) return mediaOrQuery;

    let best = results[0];
    if (preferredType) {
      const matchType = results.find((r) => r.media_type === preferredType);
      if (matchType) best = matchType;
    }

    const formatted = formatTmdbItem(best, ['trending']);

    // Merge with any existing fields from original media
    if (typeof mediaOrQuery === 'object') {
      return {
        ...mediaOrQuery,
        ...formatted,
        tmdbId: formatted.tmdbId,
        type: formatted.type,
        seasons: formatted.seasons || mediaOrQuery.seasons
      };
    }

    return formatted;
  } catch (err) {
    console.warn('TMDB dynamic resolution bypassed:', err.message);
    return mediaOrQuery;
  }
}

/**
 * Loads a rich, live catalog directly from TMDB API endpoints:
 * - Real live trending, popular movies, TV shows, and latest releases
 * - Automatically fetches Taskaree dynamically from TMDB
 */
export async function fetchLiveTmdbCatalog(customKey = '') {
  const apiKey = customKey || getStoredTmdbKey();

  const fetchEndpoint = async (endpoint) => {
    try {
      const glue = endpoint.includes('?') ? '&' : '?';
      const url = `https://api.themoviedb.org/3${endpoint}${glue}api_key=${apiKey}&language=en-US`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return [];
      const json = await res.json();
      return json.results || [];
    } catch {
      return [];
    }
  };

  try {
    const [
      taskareeList,
      trendingList,
      nowPlayingList,
      popularMoviesList,
      popularTvList,
      popularTvPage2,
      topRatedTvList,
      crimeTvList,
      romanceMoviesList,
      romanceTvList,
      actionMoviesList,
      scifiMoviesList,
      animationMoviesList,
      dramaMoviesList,
      actionTvList,
      scifiTvList,
      animationTvList,
      hindiMoviesList,
      hindiTvList
    ] = await Promise.all([
      fetchEndpoint('/search/multi?query=Taskaree'),
      fetchEndpoint('/trending/all/day'),
      fetchEndpoint('/movie/now_playing'),
      fetchEndpoint('/movie/popular'),
      fetchEndpoint('/tv/popular?page=1'),
      fetchEndpoint('/tv/popular?page=2'),
      fetchEndpoint('/tv/top_rated?page=1'),
      fetchEndpoint('/discover/tv?with_genres=80,18&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_genres=10749&sort_by=popularity.desc'),
      fetchEndpoint('/discover/tv?with_genres=10749&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_genres=28&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_genres=878&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_genres=16&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_genres=18&sort_by=popularity.desc'),
      fetchEndpoint('/discover/tv?with_genres=10759&sort_by=popularity.desc'),
      fetchEndpoint('/discover/tv?with_genres=10765&sort_by=popularity.desc'),
      fetchEndpoint('/discover/tv?with_genres=16&sort_by=popularity.desc'),
      fetchEndpoint('/discover/movie?with_original_language=hi&sort_by=popularity.desc'),
      fetchEndpoint('/discover/tv?with_original_language=hi&sort_by=popularity.desc')
    ]);

    const itemsMap = new Map();

    // 1. Ensure Taskaree: The Smuggler's Web is loaded dynamically as #1 headline item
    if (taskareeList && taskareeList.length > 0) {
      const taskareeRaw = { ...taskareeList[0], media_type: 'tv' };
      const formattedTaskaree = formatTmdbItem(taskareeRaw, [
        'trending',
        'top10',
        'latest',
        'series',
        'action'
      ]);
      formattedTaskaree.rank = 1;
      itemsMap.set(String(formattedTaskaree.tmdbId), formattedTaskaree);
    }

    // 2. Add Trending (Top 10)
    let rank = 2;
    for (const raw of trendingList) {
      const formatted = formatTmdbItem(raw, ['trending']);
      if (rank <= 10) {
        formatted.categories.push('top10');
        formatted.rank = rank++;
      }
      const keyId = String(formatted.tmdbId);
      if (!itemsMap.has(keyId)) {
        itemsMap.set(keyId, formatted);
      }
    }

    // 3. Add Now Playing Movies (Latest Releases)
    for (const raw of nowPlayingList) {
      const formatted = formatTmdbItem({ ...raw, media_type: 'movie' }, ['latest']);
      const keyId = String(formatted.tmdbId);
      if (itemsMap.has(keyId)) {
        if (!itemsMap.get(keyId).categories.includes('latest')) {
          itemsMap.get(keyId).categories.push('latest');
        }
      } else {
        itemsMap.set(keyId, formatted);
      }
    }

    // 4. Helper to insert media without duplicates
    const insertItems = (list, defaultType, defaultCat) => {
      if (!Array.isArray(list)) return;
      for (const raw of list) {
        const itemType = raw.media_type || defaultType;
        const formatted = formatTmdbItem({ ...raw, media_type: itemType }, [defaultCat]);
        const keyId = String(formatted.tmdbId);
        if (!itemsMap.has(keyId)) {
          itemsMap.set(keyId, formatted);
        } else if (!itemsMap.get(keyId).categories.includes(defaultCat)) {
          itemsMap.get(keyId).categories.push(defaultCat);
        }
      }
    };

    insertItems(popularMoviesList, 'movie', 'trending');
    insertItems(popularTvList, 'tv', 'series');
    insertItems(popularTvPage2, 'tv', 'series');
    insertItems(topRatedTvList, 'tv', 'series');
    insertItems(crimeTvList, 'tv', 'series');
    insertItems(romanceMoviesList, 'movie', 'romance');
    insertItems(romanceTvList, 'tv', 'romance');
    insertItems(actionMoviesList, 'movie', 'action');
    insertItems(scifiMoviesList, 'movie', 'scifi');
    insertItems(animationMoviesList, 'movie', 'animation');
    insertItems(dramaMoviesList, 'movie', 'drama');
    insertItems(actionTvList, 'tv', 'action');
    insertItems(scifiTvList, 'tv', 'scifi');
    insertItems(animationTvList, 'tv', 'animation');
    insertItems(hindiMoviesList, 'movie', 'trending');
    insertItems(hindiTvList, 'tv', 'series');

    const liveCatalog = Array.from(itemsMap.values());
    return liveCatalog.length > 0 ? liveCatalog : null;
  } catch (err) {
    console.warn('Failed to fetch live TMDB catalog:', err.message);
    return null;
  }
}

/**
 * Standalone Client-Side Status Check
 * Vidrift is hosted externally and does not require a local backend server.
 */
export async function checkBackendStatus() {
  return {
    online: true,
    standalone: true,
    name: 'Vidrift Cloud Stream',
    version: '1.0.0',
    providersNote: 'Direct browser embed via embed.vidrift.net (No backend required)',
    endpoints: {
      vidrift: 'https://embed.vidrift.net'
    }
  };
}
