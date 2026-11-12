import { useEffect, useRef } from 'react';
import './UseCases.css';

const CASES = [
  {
    title: 'Exam Preparation',
    desc: 'Upload textbooks and revision notes. Generate practice exam questions, test yourself adaptively, and pinpoint topics needing revision.',
  },
  {
    title: 'Assignment Support',
    desc: 'Retrieve relevant sections from course materials with step-by-step guidance, hints, and source references.',
  },
  {
    title: 'Concept Clarification',
    desc: 'Break down complex topics into clear explanations adjusted to your current knowledge level and subject matter.',
  },
  {
    title: 'Progress Monitoring',
    desc: 'Track comprehension per topic, identify strong and weak concepts, and maintain a structured learning plan.',
  },
];

export default function UseCases() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = cardRefs.current.map((el, i) => {
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el && el.classList.add('visible'), i * 100);
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
    <section className="usecases-section" id="usecases">
      <div className="usecases-header">
        <span className="eyebrow-tag">Use Cases</span>
        <h2 className="section-title">Designed for Focused<br />Learning</h2>
        <p className="section-sub">
          Practical ways StudyBrain AI supports your coursework and exam preparation.
        </p>
      </div>

      <div className="usecase-grid">
        {CASES.map((c, i) => (
          <div key={i} ref={el => { cardRefs.current[i] = el; }} className="usecase-card">
            <h3 className="usecase-title">{c.title}</h3>
            <p className="usecase-desc">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
