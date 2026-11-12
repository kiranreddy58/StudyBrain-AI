import { useEffect, useRef } from 'react';
import './FeaturesSection.css';

const FEATURES = [
  { 
    title: 'Grounded Knowledge Retrieval', 
    desc: 'Answers questions using your uploaded study materials with direct citations and zero hallucinations.' 
  },
  { 
    title: 'Modular Workspace', 
    desc: 'Study flexibly with dedicated modules for document reading, concept explanations, and practice quizzes.' 
  },
  { 
    title: 'Adaptive Quiz Generator', 
    desc: 'Generates practice questions that dynamically adjust difficulty based on your mastery score.' 
  },
  { 
    title: 'Progress & Retention Tracking', 
    desc: 'Tracks study time, quiz accuracy, and topic mastery to highlight concepts that need reinforcement.' 
  },
  { 
    title: 'Multi-Format Document Support', 
    desc: 'Processes and indexes PDFs, lecture notes, scanned sheets, and code files into structured knowledge.' 
  },
  { 
    title: 'Personalized Recommendations', 
    desc: 'Detects weak areas and suggests high-priority topics to maximize study efficiency.' 
  },
];

export default function FeaturesSection({ onEnterApp }) {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el && el.classList.add('visible'), i * 80);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <section className="features-section" id="features">
      <div className="features-header">
        <span className="eyebrow-tag">Features</span>
        <h2 className="section-title">Everything You Need<br />to Master Any Subject</h2>
        <p className="section-sub">
          Core learning capabilities built to transform your notes into an adaptive tutoring system.
        </p>
      </div>

      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div 
            key={i} 
            ref={el => { cardRefs.current[i] = el; }} 
            className="feature-card"
            onClick={onEnterApp}
          >
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
