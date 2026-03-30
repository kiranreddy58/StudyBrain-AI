import { useEffect, useRef } from 'react';

function useReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current.classList.add('visible');
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}

function GlassCard({ tag, title, body, children, className = '' }) {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <div ref={ref} className={`glass-card ${className}`}>
      {tag && <span className="card-tag">{tag}</span>}
      {title && <h2 className="card-title">{title}</h2>}
      <div className="card-divider" />
      {body && <p className="card-body">{body}</p>}
      {children}
    </div>
  );
}

export default function ContentSections({ onEnterApp }) {
  const finaleTitleRef = useRef(null);
  const finaleSubRef = useRef(null);
  const finaleCtaRef = useRef(null);
  useReveal(finaleTitleRef);
  useReveal(finaleSubRef);
  useReveal(finaleCtaRef);

  return (
    <>
      {/* ── HERO ──────────────────────────────────── */}
      <section className="hero-section">
        <span className="hero-eyebrow">Experience · The Future · Now</span>
        <h1 className="hero-title">
          Neural<br />Expanse
        </h1>
        <p className="hero-subtitle">
          A cinematic journey through 192 frames of exploding reality.
          Scroll to control time itself.
        </p>
        <div className="hero-cta">
          <a href="#discover" className="btn-ghost">
            Begin the Journey ↓
          </a>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span className="scroll-hint-label">Scroll</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ── SPACER: let scroll drive frames ────── */}
      <div className="content-spacer" />

      {/* ── SECTION 1 (right-aligned) ────────────── */}
      <section id="discover" className="content-section right">
        <GlassCard
          tag="Chapter I"
          title="Shattering Perception"
          body="Every neuron fires at the edge of comprehension. As glass meets consciousness, the boundaries between thought and reality begin to dissolve — frame by frame, moment by moment."
        >
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-value">192</span>
              <span className="stat-label">Frames</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">60fps</span>
              <span className="stat-label">Playback</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">∞</span>
              <span className="stat-label">Depth</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ── SPACER ─────────────────────────────── */}
      <div className="content-spacer" />

      {/* ── SECTION 2 (left-aligned) ─────────────── */}
      <section className="content-section left">
        <GlassCard
          tag="Chapter II"
          title="Beyond the Glass Veil"
          body="At the apex of the sequence, matter transforms. The crystal lattice fractures outward in a cascade of photons and precision — a visual metaphor for the moment ideas crystallize into existence."
        >
          <p className="card-body" style={{ marginBottom: 0, marginTop: '-0.5rem' }}>
            Powered by Canvas API · Driven entirely by scroll position · No dependencies beyond React
          </p>
        </GlassCard>
      </section>

      {/* ── SPACER → finale ────────────────────── */}
      <div style={{ height: '100vh' }} />

      {/* ── FINALE ───────────────────────────────── */}
      <section className="finale-section">
        <h2 ref={finaleTitleRef} className="finale-title">
          Beyond<br />The Frame
        </h2>
        <p ref={finaleSubRef} className="finale-sub">
          The sequence is complete. The moment is yours.
        </p>
        <div ref={finaleCtaRef} className="finale-cta">
          <a href="#top" className="btn-primary">
            Replay ↑
          </a>
          <button onClick={onEnterApp} className="btn-ghost">
            Get Started →
          </button>
        </div>
      </section>
    </>
  );
}
