import React from 'react';
import './MobileMenu.css';

export default function MobileMenu({ isOpen, onToggle, onEnterApp, onOpenAuth }) {
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <div className="mobile-menu-overlay" onClick={onToggle}></div>
      <div className="mobile-menu-content">
        <div className="mobile-menu-header">
          <div className="navbar-brand">
            <span className="navbar-brand-name">
              Study<span>Brain</span> AI
            </span>
          </div>
          <button className="mobile-close" onClick={onToggle} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <ul className="mobile-links">
          <li><a href="#product" onClick={onToggle}>Product Overview</a></li>
          <li><a href="#features" onClick={onToggle}>Features & RAG</a></li>
          <li><a href="#how" onClick={onToggle}>How it works</a></li>
          <li><a href="#tech" onClick={onToggle}>Tech Architecture</a></li>
          <li><a href="#usecases" onClick={onToggle}>Student Use Cases</a></li>
        </ul>
        
        <div className="mobile-menu-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => { 
              if (onOpenAuth) onOpenAuth('login'); 
              else onEnterApp(); 
              onToggle(); 
            }} 
            className="btn-ghost"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px' }}
          >
            Sign In to Vault
          </button>

          <button 
            onClick={() => { 
              if (onOpenAuth) onOpenAuth('register'); 
              else onEnterApp(); 
              onToggle(); 
            }} 
            className="btn-ghost"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            Create Account
          </button>

          <button onClick={() => { onEnterApp(); onToggle(); }} className="btn-primary" style={{ width: '100%' }}>
            Enter Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
