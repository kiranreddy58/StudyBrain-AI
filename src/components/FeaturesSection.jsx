import { useEffect, useRef } from 'react';
import './FeaturesSection.css';

const FEATURES = [
  { icon: '📡', color: 'indigo', title: 'RAG Knowledge Engine', desc: 'Answers every question using your own uploaded study materials via Retrieval-Augmented Generation — no hallucination, full citation.' },
  { icon: '🪟', color: 'cyan', title: 'Multi-Window Workspace', desc: 'Open multiple floating, draggable AI assistant windows simultaneously — quiz in one, explain in another, solve assignments in a third.' },
  { icon: '🧩', color: 'violet', title: 'Adaptive Quiz Generator', desc: 'Automatically generates MCQ, short-answer, and coding questions with difficulty that adjusts based on your mastery score.' },
  { icon: '🗺️', color: 'green', title: 'Learning Progress Tracker', desc: 'Tracks quiz scores, study time, and mistakes per topic to compute a mastery score (0–100) and surface your weak areas.' },
  { icon: '📂', color: 'orange', title: 'Multimodal Document Support', desc: 'Processes PDFs, lecture slides, handwritten notes via OCR, code files, and plain text — all converted into searchable knowledge chunks.' },
  { icon: '💡', color: 'pink', title: 'Smart Topic Recommendations', desc: 'The learning engine analyses your weak topics and automatically recommends what to study next, keeping you on the optimal learning path.' },
];

function useReveal(refs) {
  useEffect(() => {
    const observers = refs.map((ref, i) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => ref.current && ref.current.classList.add('visible'), i * 80);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(ref.current);
      return observer;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, [refs]);
}

export default function FeaturesSection() {
  const cardRefs = FEATURES.map(() => useRef(null));

  useReveal(cardRefs);

  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <span className="eyebrow-tag">Core Capabilities</span>
        <h2 className="section-title">Everything You Need<br />to Master Any Subject</h2>
        <p className="section-sub">
          Six powerful AI-driven features that work together to create
          a personalised, adaptive learning experience.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div key={i} ref={cardRefs[i]} className="feature-card">
            <div className={`feature-icon ${f.color}`}>{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
