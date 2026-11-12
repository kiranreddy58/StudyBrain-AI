import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  BookOpen, 
  Eye, 
  Cpu, 
  RefreshCw, 
  ExternalLink, 
  Download, 
  Maximize2, 
  Minimize2,
  Layers,
  FileQuestion
} from 'lucide-react';
import './FileViewer.css';
import { authFetch, getToken } from '../utils/api';

const API = '/api';

export default function FileViewer({ selectedFile, onSelectFile }) {
  const isPdf = Boolean(
    selectedFile?.type === 'pdf' || 
    (selectedFile?.filename && selectedFile.filename.toLowerCase().endsWith('.pdf'))
  );
  const isImg = Boolean(
    selectedFile?.type === 'image' || 
    (selectedFile?.filename && /\.(png|jpe?g|webp|gif)$/i.test(selectedFile.filename))
  );

  const [viewMode, setViewMode] = useState(isPdf ? 'pdf' : (isImg ? 'image' : 'paper')); 
  const [content, setContent] = useState('');
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rawError, setRawError] = useState(false);
  const [hasRaw, setHasRaw] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!selectedFile || !selectedFile.id) return;
    
    setRawError(false);
    const fileIsPdf = selectedFile.type === 'pdf' || (selectedFile.filename && selectedFile.filename.toLowerCase().endsWith('.pdf'));
    const fileIsImg = selectedFile.type === 'image' || (selectedFile.filename && /\.(png|jpe?g|webp|gif)$/i.test(selectedFile.filename));
    
    if (selectedFile.has_raw_file === false) {
      setHasRaw(false);
      setViewMode('paper');
    } else {
      setHasRaw(true);
      setViewMode(fileIsPdf ? 'pdf' : (fileIsImg ? 'image' : 'paper'));
    }

    async function fetchContent() {
      setLoading(true);
      try {
        const res = await authFetch(`${API}/document/${selectedFile.id}`);
        if (res.ok) {
          const data = await res.json();
          const docChunks = data.chunks || [];
          setChunks(docChunks);
          const fullText = docChunks.map(c => c.chunk_text).join('\n\n');
          setContent(fullText);
          
          if (data.metadata?.has_raw_file === false) {
            setHasRaw(false);
            if (fileIsPdf) setViewMode('paper');
          }
        }
      } catch (err) {
        console.error("Failed to load document content:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [selectedFile]);

  // Paginate extracted content into realistic book pages for Paper Mode (~1400 chars per page)
  const pages = useMemo(() => {
    if (!content) return [];
    const PAGE_SIZE = 1400;
    const paragraphs = content.split('\n\n');
    const result = [];
    let currentPage = '';

    for (const para of paragraphs) {
      if ((currentPage.length + para.length) > PAGE_SIZE && currentPage.length > 300) {
        result.push(currentPage.trim());
        currentPage = para;
      } else {
        currentPage = currentPage ? `${currentPage}\n\n${para}` : para;
      }
    }
    if (currentPage.trim()) {
      result.push(currentPage.trim());
    }
    return result.length > 0 ? result : [content];
  }, [content]);

  // Filtered chunks for AI view
  const filteredChunks = useMemo(() => {
    if (!searchQuery.trim()) return chunks;
    const q = searchQuery.toLowerCase();
    return chunks.filter(c => (c.chunk_text || '').toLowerCase().includes(q));
  }, [chunks, searchQuery]);

  if (!selectedFile || !selectedFile.id) {
    return (
      <div className="file-viewer-empty">
        <div className="empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No Document Selected</h3>
          <p>Pick a material from your library to read, inspect, and cross-reference with AI tutor.</p>
          <button className="btn-primary" onClick={onSelectFile} style={{ marginTop: '1rem' }}>
            Choose Study Material
          </button>
        </div>
      </div>
    );
  }

  const token = getToken();
  const rawUrl = hasRaw && !rawError && selectedFile.id 
    ? `${API}/document/${selectedFile.id}/raw${token ? `?token=${encodeURIComponent(token)}` : ''}` 
    : '';

  return (
    <div className={`file-viewer-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <header className="file-viewer-header">
        <div className="file-info-main">
          <div className="file-icon-bg">
            <FileText size={18} />
          </div>
          <div className="file-details">
            <h4 title={selectedFile.filename}>{selectedFile.filename || 'Untitled Document'}</h4>
            <span>
              <span className="badge-pdf-type">{(selectedFile.type || 'PDF').toUpperCase()}</span>
              {pages.length > 0 ? `• ${pages.length} Pages` : ''} • Grounded in AI
            </span>
          </div>
        </div>
        
        <div className="viewer-controls">
          <div className="view-toggle-pill">
            {isPdf && hasRaw && !rawError && (
              <button 
                className={`toggle-btn ${viewMode === 'pdf' ? 'active' : ''}`}
                onClick={() => setViewMode('pdf')}
                title="Real Native PDF Engine"
              >
                <Eye size={14} />
                <span>Real PDF</span>
              </button>
            )}

            <button 
              className={`toggle-btn ${viewMode === 'paper' ? 'active' : ''}`}
              onClick={() => setViewMode('paper')}
              title="Paginated Book Paper Mode"
            >
              <BookOpen size={14} />
              <span>Paper View</span>
            </button>

            <button 
              className={`toggle-btn ${viewMode === 'ai' ? 'active' : ''}`}
              onClick={() => setViewMode('ai')}
              title="Extracted Semantic Chunks"
            >
              <Layers size={14} />
              <span>AI Chunks</span>
            </button>
          </div>

          <div className="viewer-actions-group">
            {rawUrl && (
              <>
                <a 
                  href={rawUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="icon-btn" 
                  title="Open PDF in new tab"
                >
                  <ExternalLink size={15} />
                </a>
                <a 
                  href={rawUrl} 
                  download={selectedFile.filename || 'document.pdf'} 
                  className="icon-btn" 
                  title="Download original document"
                >
                  <Download size={15} />
                </a>
              </>
            )}

            <button 
              className="icon-btn" 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Reader"}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button className="icon-btn" onClick={onSelectFile} title="Switch Document">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="file-content-area">
        {loading ? (
          <div className="viewer-loader">
            <div className="pulse-dot"></div>
            <span>Loading grounded document...</span>
          </div>
        ) : viewMode === 'pdf' && isPdf && rawUrl ? (
          <div className="real-pdf-container">
            <iframe 
              src={`${rawUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              title={selectedFile.filename || "PDF Document Viewer"}
              className="viewer-iframe real-pdf-frame"
              onError={() => {
                setRawError(true);
                setViewMode('paper');
              }}
            />
            <div className="real-pdf-floating-bar">
              <span>Real PDF Viewer</span>
              <span>•</span>
              <a href={rawUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} /> Open in Tab
              </a>
              <span>•</span>
              <a href={rawUrl} download={selectedFile.filename || "document.pdf"}>
                <Download size={13} /> Download
              </a>
              <span>•</span>
              <button onClick={() => setViewMode('paper')}>
                <BookOpen size={13} /> Book Mode
              </button>
            </div>
          </div>
        ) : viewMode === 'ai' ? (
          <div className="ai-chunks-container">
            {filteredChunks.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '3rem' }}>
                No semantic chunks match your filter.
              </div>
            ) : (
              filteredChunks.map((chunk, index) => (
                <div key={chunk.chunk_id || index} className="ai-chunk-card">
                  <div className="ai-chunk-header">
                    <span className="ai-chunk-badge">Chunk #{index + 1}</span>
                    <span>{(chunk.chunk_text || '').length} chars • AI Grounded</span>
                  </div>
                  <div className="ai-chunk-body">
                    {chunk.chunk_text}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : viewMode === 'image' && rawUrl ? (
          <div className="image-viewer">
            <img 
              src={rawUrl} 
              alt={selectedFile.filename || "Document content"} 
              onError={() => {
                setRawError(true);
                setViewMode('paper');
              }}
            />
          </div>
        ) : (
          /* Paginated Paper Reader Mode */
          <div className="paper-reader-scroll">
            {pages.length === 0 ? (
              <div className="paper-sheet">
                <div className="paper-sheet-body">
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>
                    Document content processed and indexed. Extracted text will appear here.
                  </p>
                </div>
              </div>
            ) : (
              pages.map((pageText, idx) => (
                <article key={idx} className="paper-sheet">
                  <header className="paper-sheet-header">
                    <span>{selectedFile.filename || 'Study Material'}</span>
                    <span>Page {idx + 1} of {pages.length}</span>
                  </header>
                  <div className="paper-sheet-body">
                    {pageText}
                  </div>
                  <footer className="paper-sheet-footer">
                    <span>StudyBrain AI Verified Source</span>
                    <span>{idx + 1}</span>
                  </footer>
                </article>
              ))
            )}
          </div>
        )}
      </div>

      <footer className="file-viewer-footer">
        <div className="doc-search">
          <Search size={14} />
          <input 
            type="text" 
            placeholder={viewMode === 'ai' ? "Filter AI semantic chunks..." : "Search document keywords..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </footer>
    </div>
  );
}