import { useState } from 'react';
import MobileMenu from './layout/MobileMenu';
import './Navbar.css';

export default function Navbar({ onEnterApp }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="navbar">
      <a href="#top" className="navbar-brand">
        <div className="navbar-brand-icon">🧠</div>
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

      <button onClick={onEnterApp} className="navbar-cta">
        Get Started →
      </button>

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
    />
  </>
  );
}
