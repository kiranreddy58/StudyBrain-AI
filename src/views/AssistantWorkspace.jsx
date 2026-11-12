import { useState, useEffect } from 'react';
import './AssistantWorkspace.css';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  FileText, 
  ChevronRight, 
  Settings, 
  History, 
  FileCheck2,
  Layers,
  Bot
} from 'lucide-react';
import QuizPlayer from '../components/QuizPlayer';
import FileViewer from '../components/FileViewer';
import ExplainModule from '../components/ExplainModule';
import AssignmentModule from '../components/AssignmentModule';
import { authFetch } from '../utils/api';

const API = '/api';

const MODES = [
  { key: 'explain',  label: 'Explain',       icon: Sparkles },
  { key: 'help',     label: 'Assignment',    icon: BookOpen },
  { key: 'quiz',     label: 'Quiz',          icon: Brain    },
  { key: 'history',  label: 'History',       icon: History  },
];

export default function AssistantWorkspace({ initialDoc }) {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [library, setLibrary] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(initialDoc || null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [interHistory, setInterHistory] = useState([]);
  
  // Mobile responsive tab toggle ('viewer' or 'assistant')
  const [mobileTab, setMobileTab] = useState('assistant');

  const fetchLibrary = async () => {
    try {
      const res = await authFetch(`${API}/documents`);
      if (res.ok) {
        const data = await res.json();
        setLibrary(data.documents || []);
        if (!selectedDoc && data.documents?.length > 0) {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch library:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await authFetch(`/api/ai/history?limit=30`);
      if (res.ok) {
        const data = await res.json();
        setInterHistory(data.history || []);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    if (initialDoc) setSelectedDoc(initialDoc);
  }, [initialDoc]);

  useEffect(() => {
    if (showLibrary) fetchLibrary();
  }, [showLibrary]);

  useEffect(() => {
    if (activeMode.key === 'history') fetchHistory();
  }, [activeMode]);

  const handleStartQuiz = async () => {
    if (!selectedDoc) {
      alert("Please select a document first from your library to generate a quiz.");
      return;
    }
    try {
      const preferredProvider = localStorage.getItem('sb_model') || 'auto';
      const res = await authFetch(`${API}/copilot/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedDoc.filename,
          filename: selectedDoc.filename,
          num_questions: 5,
          provider: preferredProvider
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quiz && data.quiz.length > 0) {
          setActiveQuiz(data.quiz);
        } else {
          alert("Could not generate quiz questions from this document. Please check the document content.");
        }
      }
    } catch (err) {
      console.error("Quiz Error:", err);
      alert("Failed to generate quiz.");
    }
  };

  const handleQuizComplete = async (score) => {
    const totalQ = activeQuiz ? activeQuiz.length : 5;
    setActiveQuiz(null);
    if (!selectedDoc) return;

    try {
      await authFetch(`${API}/learning/track-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedDoc.filename,
          quiz_score: score,
          quiz_total: totalQ,
          study_time_minutes: 5, 
          mistakes: Math.max(0, totalQ - score)
        }),
      });
    } catch (err) {
      console.error("Failed to record quiz activity:", err);
    }
  };

  const renderModule = () => {
    if (activeMode.key === 'quiz' && activeQuiz) {
      return (
        <div className="quiz-container">
          <QuizPlayer 
            quiz={activeQuiz} 
            onComplete={handleQuizComplete}
            onExit={() => setActiveQuiz(null)}
          />
        </div>
      );
    }

    if (activeMode.key === 'explain') return <ExplainModule selectedFile={selectedDoc} />;
    if (activeMode.key === 'help') return <AssignmentModule selectedFile={selectedDoc} />;
    
    if (activeMode.key === 'quiz') {
      return (
        <div className="quiz-setup-view">
          <div className="setup-card">
            <Brain size={44} color="var(--color-accent)" />
            <h2>Interactive Knowledge Quiz</h2>
            <p>
              Generate a personalized quiz based on{' '}
              <strong>{selectedDoc?.filename || 'your selected document'}</strong>.
            </p>
            <button className="btn-primary" onClick={handleStartQuiz} style={{ marginTop: '1rem' }}>
              Generate Practice Quiz
            </button>
          </div>
        </div>
      );
    }

    if (activeMode.key === 'history') {
      return (
        <div className="history-view">
          <div className="history-header">
            <h4>Vault AI History</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>Your isolated questions & AI answers.</p>
              <button 
                className="btn-ghost" 
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={async () => {
                   await authFetch(`/api/ai/history`, { method: 'DELETE' });
                   fetchHistory();
                }}
              >
                Clear History
              </button>
            </div>
          </div>
          <div className="history-list">
            {interHistory.length === 0 ? (
              <div className="empty-history">
                <History size={32} opacity={0.3} />
                <p>No study sessions logged yet. Ask questions in the Explain or Assignment modules!</p>
              </div>
            ) : (
              interHistory.map((item, idx) => (
                <div key={item.id || idx} className={`history-item ${item.role}`}>
                  <div className="history-role">{item.role === 'user' ? 'YOU' : 'AI TUTOR'}</div>
                  <div className="history-text">
                    {item.content.length > 250 ? item.content.substring(0, 250) + '...' : item.content}
                  </div>
                  <div className="history-time">{new Date(item.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="assistant-modular-hub">
      {/* 1. Left Sidebar / Mobile Top Bar: Module Selection */}
      <nav className="hub-sidebar">
        <div className="hub-logo">
          <div className="logo-dot" />
          <span>Modules</span>
        </div>
        
        <div className="hub-nav-group">
          {MODES.map(mode => (
            <button 
              key={mode.key}
              className={`hub-nav-item ${activeMode.key === mode.key ? 'active' : ''}`}
              onClick={() => { 
                setActiveMode(mode); 
                setActiveQuiz(null);
                setMobileTab('assistant');
              }}
            >
              <mode.icon size={18} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Tab Switcher: Document vs AI Tutor */}
      <div className="mobile-view-tabs" role="tablist">
        <button 
          className={`mobile-tab-btn ${mobileTab === 'viewer' ? 'active' : ''}`}
          onClick={() => setMobileTab('viewer')}
        >
          <FileText size={16} />
          <span>Document</span>
        </button>
        <button 
          className={`mobile-tab-btn ${mobileTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setMobileTab('assistant')}
        >
          <Bot size={16} />
          <span>AI {activeMode.label}</span>
        </button>
      </div>

      {/* 2. Middle: Persistent Document Viewer */}
      <div className={`hub-viewer-area ${mobileTab === 'viewer' ? 'mobile-active' : ''}`}>
        <FileViewer 
          selectedFile={selectedDoc} 
          onSelectFile={() => setShowLibrary(true)} 
        />
      </div>

      {/* 3. Right: AI Assistant Panel */}
      <aside className={`hub-ai-panel ${mobileTab === 'assistant' ? 'mobile-active' : ''}`}>
        <div className="ai-panel-header">
          <activeMode.icon size={18} className="mode-icon" />
          <h3>AI {activeMode.label}</h3>
          {selectedDoc && (
            <span className="ai-context-badge" title={selectedDoc.filename}>
              {selectedDoc.filename}
            </span>
          )}
        </div>
        <div className="ai-panel-content">
          {renderModule()}
        </div>
      </aside>

      {/* Library Document Picker Modal */}
      {showLibrary && (
        <div className="modal-overlay" onClick={() => setShowLibrary(false)}>
          <div className="library-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Switch Active Material</h3>
              <p>Select a document from your vault to ground AI answers in.</p>
            </div>
            <div className="modal-grid">
              {library.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No materials found. Upload files in the Library tab.
                </div>
              ) : (
                library.map(doc => (
                  <div 
                    key={doc.id} 
                    className={`modal-doc-card ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedDoc(doc); setShowLibrary(false); }}
                  >
                    <FileText size={22} color="var(--color-accent-2)" />
                    <div className="modal-doc-info">
                      <h4>{doc.filename}</h4>
                      <span>{(doc.type || 'text').toUpperCase()} • {doc.chunks_count || 1} chunks</span>
                    </div>
                    {selectedDoc?.id === doc.id && <ChevronRight size={16} color="var(--color-accent)" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
