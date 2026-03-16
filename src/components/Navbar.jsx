import './Navbar.css';

export default function Navbar() {
  return (
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

      <a href="#cta" className="navbar-cta">
        Get Started →
      </a>
    </nav>
  );
}
