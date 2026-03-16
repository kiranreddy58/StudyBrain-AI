import { useEffect, useRef } from 'react';
import './HowItWorks.css';

const STEPS = [
  { title: 'Upload Your Study Materials', desc: 'Upload PDFs, images, lecture slides, code files, or handwritten notes. The system auto-detects the file type and routes it to the correct processing pipeline.' },
  { title: 'AI Processes & Indexes Content', desc: 'The backend extracts text (using PyMuPDF + Tesseract OCR), cleans it, splits it into overlapping 500-token chunks, and stores them with rich metadata.' },
  { title: 'Embeddings & Vector Indexing', desc: 'Each chunk is converted into a semantic vector using Sentence Transformers (all-MiniLM-L6-v2) and stored in a FAISS vector index for ultra-fast similarity search.' },
  { title: 'Ask Questions — Get Grounded Answers', desc: 'Type any question. The system embeds it, retrieves the top 5 most relevant chunks via semantic search, builds a context prompt, and sends it to the LLM for a grounded answer with citations.' },
  { title: 'Adapt, Quiz & Track Mastery', desc: 'Every interaction updates your mastery score per topic. The AI adjusts quiz difficulty, recommends what to study next, and identifies your weakest concepts automatically.' },
];

export default function HowItWorks() {
  const stepRefs = STEPS.map(() => useRef(null));

  useEffect(() => {
    const observers = stepRefs.map((ref, i) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => ref.current && ref.current.classList.add('visible'), i * 120);
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(ref.current);
      return observer;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <section className="how-section" id="how">
      <div className="how-inner">
        <span className="eyebrow-tag">How It Works</span>
        <h2 className="section-title">From File Upload to<br />AI-Powered Answer</h2>
        <p className="section-sub">
          Five seamless steps that transform your raw study materials
          into an intelligent, personalised tutoring system.
        </p>

        <ol className="how-steps">
          {STEPS.map((step, i) => (
            <li key={i} ref={stepRefs[i]} className="step-item">
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
