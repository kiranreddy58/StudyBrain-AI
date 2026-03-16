import './LoadingScreen.css';

export default function LoadingScreen({ progress, hidden }) {
  const percent = Math.round(progress * 100);
  return (
    <div className={`loading-screen${hidden ? ' hidden' : ''}`} role="status" aria-live="polite">
      <div className="loading-brand">
        <div className="loading-logo">StudyBrain AI</div>
        <div className="loading-tagline">Learn Smarter · Study Faster</div>
      </div>
      <div className="loading-bar-track" aria-hidden="true">
        <div className="loading-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="loading-percent">
        {percent < 100 ? `Initialising experience — ${percent}%` : 'Entering StudyBrain…'}
      </div>
    </div>
  );
}
