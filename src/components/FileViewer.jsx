import React, { useState, useEffect } from 'react';
import { FileText, Search, X, ChevronRight, BookOpen, ExternalLink, Eye, Cpu, RefreshCw } from 'lucide-react';
import './FileViewer.css';

const API = '/api';

export default function FileViewer({ selectedFile, onSelectFile }) {
  const [viewMode, setViewMode] = useState('reader'); 
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile) return;
    
    async function fetchContent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/document/${selectedFile.id}`);
        if (res.ok) {
          const data = await res.json();
          
          const fullText = data.chunks.map(c => c.chunk_text).join('\n\n');
          setContent(fullText);
        }
      } catch (err) {
        console.error("Failed to fetch doc content:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="file-viewer-empty">
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No File Selected</h3>
          <p>Select a document from your library to provide context for AI Copilot modules.</p>
          <button className="btn-primary" onClick={onSelectFile}>
            Open Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-viewer-container">
      <header className="file-viewer-header">
        <div className="file-info-main">
          <div className="file-icon-bg">
            <FileText size={18} />
          </div>
          <div className="file-details">
            <h4>{selectedFile.filename}</h4>
            <span>{(selectedFile.type || 'text').toUpperCase()} • 100% Indexed</span>
          </div>
        </div>
        
        <div className="viewer-controls">
          <div className="view-toggle-pill">
            <button 
              className={`toggle-btn ${viewMode === 'reader' ? 'active' : ''}`}
              onClick={() => setViewMode('reader')}
              title="Reader View"
            >
              <Eye size={14} />
              <span>Reader</span>
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
              title="Extracted Text (AI Insight)"
            >
              <Cpu size={14} />
              <span>AI Text</span>
            </button>
          </div>
          <button className="icon-btn" onClick={onSelectFile} title="Switch Document">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <div className="file-content-area">
        {loading ? (
          <div className="viewer-loader">
            <div className="pulse-dot"></div>
            <span>Reading document...</span>
          </div>
        ) : viewMode === 'ai' ? (
          <div className="text-content">
            {content || "No content extracted for this document."}
          </div>
        ) : (
          <div className="raw-reader-area">
            {selectedFile.type === 'pdf' ? (
              <iframe 
                src={`${API}/document/${selectedFile.id}/raw`}
                title="Document View"
                className="viewer-iframe"
              />
            ) : selectedFile.type === 'image' ? (
              <div className="image-viewer">
                <img src={`${API}/document/${selectedFile.id}/raw`} alt="Document content" />
              </div>
            ) : (
              <div className="text-viewer">
                <pre>{content}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="file-viewer-footer">
        <div className="doc-search">
          <Search size={14} />
          <input type="text" placeholder="Search in document..." disabled />
        </div>
      </footer>
    </div>
  );
}
