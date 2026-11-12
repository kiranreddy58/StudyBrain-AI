import { useEffect, useRef } from 'react';
import './TechStack.css';

const TECH = [
  { layer: 'Frontend', pills: ['React', 'Vite', 'Modern CSS'] },
  { layer: 'Backend', pills: ['Python', 'FastAPI', 'MongoDB Atlas'] },
  { layer: 'Document Processing', pills: ['PyMuPDF', 'OCR', 'Semantic Chunking'] },
  { layer: 'Embeddings', pills: ['Sentence Transformers', 'MiniLM'] },
  { layer: 'Vector Search', pills: ['FAISS Vector Store'] },
  { layer: 'AI Inference', pills: ['Groq LPU Engine', 'RAG Pipeline'] },
];

export default function TechStack() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el && el.classList.add('visible'), i * 70);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach(o => o && o.disconnect());
    };
  }, []);

  return (
    <section className="tech-section" id="tech">
      <div className="tech-header">
        <span className="eyebrow-tag">Architecture</span>
        <h2 className="section-title">Built on Reliable<br />Technology</h2>
        <p className="section-sub" style={{ margin: '0 auto' }}>
          Engineered for fast document indexing, accurate retrieval, and responsive tutoring.
        </p>
      </div>

      <div className="tech-grid">
        {TECH.map((t, i) => (
          <div key={i} ref={el => { cardRefs.current[i] = el; }} className="tech-card">
            <div className="tech-layer">{t.layer}</div>
            <div className="tech-pills">
              {t.pills.map((pill, j) => (
                <span key={j} className="tech-pill">{pill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
