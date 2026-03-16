import { useState, useEffect } from 'react';
import './Settings.css';
import { User, Shield, Zap, Bell, Save } from 'lucide-react';

export default function Settings() {
  const [activeToggles, setActiveToggles] = useState(['ai-optimize', 'notifications']);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [model, setModel] = useState('StudyBrain Ultra (Gemini Flash)');
  const [saved, setSaved] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('sb_displayName');
    const savedEmail = localStorage.getItem('sb_email');
    const savedModel = localStorage.getItem('sb_model');
    const savedToggles = localStorage.getItem('sb_toggles');

    if (savedName) setDisplayName(savedName);
    if (savedEmail) setEmail(savedEmail);
    if (savedModel) setModel(savedModel);
    if (savedToggles) setActiveToggles(JSON.parse(savedToggles));
  }, []);

  const toggle = (id) => {
    setActiveToggles(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    localStorage.setItem('sb_displayName', displayName);
    localStorage.setItem('sb_email', email);
    localStorage.setItem('sb_model', model);
    localStorage.setItem('sb_toggles', JSON.stringify(activeToggles));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Dispatch custom event so App.jsx can instantly read the new name
    window.dispatchEvent(new Event('sb_settings_updated'));
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
              <option value="auto">Smart Selection (Ollama Preferred)</option>
              <option value="ollama">Local System (Ollama llama3)</option>
              <option value="gemini">Cloud Enhanced (Gemini Flash)</option>
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
