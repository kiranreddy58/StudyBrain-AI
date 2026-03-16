import { useState } from 'react';
import './AssistantWorkspace.css';
import { Send, Paperclip, Sparkles, BookOpen, Clock, Brain, HelpCircle } from 'lucide-react';

const API = '/api';

// Window modes and their backend endpoints
const MODES = [
  { key: 'qa',       label: 'Q&A',           icon: HelpCircle, endpoint: '/ai/ask',             field: 'question' },
  { key: 'quiz',     label: 'Quiz',          icon: Brain,      endpoint: '/copilot/generate-quiz', field: 'topic'    },
  { key: 'explain',  label: 'Explain',       icon: Sparkles,   endpoint: '/copilot/explain',      field: 'concept'  },
  { key: 'help',     label: 'Assignment',    icon: BookOpen,   endpoint: '/copilot/assignment-help', field: 'question' },
];

async function callBackend(mode, userText) {
  const payload = { [mode.field]: userText };
  // Quiz also needs num_questions
  if (mode.key === 'quiz') payload.num_questions = 5;

  const res = await fetch(`${API}${mode.endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  const data = await res.json();
  // Normalise different response shapes into a single string
  return data.answer || data.explanation || data.guidance || data.quiz || 'No response from AI.';
}

export default function AssistantWorkspace({ user }) {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello ${user?.name || 'there'}! I'm your StudyBrain AI. Ask me anything, request a quiz, or get a concept explained — I'll search your uploaded study materials for the best answer.` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState({ provider: 'Checking...', available: false });

  useState(() => {
    async function checkStatus() {
      try {
        const res = await fetch(`${API}/status`);
        if (res.ok) {
          const data = await res.json();
          setAiStatus({ provider: data.llm_provider, available: data.ollama_available });
        }
      } catch (err) {
        setAiStatus({ provider: 'Offline', available: false });
      }
    }
    checkStatus();
  }, []);

  const handleSend = async () => {
    const query = input.trim();
    if (!query) return;

    const preferredProvider = localStorage.getItem('sb_model') || 'auto';
    console.log("AI Assistant: Sending query:", query, "Mode:", activeMode.key, "Provider:", preferredProvider);

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const payload = { [activeMode.field]: query, provider: preferredProvider };
      if (activeMode.key === 'quiz') payload.num_questions = 5;

      const res = await fetch(`${API}${activeMode.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      const answer = data.answer || data.explanation || data.guidance || data.quiz || 'No response from AI.';
      
      console.log("AI Assistant: Received answer:", answer);
      setMessages(prev => [...prev, { role: 'ai', content: answer }]);
    } catch (err) {
      console.error("AI Assistant: Error:", err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `⚠️ Could not reach the StudyBrain backend. Make sure the server is running.\n\nError: ${err.message}`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="assistant-workspace">
      <div className="chat-main">
        <header className="chat-header">
          <div className="settings-title">
            <Sparkles size={18} color="var(--color-accent)" />
            &nbsp;AI Copilot
          </div>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {MODES.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMode(m)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeMode.key === m.key ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
                  color: activeMode.key === m.key ? '#fff' : 'var(--color-text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message-bubble ${m.role}`} style={{ whiteSpace: 'pre-wrap' }}>
              {m.content}
            </div>
          ))}
          {isTyping && (
            <div className="message-bubble ai" style={{ opacity: 0.6 }}>
              Brain is thinking...
            </div>
          )}
        </div>

        <footer className="chat-footer">
          <div className="input-container">
            <Paperclip size={20} color="var(--color-text-muted)" style={{ cursor: 'pointer' }} />
            <input
              type="text"
              id="ai-chat-input"
              className="chat-input"
              placeholder={
                activeMode.key === 'quiz'    ? 'Enter a topic to generate a quiz...' :
                activeMode.key === 'explain' ? 'Enter a concept to explain...' :
                activeMode.key === 'help'    ? 'Paste your assignment question...' :
                                              'Ask anything about your study materials...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              id="ai-send-btn"
              className="btn-primary"
              style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}
              onClick={handleSend}
              disabled={isTyping}
            >
              <Send size={16} />
            </button>
          </div>
        </footer>
      </div>

      <div className="assistant-sidebar">
        <div className="context-card">
          <h3 className="card-title"><BookOpen size={16} style={{ marginRight: '8px' }} />Active Mode</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
            <strong style={{ color: 'var(--color-accent)' }}>{activeMode.label}</strong> mode is active.
            {activeMode.key === 'qa'      && ' Ask questions about your documents.'}
            {activeMode.key === 'quiz'    && ' Enter a topic to generate practice questions.'}
            {activeMode.key === 'explain' && ' Enter a concept to get a clear explanation.'}
            {activeMode.key === 'help'    && ' Paste an assignment question for step-by-step guidance.'}
          </p>
          <div className="recent-activities" style={{ marginTop: '1.5rem' }}>
            <div className="activity-item">
              <div className="activity-dot" style={{ backgroundColor: aiStatus.available ? '#10b981' : '#f59e0b' }} />
              <div className="activity-content">
                <div className="activity-title" style={{ fontSize: '0.75rem' }}>
                  AI Status: {aiStatus.provider} {aiStatus.available ? '(Local)' : '(Cloud)'}
                </div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" style={{ backgroundColor: '#3b82f6' }} />
              <div className="activity-content">
                <div className="activity-title" style={{ fontSize: '0.75rem' }}>FAISS Vector Search</div>
              </div>
            </div>
          </div>
        </div>

        <div className="context-card" style={{ flex: '0 0 auto' }}>
          <h3 className="card-title"><Clock size={16} style={{ marginRight: '8px' }} />Session</h3>
          <div style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
            {messages.filter(m => m.role === 'user').length} questions asked this session.
          </div>
        </div>
      </div>
    </div>
  );
}
