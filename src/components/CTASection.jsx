import { useEffect, useRef } from 'react';
import './CTASection.css';

export default function CTASection({ onEnterApp }) {
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    const targets = [titleRef, subRef, actionsRef];
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
          <button onClick={onEnterApp} className="btn-primary">Start for Free →</button>
          <a href="#product" className="btn-ghost">Explore the Platform</a>
        </div>

      </div>
    </section>
  );
}
