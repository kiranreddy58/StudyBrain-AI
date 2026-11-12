import { useState, useEffect } from 'react';
import MobileMenu from './layout/MobileMenu';
import './Navbar.css';
import { getCurrentUser } from '../utils/api';

export default function Navbar({ onEnterApp, onOpenAuth }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleAuth = () => setUser(getCurrentUser());
    window.addEventListener('sb_auth_changed', handleAuth);
    return () => window.removeEventListener('sb_auth_changed', handleAuth);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="navbar">
        <a href="#top" className="navbar-brand">
          <span className="navbar-brand-name">
            Study<span>Brain</span> AI
          </span>
        </a>

        <ul className="navbar-links">
          <li><a href="#product">Product</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#tech">Tech</a></li>
          <li><a href="#usecases">Use Cases</a></li>
        </ul>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <button onClick={onEnterApp} className="navbar-cta">
              Open Vault
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : onEnterApp()}
                className="navbar-signin-btn"
              >
                Sign In
              </button>

              <button 
                onClick={() => onOpenAuth ? onOpenAuth('register') : onEnterApp()} 
                className="navbar-cta"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      <MobileMenu
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
        onEnterApp={onEnterApp}
        onOpenAuth={onOpenAuth}
      />
    </>
  );
}
