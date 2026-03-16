import { useEffect, useRef } from 'react';
import './CTASection.css';

export default function CTASection() {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef(null);
  const phasesRef = useRef(null);

  useEffect(() => {
    const targets = [titleRef, subRef, actionsRef, phasesRef];
    const observers = targets.map((ref) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) ref.current.classList.add('visible'); },
        { threshold: 0.3 }
      );
      observer.observe(ref.current);
      return observer;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <section className="cta-section" id="cta">
      <div className="cta-glow" aria-hidden="true" />

      <div className="cta-inner">
        <h2 ref={titleRef} className="cta-title">
          Ready to{' '}
          <span className="cta-title-grad">Study Smarter?</span>
        </h2>

        <p ref={subRef} className="cta-sub">
          Join the future of AI-powered education. Upload your first document,
          ask your first question, and experience the difference a personalised
          study brain makes.
        </p>

        <div ref={actionsRef} className="cta-actions">
          <a href="#" className="btn-primary">Start for Free →</a>
          <a href="#product" className="btn-ghost">Explore the Platform</a>
        </div>

        <div ref={phasesRef} className="cta-phases">
          {['Phase 1: UI', 'Phase 2: Ingestion', 'Phase 3: RAG', 'Phase 4: Learning AI', 'Phase 5: Full Copilot'].map((p, i) => (
            <span key={i} className="phase-badge">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
