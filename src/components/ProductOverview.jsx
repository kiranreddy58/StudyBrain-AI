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
        {/* Left — text */}
        <div className="overview-text">
          <span className="eyebrow-tag">What Is StudyBrain AI?</span>
          <h2 className="section-title">Your AI-Powered<br />Study Companion</h2>
          <p ref={descRef} className="overview-desc">
            StudyBrain AI is your comprehensive intelligent learning platform. 
            Upload your PDFs, lecture notes, slides, or code files — and 
            transform them into a dedicated personal knowledge engine. 
            Ask complex questions, generate adaptive quizzes, and stay 
            ahead with AI-powered insights that grow with your knowledge.
          </p>
          <ul ref={pointsRef} className="overview-points">
            {[
              'Retrieval-Augmented Generation (RAG) answers from your own materials',
              'Multi-window AI assistant — study multiple topics in parallel',
              'Adaptive quiz difficulty based on your mastery score',
              'Context-aware explanations tailored to your knowledge level',
              'Full multimodal support: PDFs, images, code, handwritten notes',
            ].map((point, i) => (
              <li key={i} className="overview-point">
                <span className="overview-point-dot" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — floating mini-cards */}
        <div className="overview-visual">
          <div ref={card1} className="mini-card">
            <div className="mini-card-icon indigo">📄</div>
            <div className="mini-card-body">
              <div className="mini-card-label">Document Ingestion</div>
              <div className="mini-card-sub">PDF, PPT, images, code, text</div>
            </div>
          </div>
          <div ref={card2} className="mini-card">
            <div className="mini-card-icon cyan">🔍</div>
            <div className="mini-card-body">
              <div className="mini-card-label">Semantic Search</div>
              <div className="mini-card-sub">FAISS vector similarity retrieval</div>
            </div>
          </div>
          <div ref={card3} className="mini-card">
            <div className="mini-card-icon violet">🤖</div>
            <div className="mini-card-body">
              <div className="mini-card-label">AI Answer Engine</div>
              <div className="mini-card-sub">LLM + RAG grounded responses</div>
            </div>
          </div>
          <div ref={card4} className="mini-card">
            <div className="mini-card-icon green">📈</div>
            <div className="mini-card-body">
              <div className="mini-card-label">Adaptive Learning</div>
              <div className="mini-card-sub">Mastery tracking & recommendations</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
