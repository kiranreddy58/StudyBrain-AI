import React, { useState } from 'react';
import { BookOpen, Send, HelpCircle, CheckCircle } from 'lucide-react';
import './ModuleStyles.css';

export default function AssignmentModule({ selectedFile }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState(null);

  const handleHelp = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/copilot/assignment-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: question,
          filename: selectedFile?.filename,
          provider: localStorage.getItem('sb_model') || 'auto'
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuidance(data.guidance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-panel">

      <div className="module-panel-content">
        <div className="side-input-area">
          <textarea 
            placeholder="Paste question for guidance..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleHelp())}
            rows={2}
          />
          <button className="side-send-btn" onClick={handleHelp} disabled={loading || !question.trim()}>
            {loading ? <div className="spinner-sm" /> : <Send size={16} />}
          </button>
        </div>

        {loading && (
          <div className="ai-loading">
            <div className="shimmer-line" />
            <div className="shimmer-line" />
            <div className="shimmer-line short" />
          </div>
        )}

        {guidance && (
          <div className="guidance-container animate-in">
            <div className="guidance-steps">
               <div className="result-text" dangerouslySetInnerHTML={{ __html: guidance.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/Step (\d+):/g, '<div class="step-label">Step $1</div>').replace(/\n/g, '<br/>') }} />
            </div>
            <div className="guidance-footer">
              <CheckCircle size={14} />
              <span>Use these steps to solve the problem yourself!</span>
            </div>
          </div>
        )}

        {!guidance && !loading && (
          <div className="module-info-card">
            <HelpCircle size={24} color="var(--color-accent)" />
            <h4>How it works</h4>
            <p>I'll break down your question into logical steps and provide hints instead of direct answers to help you learn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
