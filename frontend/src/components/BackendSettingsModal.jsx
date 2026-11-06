import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Key, ExternalLink, SlidersHorizontal, Cpu } from 'lucide-react';
import {
  getStoredTmdbKey,
  setStoredTmdbKey
} from '../services/api';

export default function BackendSettingsModal({ onClose, onStatusChange }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setApiKeyInput(getStoredTmdbKey());
    if (onStatusChange) {
      onStatusChange({
        online: true,
        standalone: true,
        name: 'Cloud Stream',
        version: '1.0.0'
      });
    }
  }, [onStatusChange]);

  const handleSaveKey = () => {
    setStoredTmdbKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const testTmdbConnection = async () => {
    if (!apiKeyInput) {
      setTestResult({ success: false, message: 'Please enter a TMDB API key to test' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/550?api_key=${apiKeyInput.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `TMDB Key verified successfully! Connected to: "${data.title}" (${data.release_date})`
        });
      } else {
        setTestResult({
          success: false,
          message: `TMDB rejected key with HTTP status ${res.status}. Please check your key.`
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="settings-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title-row">
            <SlidersHorizontal size={20} className="text-red" />
            <h2>Settings &amp; Configuration</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Architecture Status Card */}
          <div className="settings-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <Cpu size={18} color="#46d369" />
                <h3>Architecture Status</h3>
              </div>
              <span className="badge-standalone" style={{
                background: 'rgba(70, 211, 105, 0.15)',
                color: '#46d369',
                border: '1px solid rgba(70, 211, 105, 0.3)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: 700
              }}>
                100% Client-Side
              </span>
            </div>

            <div className="status-indicator-box">
              <div className="status-badge-active">
                <CheckCircle2 size={20} color="#46d369" />
                <div>
                  <strong>No Local Backend Server Required</strong>
                  <p style={{ marginTop: '4px', fontSize: '0.82rem', color: '#ccc', lineHeight: 1.4 }}>
                    Streams are loaded directly via secure CDN embed. All catalog data, bookmarks, search, and controls run in your browser with zero server maintenance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TMDB Key Configuration */}
          <div className="settings-card">
            <div className="card-title-group">
              <Key size={18} />
              <h3>TMDB API Key (Live Metadata &amp; Cloud Search)</h3>
            </div>
            <p className="card-desc">
              Powers live cloud search and high-resolution posters/backdrops. A default key is already pre-configured.
            </p>

            <div className="input-with-action">
              <input
                type="text"
                placeholder="Paste custom TMDB API Key (v3)..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="settings-input"
              />
              <button className="btn btn-primary" onClick={handleSaveKey}>
                Save Key
              </button>
            </div>

            {savedSuccess && (
              <div className="save-alert">
                <CheckCircle2 size={16} /> Saved! Key stored in browser localStorage.
              </div>
            )}

            <div className="key-actions-row">
              <button
                className="btn btn-secondary small"
                onClick={testTmdbConnection}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Key'}
              </button>

              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="link-external"
              >
                <span>Get a Free TMDB Key</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {testResult && (
              <div className={`test-result-box ${testResult.success ? 'success' : 'error'}`}>
                {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
