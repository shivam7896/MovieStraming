import React, { useState, useEffect } from 'react';
import {
  Search, X, SlidersHorizontal, Home, Tv, Film, Flame, Bookmark
} from 'lucide-react';
import { handleImageFallback, FALLBACK_AVATAR } from '../services/api';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  myListCount
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'all', label: 'Home' },
    { id: 'series', label: 'TV Shows' },
    { id: 'movies', label: 'Movies' },
    { id: 'trending', label: 'New & Popular' },
    { id: 'my-list', label: `My List ${myListCount > 0 ? `(${myListCount})` : ''}` }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Header Navbar */}
      <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left Side: Brand & Desktop Links */}
          <div className="navbar-left">
            <div className="brand-logo" onClick={() => handleTabClick('all')}>
              <span className="brand-letter">C</span>INE<span className="brand-highlight">PRO</span>
              <span className="brand-badge">STREAM</span>
            </div>

            <nav className="nav-links">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleTabClick(link.id)}
                  className={`nav-link ${activeTab === link.id && !searchQuery ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Side: Search, Settings, Profile */}
          <div className="navbar-right">
            {/* Search Box */}
            <div className={`search-container ${isSearchOpen || searchQuery ? 'open' : ''}`}>
              <button
                className="search-toggle-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Search titles, actors, genres"
                aria-label="Toggle search"
              >
                <Search size={18} />
              </button>
              <input
                type="text"
                placeholder="Titles, people, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus={isSearchOpen}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Settings Trigger */}
            <button
              className="icon-btn"
              onClick={onOpenSettings}
              title="Streaming Settings"
              aria-label="Streaming Settings"
            >
              <SlidersHorizontal size={18} />
            </button>

            {/* User Profile Avatar */}
            <div className="profile-badge" title="User Profile">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Profile"
                className="avatar-img"
                onError={(e) => handleImageFallback(e, FALLBACK_AVATAR)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Visible only on <= 768px screens) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button
          className={`mobile-nav-item ${activeTab === 'all' && !searchQuery ? 'active' : ''}`}
          onClick={() => handleTabClick('all')}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'series' && !searchQuery ? 'active' : ''}`}
          onClick={() => handleTabClick('series')}
        >
          <Tv size={20} />
          <span>Series</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'movies' && !searchQuery ? 'active' : ''}`}
          onClick={() => handleTabClick('movies')}
        >
          <Film size={20} />
          <span>Movies</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'trending' && !searchQuery ? 'active' : ''}`}
          onClick={() => handleTabClick('trending')}
        >
          <Flame size={20} />
          <span>New &amp; Hot</span>
        </button>

        <button
          className={`mobile-nav-item ${activeTab === 'my-list' && !searchQuery ? 'active' : ''}`}
          onClick={() => handleTabClick('my-list')}
        >
          <div className="mobile-bookmark-wrap">
            <Bookmark size={20} />
            {myListCount > 0 && <span className="mobile-nav-badge">{myListCount}</span>}
          </div>
          <span>My List</span>
        </button>
      </nav>
    </>
  );
}
