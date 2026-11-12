import './HeroSection.css';

export default function HeroSection({ onEnterApp }) {
  return (
    <section className="hero-section" id="top">
      <h1 className="hero-title">
        <span className="hero-title-line1">Your Personal</span>
        <span className="hero-title-line2">Study Brain</span>
      </h1>

      <p className="hero-subtitle">
        Upload your study materials, ask questions, generate quizzes,
        and get personalised AI explanations in one workspace.
      </p>

      <div className="hero-actions">
        <button onClick={onEnterApp} className="btn-primary">Start Studying</button>
        <a href="#product" className="btn-ghost">Explore Features</a>
      </div>
    </section>
  );
}
