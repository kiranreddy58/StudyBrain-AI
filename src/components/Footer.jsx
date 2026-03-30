import './Footer.css';

export default function Footer({ onEnterApp }) {
  return (
    <footer className="footer">
      <a href="#top" className="footer-brand">StudyBrain AI</a>
      <p className="footer-copy">© 2026 StudyBrain AI — AI-Powered Learning Platform</p>
      <ul className="footer-links">
        <li><a href="#product">Product</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#tech">Tech Stack</a></li>
        <li><button onClick={onEnterApp} className="footer-btn-link">Get Started</button></li>
      </ul>
    </footer>
  );
}
