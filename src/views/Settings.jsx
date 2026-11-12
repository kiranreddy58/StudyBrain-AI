import { useState, useEffect } from 'react';
import './Settings.css';
import { User, Shield, Zap, Bell, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { authFetch, getCurrentUser, logoutUser } from '../utils/api';

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [activeToggles, setActiveToggles] = useState(['ai-optimize', 'notifications']);
  const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [model, setModel] = useState('groq');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await authFetch('/api/settings');
        if (res.ok) {
          const { settings } = await res.json();
          if (settings.displayName) setDisplayName(settings.displayName);
          if (settings.email) setEmail(settings.email);
          if (settings.model) setModel(settings.model);
          if (settings.toggles) {
            try {
              setActiveToggles(typeof settings.toggles === 'string' ? JSON.parse(settings.toggles) : settings.toggles);
            } catch {
              // fallback
            }
          }
        }
      } catch (err) {
        console.error("Failed to load settings from DB:", err);
      }
    }
    loadSettings();
  }, []);

  const toggle = (id) => {
    setActiveToggles(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      const updates = [
        authFetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'displayName', value: displayName })
        }),
        authFetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'email', value: email })
        }),
        authFetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'model', value: model })
        }),
        authFetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'toggles', value: JSON.stringify(activeToggles) })
        })
      ];

      await Promise.all(updates);
      
      localStorage.setItem('sb_model', model);
      localStorage.setItem('sb_displayName', displayName);

      // If user object is cached, update display name
      if (currentUser) {
        const updated = { ...currentUser, display_name: displayName };
        localStorage.setItem('sb_user', JSON.stringify(updated));
        setCurrentUser(updated);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new Event('sb_settings_updated'));
      window.dispatchEvent(new Event('sb_auth_changed'));
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save settings to server.");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out of StudyBrain?")) {
      logoutUser();
    }
  };

  return (
    <div className="settings-container">
      {/* Account Profile Section */}
      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><User size={20} color="var(--color-accent)" /> Account Profile</h3>
          {currentUser && (
            <span className="auth-pill active">
              Logged in as <strong>{currentUser.username}</strong>
            </span>
          )}
        </div>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={displayName}
              placeholder="e.g. Alex"
              onChange={(e) => setDisplayName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              placeholder="alex@example.com"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* AI Engine & Model Preferences */}
      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><Zap size={20} color="var(--color-accent-2)" /> AI Engine Preferences</h3>
        </div>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Groq LPU Inference Model</label>
            <select 
              className="form-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="groq">Groq Ultra-Fast (GPT-OSS 120B) - Recommended</option>
              <option value="qwen">Groq Ultra-Fast (Qwen 3.8 27B)</option>
              <option value="llama">Groq Ultra-Fast (Llama 3.3 70B Versatile)</option>
            </select>
          </div>
          
          <div className="settings-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Auto-Optimize Context</span>
              <span className="toggle-desc">Automatically prune irrelevant chunks for sub-second responses.</span>
            </div>
            <div 
              className={`toggle-switch ${activeToggles.includes('ai-optimize') ? 'active' : ''}`}
              onClick={() => toggle('ai-optimize')}
            >
              <div className="toggle-handle" />
            </div>
          </div>
        </div>
      </div>

      {/* Vault Security & Isolation */}
      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><Shield size={20} color="#10b981" /> Vault Security & Multi-Tenancy</h3>
        </div>
        <div className="settings-grid">
          <div className="security-notice">
            <div className="security-dot" />
            <p>
              Your materials, chat logs, and mastery scores are strictly isolated to your user ID. No other account on StudyBrain AI can access or query your knowledge vault.
            </p>
          </div>
        </div>
      </div>

      <div className="settings-actions-row">
        <button 
          className="btn-primary btn-save" 
          onClick={handleSave}
          style={{ backgroundColor: saved ? '#10b981' : 'var(--color-accent)' }}
        >
          {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saved ? 'Saved Successfully!' : 'Save Changes'}
        </button>

        {currentUser && (
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
