import { useState, useEffect } from 'react';
import './AssistantWorkspace.css';
import { Sparkles, BookOpen, Brain, FileText, ChevronRight, Layout, Settings, History } from 'lucide-react';
import QuizPlayer from '../components/QuizPlayer';
import FileViewer from '../components/FileViewer';
import ExplainModule from '../components/ExplainModule';
import AssignmentModule from '../components/AssignmentModule';

const API = '/api';

const MODES = [
  { key: 'explain',  label: 'Explain',       icon: Sparkles },
  { key: 'help',     label: 'Assignment',    icon: BookOpen },
  { key: 'quiz',     label: 'Quiz',          icon: Brain    },
  { key: 'history',  label: 'History',       icon: History  },
];
export default function AssistantWorkspace({ user, initialDoc }) {
  const [activeMode, setActiveMode] = useState(MODES[0]);
  const [library, setLibrary] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(initialDoc || null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [interHistory, setInterHistory] = useState([]);

  const fetchLibrary = async () => {
    try {
      const res = await fetch(`${API}/documents`);
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
      const res = await fetch(`/api/ai/history?limit=20`);
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
    if (showLibrary) fetchLibrary();
  }, [showLibrary]);

  useEffect(() => {
    if (activeMode.key === 'history') fetchHistory();
  }, [activeMode]);

  const handleStartQuiz = async () => {
    if (!selectedDoc) return;
    try {
      const preferredProvider = localStorage.getItem('sb_model') || 'auto';
      const res = await fetch(`${API}/copilot/generate-quiz`, {
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
        setActiveQuiz(data.quiz);
      }
    } catch (err) {
      console.error("Quiz Error:", err);
      alert("Failed to generate quiz.");
    }
  };

  const handleQuizComplete = async (score) => {
    setActiveQuiz(null);
    if (!selectedDoc) return;

    try {
      await fetch(`${API}/learning/track-learning`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedDoc.filename,
          quiz_score: score,
          quiz_total: activeQuiz.length,
          study_time_minutes: 5, // Estimate or track actual
          mistakes: activeQuiz.length - score
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
            <Brain size={48} color="var(--color-accent)" />
            <h2>Ready to Test Your Knowledge?</h2>
            <p>I'll generate a 5-question interactive quiz based on <strong>{selectedDoc?.filename || 'your document'}</strong>.</p>
            <button className="btn-primary" onClick={handleStartQuiz}>
              Start Practice Quiz
            </button>
          </div>
        </div>
      );
    }

    if (activeMode.key === 'history') {
      return (
        <div className="history-view">
          <div className="history-header">
            <h4>Recent Interactions</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p>Your past AI study sessions and queries.</p>
              <button 
                className="btn-ghost" 
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                onClick={async () => {
                   await fetch(`/api/ai/history`, { method: 'DELETE' });
                   fetchHistory();
                }}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="history-list">
            {interHistory.length === 0 ? (
              <div className="empty-history">
                <History size={32} opacity={0.3} />
                <p>No session history yet. Start by asking AI or generating a quiz!</p>
              </div>
            ) : (
              interHistory.map((item, idx) => (
                <div key={item.id || idx} className={`history-item ${item.role}`}>
                  <div className="history-role">{item.role.toUpperCase()}</div>
                  <div className="history-text">
                    {item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content}
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
      {/* 1. Left Sidebar: Module Selection */}
      <nav className="hub-sidebar">
        <div className="hub-logo">
          <div className="logo-dot" />
          <span>StudyBrain</span>
        </div>
        
        <div className="hub-nav-group">
          <span className="hub-nav-label">Modules</span>
          {MODES.map(mode => (
            <button 
              key={mode.key}
              className={`hub-nav-item ${activeMode.key === mode.key ? 'active' : ''}`}
              onClick={() => { setActiveMode(mode); setActiveQuiz(null); }}
            >
              <mode.icon size={20} />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        <div className="hub-nav-group" style={{ marginTop: 'auto' }}>
          <button className="hub-nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* 2. Middle: Persistent Document Viewer (70%) */}
      <div className="hub-viewer-area">
        <FileViewer 
          selectedFile={selectedDoc} 
          onSelectFile={() => setShowLibrary(true)} 
        />
      </div>

      {/* 3. Right: AI Assistant Panel (30%) */}
      <aside className="hub-ai-panel">
        <div className="ai-panel-header">
          <activeMode.icon size={18} className="mode-icon" />
          <h3>AI {activeMode.label}</h3>
        </div>
        <div className="ai-panel-content">
          {renderModule()}
        </div>
      </aside>

      {/* Library Picker Modal */}
      {showLibrary && (
        <div className="modal-overlay" onClick={() => setShowLibrary(false)}>
          <div className="library-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Switch Document</h3>
              <p>Select a file to update your study session context.</p>
            </div>
            <div className="modal-grid">
              {library.map(doc => (
                <div 
                  key={doc.id} 
                  className={`modal-doc-card ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedDoc(doc); setShowLibrary(false); }}
                >
                  <FileText size={24} />
                  <div className="modal-doc-info">
                    <h4>{doc.filename}</h4>
                    <span>{(doc.type || 'text').toUpperCase()} • {doc.chunks_count} chunks</span>
                  </div>
                  {selectedDoc?.id === doc.id && <ChevronRight size={16} color="var(--color-accent)" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
