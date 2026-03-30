import React from 'react';
import './MobileMenu.css';

export default function MobileMenu({ isOpen, onToggle, onEnterApp }) {
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
      <div className="mobile-menu-overlay" onClick={onToggle}></div>
      <div className="mobile-menu-content">
        <div className="mobile-menu-header">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">🧠</div>
            <span className="navbar-brand-name">
              Study<span>Brain</span>
            </span>
          </div>
          <button className="mobile-close" onClick={onToggle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <ul className="mobile-links">
          <li><a href="#product" onClick={onToggle}>Product</a></li>
          <li><a href="#features" onClick={onToggle}>Features</a></li>
          <li><a href="#how" onClick={onToggle}>How it works</a></li>
          <li><a href="#tech" onClick={onToggle}>Tech</a></li>
          <li><a href="#usecases" onClick={onToggle}>Use Cases</a></li>
        </ul>
        
        <div className="mobile-menu-footer">
          <button onClick={() => { onEnterApp(); onToggle(); }} className="btn-primary">
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}
