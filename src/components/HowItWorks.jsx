import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  { 
    title: 'Upload Study Materials', 
    desc: 'Upload PDFs, textbooks, lecture slides, or code. The system automatically detects file types and prepares content for indexing.' 
  },
  { 
    title: 'Content Processing & Chunking', 
    desc: 'Text is parsed, cleaned, and split into structured semantic chunks with source page and document references.' 
  },
  { 
    title: 'Vector Search Indexing', 
    desc: 'Each chunk is transformed into vector embeddings and indexed for fast, accurate similarity retrieval.' 
  },
  { 
    title: 'Grounded Answering', 
    desc: 'When you ask a question, relevant passages are retrieved to generate clear, accurate answers with citations.' 
  },
  { 
    title: 'Adaptive Practice & Mastery', 
    desc: 'Study sessions update your topic mastery, tailoring quizzes and study focus to your learning pace.' 
  },
];

export default function HowItWorks() {
  const stepRefs = useRef([]);

  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el && el.classList.add('visible'), i * 120);
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <span className="eyebrow-tag">Workflow</span>
        <h2 className="section-title">From Upload to<br />Mastery</h2>
        <p className="section-sub">
          A systematic process that converts study materials into an interactive learning environment.
        </p>

        <ol className="how-steps">
          {STEPS.map((step, i) => (
            <li key={i} ref={el => { stepRefs.current[i] = el; }} className="step-item">
              <div className="step-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="step-body">
                <div className="step-title">{step.title}</div>
                <p className="step-desc">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
