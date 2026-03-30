import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Lightbulb } from 'lucide-react';
import './ModuleStyles.css';

export default function ExplainModule({ selectedFile }) {
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/copilot/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          concept: concept,
          filename: selectedFile?.filename,
          provider: localStorage.getItem('sb_model') || 'auto'
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.explanation);
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
            placeholder="Ask AI to explain..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleExplain())}
            rows={2}
          />
          <button className="side-send-btn" onClick={handleExplain} disabled={loading || !concept.trim()}>
            {loading ? <div className="spinner-sm" /> : <Send size={16} />}
          </button>
        </div>

        {loading && (
          <div className="ai-loading">
            <div className="shimmer-line" />
            <div className="shimmer-line short" />
          </div>
        )}

        {result && (
          <div className="explanation-card animate-in">
            <div className="card-accent" />
            <div className="result-text" dangerouslySetInnerHTML={{ __html: result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
          </div>
        )}

        {!result && !loading && (
          <div className="module-suggestions">
            <p>Try asking about:</p>
            <div className="suggestion-chips">
              <button onClick={() => setConcept('Core architecture')}>Core architecture</button>
              <button onClick={() => setConcept('Key terminology')}>Key terminology</button>
              <button onClick={() => setConcept('Summary of chapter 1')}>Summary of chapter 1</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
