import { useEffect, useRef } from 'react';
import './UseCases.css';

const CASES = [
  {
    emoji: '🎓',
    title: 'Exam Preparation',
    desc: 'Upload your textbooks and past papers. Generate high-probability exam questions, quiz yourself adaptively, and let the AI pinpoint your weak areas before the exam.',
    quote: '"Generated 50 exam questions from my notes in 30 seconds."',
  },
  {
    emoji: '📝',
    title: 'Assignment Assistance',
    desc: 'Paste your assignment question — the AI retrieves relevant material from your notes and explains the solution step-by-step, with hints before full answers.',
    quote: '"Solved my ML assignment with citations from my own lecture slides."',
  },
  {
    emoji: '🔬',
    title: 'Concept Deep-Dives',
    desc: 'Don\'t just memorise — understand. Ask the AI to explain gradient descent, entropy, or backpropagation in simple terms, tailored to your current mastery level.',
    quote: '"Finally understood backpropagation with a custom explanation."',
  },
  {
    emoji: '📊',
    title: 'Progress Monitoring',
    desc: 'Track mastery scores per topic, identify strong and weak areas, follow personalised next-topic recommendations, and maintain a study streak to stay consistent.',
    quote: '"My mastery dashboard shows exactly where I need to focus."',
  },
];

export default function UseCases() {
  const cardRefs = CASES.map(() => useRef(null));

  useEffect(() => {
    const observers = cardRefs.map((ref, i) => {
      if (!ref.current) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => ref.current && ref.current.classList.add('visible'), i * 100);
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
    <section className="usecases-section" id="usecases">
      <div className="usecases-header">
        <span className="eyebrow-tag">Use Cases</span>
        <h2 className="section-title">Designed for Students<br />Who Want to Learn Smarter</h2>
        <p className="section-sub">
          Whether you're cramming for finals or mastering a new field,
          StudyBrain AI adapts to your purpose.
        </p>
      </div>

      <div className="usecase-grid">
        {CASES.map((c, i) => (
          <div key={i} ref={cardRefs[i]} className="usecase-card">
            <span className="usecase-emoji">{c.emoji}</span>
            <h3 className="usecase-title">{c.title}</h3>
            <p className="usecase-desc">{c.desc}</p>
            <div className="usecase-quote">{c.quote}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
