import './HeroSection.css';

export default function HeroSection({ onEnterApp }) {
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
        <button onClick={onEnterApp} className="btn-primary">Start Studying Free →</button>
        <a href="#how" className="btn-ghost">See How It Works</a>
      </div>

      <div className="hero-stats">
        <div className="hero-stat">
          <span className="hero-stat-value">50k+</span>
          <span className="hero-stat-label">Documents Processed</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">Instant</span>
          <span className="hero-stat-label">AI Explanations</span>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-value">100%</span>
          <span className="hero-stat-label">Grounded Answers</span>
        </div>
      </div>

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-hint-label">Scroll to explore</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
