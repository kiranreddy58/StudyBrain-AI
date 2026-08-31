import { useState, useEffect } from 'react';
import './Settings.css';
import { User, Shield, Zap, Bell, Save } from 'lucide-react';

export default function Settings() {
  const [activeToggles, setActiveToggles] = useState(['ai-optimize', 'notifications']);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [model, setModel] = useState('groq');
  const [saved, setSaved] = useState(false);

  // Load from database on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const { settings } = await res.json();
          if (settings.displayName) setDisplayName(settings.displayName);
          if (settings.email) setEmail(settings.email);
          if (settings.model) setModel(settings.model);
          if (settings.toggles) setActiveToggles(settings.toggles);
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
        fetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'displayName', value: displayName })
        }),
        fetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'email', value: email })
        }),
        fetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'model', value: model })
        }),
        fetch('/api/settings/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'toggles', value: JSON.stringify(activeToggles) })
        })
      ];

      await Promise.all(updates);
      
      // Also update local storage for synchronous reads in other components
      localStorage.setItem('sb_model', model);
      localStorage.setItem('sb_displayName', displayName);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new Event('sb_settings_updated'));
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save settings to server.");
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><User size={20} color="var(--color-accent)" /> Account Profile</h3>
        </div>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><Zap size={20} color="var(--color-accent-2)" /> AI Preferences</h3>
        </div>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label">Default LLM Model</label>
            <select 
              className="form-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="groq">Groq Ultra-Fast (GPT-OSS 120B)</option>
              <option value="qwen">Groq Ultra-Fast (Qwen 3.8 27B)</option>
              <option value="llama">Groq Ultra-Fast (Llama 3.3 70B)</option>
            </select>
          </div>
          
          <div className="settings-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Auto-Optimize context</span>
              <span className="toggle-desc">Automatically prune irrelevant document chunks for faster answers.</span>
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

      <div className="settings-section">
        <div className="settings-header">
          <h3 className="settings-title"><Bell size={20} color="var(--color-accent-3)" /> Notifications</h3>
        </div>
        <div className="settings-grid">
          <div className="settings-toggle-row">
            <div className="toggle-info">
              <span className="toggle-label">Push Notifications</span>
              <span className="toggle-desc">Get alerted when your study materials are finished processing.</span>
            </div>
            <div 
              className={`toggle-switch ${activeToggles.includes('notifications') ? 'active' : ''}`}
              onClick={() => toggle('notifications')}
            >
              <div className="toggle-handle" />
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn-primary btn-save" 
        onClick={handleSave}
        style={{ backgroundColor: saved ? '#10b981' : 'var(--color-accent)' }}
      >
        <Save size={16} />
        {saved ? 'Saved Successfully!' : 'Save Changes'}
      </button>
    </div>
  );
}
