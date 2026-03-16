import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-badge">
        <span className="hero-badge-dot" />
        AI-Powered · RAG · Multi-Modal · Adaptive
      </div>

      <h1 className="hero-title">
        <span className="hero-title-line1">Your Personal</span>
        <span className="hero-title-line2">Study Brain</span>
      </h1>

      <p className="hero-subtitle">
        Upload your study materials, ask questions, generate quizzes,
        and get personalised AI explanations — all in one cinematic workspace.
      </p>

      <div className="hero-actions">
        <a href="#cta" className="btn-primary">Start Studying Free →</a>
        <a href="#how" className="btn-ghost">See How It Works</a>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-value">192</span>
          <span className="hero-stat-label">Frame Cinematic Intro</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">5</span>
          <span className="hero-stat-label">AI-Powered Phases</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">∞</span>
          <span className="hero-stat-label">Study Topics</span>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-hint-label">Scroll to explore</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
