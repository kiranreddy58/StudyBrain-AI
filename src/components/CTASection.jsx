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
          Ready to Study Smarter?
        </h2>

        <p ref={subRef} className="cta-sub">
          Upload your materials, ask questions, and test your knowledge with adaptive AI tutoring.
        </p>

        <div ref={actionsRef} className="cta-actions">
          <button onClick={onEnterApp} className="btn-primary">Get Started</button>
        </div>
      </div>
    </section>
  );
}
