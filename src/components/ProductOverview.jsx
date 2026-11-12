import { useEffect, useRef } from 'react';
import './ProductOverview.css';

function useReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) ref.current.classList.add('visible'); },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}

export default function ProductOverview({ onEnterApp }) {
  const descRef = useRef(null);
  const pointsRef = useRef(null);
  const card1 = useRef(null);
  const card2 = useRef(null);
  const card3 = useRef(null);
  const card4 = useRef(null);

  useReveal(descRef);
  useReveal(pointsRef);
  useReveal(card1);
  useReveal(card2);
  useReveal(card3);
  useReveal(card4);

  return (
    <section className="overview-section" id="product">
      <div className="overview-inner">
        <div className="overview-text">
          <span className="eyebrow-tag">Overview</span>
          <h2 className="section-title">Your Intelligent<br />Study Companion</h2>
          <p ref={descRef} className="overview-desc">
            Upload textbooks, lecture notes, slides, and code files to create
            a private knowledge base. Ask questions, generate practice quizzes,
            and review verified explanations grounded in your course materials.
          </p>
          <ul ref={pointsRef} className="overview-points">
            {[
              'Direct answers grounded in your uploaded documents',
              'Parallel workspace for asking, explaining, and quizzes',
              'Adaptive quizzes tailored to your mastery level',
              'Document support for PDFs, images, and text',
            ].map((point, i) => (
              <li key={i} className="overview-point">
                <span className="overview-point-dot" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="overview-visual">
          <div ref={card1} className="mini-card" onClick={onEnterApp}>
            <div className="mini-card-body">
              <div className="mini-card-label">Document Ingestion</div>
              <div className="mini-card-sub">PDF, images, code, and text</div>
            </div>
          </div>
          <div ref={card2} className="mini-card" onClick={onEnterApp}>
            <div className="mini-card-body">
              <div className="mini-card-label">Semantic Search</div>
              <div className="mini-card-sub">Fast vector similarity retrieval</div>
            </div>
          </div>
          <div ref={card3} className="mini-card" onClick={onEnterApp}>
            <div className="mini-card-body">
              <div className="mini-card-label">AI Answer Engine</div>
              <div className="mini-card-sub">Verified, cited explanations</div>
            </div>
          </div>
          <div ref={card4} className="mini-card" onClick={onEnterApp}>
            <div className="mini-card-body">
              <div className="mini-card-label">Adaptive Learning</div>
              <div className="mini-card-sub">Mastery tracking and recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
