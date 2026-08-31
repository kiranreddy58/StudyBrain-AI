import { useEffect, useRef } from 'react';
import './TechStack.css';

const TECH = [
  { layer: 'Frontend', pills: ['React.js', 'Vite', 'Vanilla CSS', 'Lucide'] },
  { layer: 'Backend & Database', pills: ['Python', 'FastAPI', 'MongoDB Atlas Cloud'] },
  { layer: 'Document Processing', pills: ['PyMuPDF', 'Chunking', 'Cleaning'] },
  { layer: 'AI / Embeddings', pills: ['Sentence Transformers', 'all-MiniLM-L6-v2'] },
  { layer: 'Vector Database', pills: ['FAISS', 'Local Storage'] },
  { layer: 'LLM Integration', pills: ['Groq Cloud API (LPU Inference)', 'RAG Pipeline'] },
];

const PHASES = [
  { num: 'Phase 01', name: 'Frontend UI & Multi-Window' },
  { num: 'Phase 02', name: 'Data Ingestion & OCR' },
  { num: 'Phase 03', name: 'RAG & Vector Database' },
  { num: 'Phase 04', name: 'Personalized Learning Engine' },
  { num: 'Phase 05', name: 'Full AI Copilot Integration' },
];

export default function TechStack() {
  const cardRefs = TECH.map(() => useRef(null));
  const bannerRef = useRef(null);

  useEffect(() => {
    const observers = cardRefs.map((ref, i) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => ref.current && ref.current.classList.add('visible'), i * 70);
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(ref.current);
      return observer;
    });

    const bannerObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) bannerRef.current.classList.add('visible'); },
      { threshold: 0.2 }
    );
    if (bannerRef.current) bannerObserver.observe(bannerRef.current);

    return () => {
      observers.forEach(o => o && o.disconnect());
      bannerObserver.disconnect();
    };
  }, []);

  return (
    <section className="tech-section" id="tech">
      <div className="tech-header">
        <span className="eyebrow-tag">Architecture & Stack</span>
        <h2 className="section-title">Built on Production-Grade<br />AI Infrastructure</h2>
        <p className="section-sub" style={{ margin: '0 auto' }}>
          Every layer of StudyBrain AI is assembled from best-in-class
          open-source and commercial tools — designed to scale.
        </p>
      </div>

      <div className="tech-grid">
        {TECH.map((t, i) => (
          <div key={i} ref={cardRefs[i]} className="tech-card">
            <div className="tech-layer">{t.layer}</div>
            <div className="tech-pills">
              {t.pills.map((pill, j) => (
                <span key={j} className="tech-pill">{pill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div ref={bannerRef} className="phase-banner">
        {PHASES.map((p, i) => (
          <div key={i} className="phase-item">
            <div className="phase-num">{p.num}</div>
            <div className="phase-name">{p.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
