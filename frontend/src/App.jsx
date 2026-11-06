import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaRow from './components/MediaRow';
import DetailModal from './components/DetailModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import BackendSettingsModal from './components/BackendSettingsModal';
import MediaCard from './components/MediaCard';
import { CATALOG } from './data/mockCatalog';
import {
  checkBackendStatus,
  searchTmdb,
  fetchLiveTmdbCatalog,
  resolveTmdbMedia,
  getStoredWatchHistory,
  recordWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory
} from './services/api';
import { Film, HeartCrack, History, Trash2, Bookmark } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [catalog, setCatalog] = useState(CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [myList, setMyList] = useState([]);
  const [watchHistory, setWatchHistory] = useState(() => getStoredWatchHistory());
  const [myListSubTab, setMyListSubTab] = useState('saved'); // 'saved' | 'history'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [playingMedia, setPlayingMedia] = useState(null);
  const [playerSeason, setPlayerSeason] = useState(1);
  const [playerEpisode, setPlayerEpisode] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ online: false, stats: null });
  const [liveTmdbResults, setLiveTmdbResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  // 1. Load initial My List from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cinepro_my_list');
      if (saved) {
        setMyList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse my_list from localStorage:', e);
    }
  }, []);

  // 2. Initialize streaming engine status
  useEffect(() => {
    checkBackendStatus().then(setBackendStatus);
  }, []);

  // 3. Load dynamic catalog directly from TMDB Cloud
  useEffect(() => {
    let isMounted = true;
    fetchLiveTmdbCatalog().then((liveCatalog) => {
      if (isMounted && liveCatalog && liveCatalog.length > 0) {
        setCatalog(liveCatalog);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle My List
  const handleToggleMyList = (media) => {
    setMyList((prev) => {
      const exists = prev.some((item) => item.id === media.id);
      let updated;
      if (exists) {
        updated = prev.filter((item) => item.id !== media.id);
      } else {
        updated = [media, ...prev];
      }
      try {
        localStorage.setItem('cinepro_my_list', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Play Media - Dynamically resolves TMDB ID & records to user watch history in localStorage
  const handlePlay = async (media, season = 1, episode = 1) => {
    let resolved = media;
    try {
      const liveResolved = await resolveTmdbMedia(media);
      if (liveResolved) {
        resolved = liveResolved;
      }
    } catch (err) {
      console.warn('Dynamic TMDB resolution skipped:', err);
    }
    const updatedHistory = recordWatchHistory(resolved, season, episode);
    setWatchHistory(updatedHistory);
    setPlayingMedia(resolved);
    setPlayerSeason(season);
    setPlayerEpisode(episode);
  };

  // Next Episode for Series with automatic history sync
  const handleNextEpisode = () => {
    if (!playingMedia || playingMedia.type !== 'tv') return;
    const currentSeasonData = playingMedia.seasons?.find((s) => s.seasonNumber === playerSeason);
    if (!currentSeasonData) return;

    let targetSeason = playerSeason;
    let targetEp = playerEpisode + 1;

    if (playerEpisode < currentSeasonData.episodes.length) {
      setPlayerEpisode(targetEp);
    } else {
      // Check if next season exists
      const nextSeasonNum = playerSeason + 1;
      const nextSeasonData = playingMedia.seasons?.find((s) => s.seasonNumber === nextSeasonNum);
      if (nextSeasonData && nextSeasonData.episodes.length > 0) {
        targetSeason = nextSeasonNum;
        targetEp = 1;
        setPlayerSeason(nextSeasonNum);
        setPlayerEpisode(1);
      } else {
        return;
      }
    }
    const updated = recordWatchHistory(playingMedia, targetSeason, targetEp);
    setWatchHistory(updated);
  };

  // Prev Episode for Series with automatic history sync
  const handlePrevEpisode = () => {
    if (!playingMedia || playingMedia.type !== 'tv') return;
    if (playerEpisode > 1) {
      const prevEp = playerEpisode - 1;
      setPlayerEpisode(prevEp);
      const updated = recordWatchHistory(playingMedia, playerSeason, prevEp);
      setWatchHistory(updated);
    }
  };

  // Jump to specific episode with automatic history sync
  const handleSelectEpisode = (seasonNum, epNum) => {
    setPlayerSeason(seasonNum);
    setPlayerEpisode(epNum);
    const updated = recordWatchHistory(playingMedia, seasonNum, epNum);
    setWatchHistory(updated);
  };

  // Remove a specific title from watch history in localStorage
  const handleRemoveFromHistory = (mediaId) => {
    const updated = removeFromWatchHistory(mediaId);
    setWatchHistory(updated);
  };

  // Clear all watch history from localStorage
  const handleClearHistory = () => {
    const updated = clearWatchHistory();
    setWatchHistory(updated);
  };

  // Debounced Live TMDB Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLiveTmdbResults([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchTmdb(searchQuery.trim());
        setLiveTmdbResults(results);
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combined Results: Instant Local Catalog + Live TMDB Search
  const localResults = searchQuery.trim()
    ? catalog.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.genres.some((g) => g.toLowerCase().includes(query)) ||
          item.cast?.some((c) => c.toLowerCase().includes(query)) ||
          item.overview.toLowerCase().includes(query)
        );
      })
    : [];

  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const seen = new Set();
    const merged = [];

    // Add local results first for instant rendering
    for (const item of localResults) {
      seen.add(String(item.tmdbId));
      seen.add(item.title.toLowerCase());
      merged.push(item);
    }

    // Append cloud TMDB results
    for (const item of liveTmdbResults) {
      const idKey = String(item.tmdbId);
      const titleKey = item.title.toLowerCase();
      if (!seen.has(idKey) && !seen.has(titleKey)) {
        seen.add(idKey);
        seen.add(titleKey);
        merged.push(item);
      }
    }

    return merged;
  })();

  // Featured Blockbusters for Hero Banner
  const featuredList = catalog.filter((m) =>
    activeTab === 'movies' ? m.type === 'movie' : activeTab === 'series' ? m.type === 'tv' : true
  ).slice(0, 6);

  // Filter Continue Watching for Current Tab (from local storage)
  const continueWatchingList = watchHistory.filter((item) => {
    if (activeTab === 'movies') return item.type === 'movie';
    if (activeTab === 'series') return item.type === 'tv';
    return true;
  });

  // Unique Sections Generator ensuring NO movie is ever duplicated across any section
  const sections = useMemo(() => {
    let pool = catalog.filter((item) => {
      if (activeTab === 'movies') return item.type === 'movie';
      if (activeTab === 'series') return item.type === 'tv';
      return true;
    });

    const used = new Set();
    const markUsed = (item) => {
      if (!item) return;
      if (item.id) used.add(item.id);
      if (item.tmdbId) used.add(String(item.tmdbId));
      if (item.title) used.add(item.title.toLowerCase().trim());
    };
    const isUsed = (item) => {
      if (!item) return true;
      if (item.id && used.has(item.id)) return true;
      if (item.tmdbId && used.has(String(item.tmdbId))) return true;
      if (item.title && used.has(item.title.toLowerCase().trim())) return true;
      return false;
    };

    const result = [];

    // 1. Top 10 Row (Rank 1-10 exclusively)
    const top10Candidates = pool
      .filter((m) => !isUsed(m) && (m.rank || m.categories?.includes('top10')))
      .sort((a, b) => (a.rank || 99) - (b.rank || 99) || (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 10);

    if (top10Candidates.length < 10) {
      const topUp = pool
        .filter((m) => !isUsed(m) && !top10Candidates.some((c) => c.id === m.id))
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 10 - top10Candidates.length);
      top10Candidates.push(...topUp);
    }
    top10Candidates.forEach(markUsed);

    if (top10Candidates.length > 0) {
      result.push({
        id: 'top10',
        title:
          activeTab === 'movies'
            ? 'Top 10 Movies Today'
            : activeTab === 'series'
            ? 'Top 10 Shows Today'
            : 'Top 10 Today',
        isTop10: true,
        items: top10Candidates
      });
    }

    const isAnim = (m) =>
      m.genres?.some((g) => /anim/i.test(g)) || m.categories?.includes('animation');

    // 2. Specific category sections: Romance on top, Anime at bottom
    const categoryConfigs = [
      // Romance ON TOP (immediately under Top 10)
      {
        id: 'romance',
        title:
          activeTab === 'movies'
            ? 'Romantic Movies & Love Stories'
            : activeTab === 'series'
            ? 'Romantic Series & Drama'
            : 'Romantic Movies & Series',
        match: (m) =>
          !isAnim(m) &&
          (m.genres?.some((g) => /romance|romantic/i.test(g)) || m.categories?.includes('romance'))
      },
      // New Releases
      {
        id: 'latest',
        title:
          activeTab === 'movies'
            ? 'New Movie Releases'
            : activeTab === 'series'
            ? 'New Series Releases'
            : 'New Releases',
        match: (m) => !isAnim(m) && (m.releaseYear >= 2024 || m.categories?.includes('latest'))
      },
      // Binge-Worthy Series for All tab
      ...(activeTab === 'all'
        ? [
            {
              id: 'series',
              title: 'Binge-Worthy TV Series',
              match: (m) => !isAnim(m) && m.type === 'tv'
            }
          ]
        : []),
      // Action & Thriller
      {
        id: 'action',
        title: activeTab === 'series' ? 'Action & Thriller Series' : 'Action & Thriller',
        match: (m) =>
          !isAnim(m) &&
          (m.genres?.some((g) => /action|thriller/i.test(g)) || m.categories?.includes('action'))
      },
      // Sci-Fi & Fantasy
      {
        id: 'scifi',
        title: activeTab === 'series' ? 'Sci-Fi & Fantasy Series' : 'Sci-Fi & Fantasy',
        match: (m) =>
          !isAnim(m) &&
          (m.genres?.some((g) => /sci-fi|fantasy/i.test(g)) || m.categories?.includes('scifi'))
      },
      // Drama & Crime
      {
        id: 'drama',
        title: activeTab === 'series' ? 'Drama & Crime Series' : 'Drama & Crime',
        match: (m) =>
          !isAnim(m) &&
          (m.genres?.some((g) => /drama|crime/i.test(g)) || m.categories?.includes('drama'))
      },
      // Trending Now
      {
        id: 'trending',
        title:
          activeTab === 'movies'
            ? 'Trending Movies'
            : activeTab === 'series'
            ? 'Trending Shows'
            : 'Trending Now',
        match: (m) => !isAnim(m) && (m.categories?.includes('trending') || (m.rating || 0) >= 7.0)
      },
      // Fan Favorites & Blockbusters
      {
        id: 'favorites',
        title: 'Fan Favorites & Blockbusters',
        match: (m) => !isAnim(m)
      },
      // Anime & Animation AT THE VERY BOTTOM
      {
        id: 'animation',
        title: activeTab === 'series' ? 'Anime & Animated Series' : 'Animation & Anime',
        match: (m) => isAnim(m)
      }
    ];

    for (const config of categoryConfigs) {
      const matched = pool.filter((m) => !isUsed(m) && config.match(m));
      const chosen = matched.slice(0, 12);
      if (chosen.length > 0) {
        chosen.forEach(markUsed);
        result.push({
          id: config.id,
          title: config.title,
          items: chosen
        });
      }
    }

    return result;
  }, [catalog, activeTab]);

  return (
    <div className="app-root">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSettings={() => setShowSettings(true)}
        myListCount={myList.length}
      />

      {/* Main View Switching */}
      {searchQuery.trim() ? (
        /* SEARCH RESULTS VIEW */
        <main className="view-container">
          <div className="view-header">
            <h1 className="view-title">Search Results</h1>
            <p className="view-subtitle">
              Found {searchResults.length} title{searchResults.length === 1 ? '' : 's'} matching "{searchQuery}"
              {isSearchingLive && (
                <span style={{ marginLeft: '12px', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                  • Searching TMDB Cloud...
                </span>
              )}
            </p>
          </div>

          {searchResults.length > 0 ? (
            <div className="media-adaptive-grid">
              {searchResults.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onPlay={handlePlay}
                  onMoreInfo={setSelectedMedia}
                  myList={myList}
                  onToggleMyList={handleToggleMyList}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Film size={48} />
              <h3>No matching movies or series</h3>
              <p>Try searching for a different title, actor, or genre like "Action", "Sci-Fi", or "Christopher Nolan".</p>
            </div>
          )}
        </main>
      ) : activeTab === 'my-list' ? (
        /* MY LIST & WATCH HISTORY VIEW */
        <main className="view-container">
          <div className="view-header">
            <div className="view-header-top">
              <div>
                <h1 className="view-title">
                  {myListSubTab === 'saved' ? 'My Saved Watchlist' : 'Watch History'}
                </h1>
                <p className="view-subtitle">
                  {myListSubTab === 'saved'
                    ? 'Your bookmarked movies & TV series'
                    : 'Recently viewed movies & episodes stored securely in browser'}
                </p>
              </div>

              {myListSubTab === 'history' && watchHistory.length > 0 && (
                <button
                  className="clear-history-btn"
                  onClick={handleClearHistory}
                  title="Clear all watch history"
                >
                  <Trash2 size={15} />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {/* Sub-Tabs: Saved Watchlist vs Watch History */}
            <div className="list-subtabs">
              <button
                className={`subtab-btn ${myListSubTab === 'saved' ? 'active' : ''}`}
                onClick={() => setMyListSubTab('saved')}
              >
                <Bookmark size={15} />
                <span>Saved Titles ({myList.length})</span>
              </button>
              <button
                className={`subtab-btn ${myListSubTab === 'history' ? 'active' : ''}`}
                onClick={() => setMyListSubTab('history')}
              >
                <History size={15} />
                <span>Watch History ({watchHistory.length})</span>
              </button>
            </div>
          </div>

          {myListSubTab === 'saved' ? (
            myList.length > 0 ? (
              <div className="media-adaptive-grid">
                {myList.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onPlay={handlePlay}
                    onMoreInfo={setSelectedMedia}
                    myList={myList}
                    onToggleMyList={handleToggleMyList}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <HeartCrack size={52} color="#E50914" />
                <h3>Your watchlist is empty</h3>
                <p>Explore titles on the home page and click the + button to save your favorites here.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={() => setActiveTab('all')}
                >
                  Browse Popular Titles
                </button>
              </div>
            )
          ) : (
            watchHistory.length > 0 ? (
              <div className="media-adaptive-grid">
                {watchHistory.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onPlay={handlePlay}
                    onMoreInfo={setSelectedMedia}
                    myList={myList}
                    onToggleMyList={handleToggleMyList}
                    onRemoveFromHistory={handleRemoveFromHistory}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <History size={52} color="#8888aa" />
                <h3>No watch history yet</h3>
                <p>Whenever you start streaming movies or series, they will be automatically remembered here so you can pick up right where you left off.</p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={() => setActiveTab('all')}
                >
                  Start Watching Now
                </button>
              </div>
            )
          )}
        </main>
      ) : (
        /* DEFAULT BROWSING HOME / MOVIES / SERIES / TRENDING VIEW */
        <main>
          {/* Cinematic Hero Billboard */}
          <HeroBanner
            featuredList={featuredList}
            onPlay={handlePlay}
            onMoreInfo={setSelectedMedia}
            myList={myList}
            onToggleMyList={handleToggleMyList}
          />

          {/* Categorized Rows */}
          <div className="main-content">
            {/* Continue Watching Row (from user watch history in localStorage) */}
            {continueWatchingList.length > 0 && (
              <MediaRow
                title="Continue Watching"
                items={continueWatchingList}
                onPlay={handlePlay}
                onMoreInfo={setSelectedMedia}
                myList={myList}
                onToggleMyList={handleToggleMyList}
                onRemoveFromHistory={handleRemoveFromHistory}
              />
            )}

            {/* Unique Dynamic Rows (Zero Duplication Across All Sections) */}
            {sections.map((section) => (
              <MediaRow
                key={section.id}
                title={section.title}
                items={section.items}
                isTop10={section.isTop10}
                onPlay={handlePlay}
                onMoreInfo={setSelectedMedia}
                myList={myList}
                onToggleMyList={handleToggleMyList}
              />
            ))}
          </div>
        </main>
      )}

      {/* Detail Modal */}
      {selectedMedia && (
        <DetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPlay={handlePlay}
          myList={myList}
          onToggleMyList={handleToggleMyList}
          catalog={catalog}
        />
      )}

      {/* Video Player Cinema Modal */}
      {playingMedia && (
        <VideoPlayerModal
          media={playingMedia}
          season={playerSeason}
          episode={playerEpisode}
          onClose={() => setPlayingMedia(null)}
          onNextEpisode={handleNextEpisode}
          onPrevEpisode={handlePrevEpisode}
          onSelectEpisode={handleSelectEpisode}
          onHistoryUpdated={() => setWatchHistory(getStoredWatchHistory())}
        />
      )}

      {/* Backend Settings & TMDB Modal */}
      {showSettings && (
        <BackendSettingsModal
          onClose={() => setShowSettings(false)}
          onStatusChange={setBackendStatus}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-letter">C</span>INE<span className="brand-highlight">PRO</span> STREAM
          </div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setActiveTab('all')}>Home</button>
            <button className="footer-link" onClick={() => setActiveTab('movies')}>Movies</button>
            <button className="footer-link" onClick={() => setActiveTab('series')}>TV Shows</button>
            <button className="footer-link" onClick={() => setShowSettings(true)}>Streaming Settings</button>
            <a href="https://embed.vidrift.net" target="_blank" rel="noreferrer" className="footer-link">
              Vidrift Embed
            </a>
          </div>
          <p className="footer-disclaimer">
            This project is for personal &amp; educational purposes. All movies and TV series stream directly via Vidrift Premier embed with Multi-Audio &amp; Subtitle capabilities. No local backend or proxy is required.
          </p>
        </div>
      </footer>
    </div>
  );
}
