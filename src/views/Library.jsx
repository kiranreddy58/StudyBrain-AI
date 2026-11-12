import { useState, useEffect, useRef } from 'react';
import './Library.css';
import { Search, FileText, FileCode, Image as ImageIcon, Plus, MessageCircle, Eye, Trash2, Edit3 } from 'lucide-react';
import { authFetch, getCurrentUser } from '../utils/api';

const API = '/api';

const getIcon = (type) => {
  switch (type) {
    case 'pdf': return <FileText size={22} color="#f87171" />;
    case 'code': return <FileCode size={22} color="#60a5fa" />;
    case 'image': return <ImageIcon size={22} color="#fbbf24" />;
    default: return <FileText size={22} color="#94a3b8" />;
  }
};

export default function Library({ onOpenAI, onView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await authFetch(`${API}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const handleAuthChange = () => {
      fetchDocuments();
    };
    window.addEventListener('sb_auth_changed', handleAuthChange);

    let eventSource;
    try {
      eventSource = new EventSource(`${API}/events`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const activeUid = getCurrentUser()?.id;
          if (data.user_id && activeUid && data.user_id !== activeUid) {
            return;
          }
          if (data.type && data.type.startsWith("DOCUMENT_")) {
            fetchDocuments();
          }
        } catch {
          fetchDocuments();
        }
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch {
      // SSE fallback
    }

    return () => {
      window.removeEventListener('sb_auth_changed', handleAuthChange);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleDelete = async (docId, e) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to delete this study module from your vault?")) return;
    try {
      const res = await authFetch(`${API}/document/${docId}`, { method: 'DELETE' });
      if (res.ok) fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleRename = async (docId, currentName, e) => {
    e?.stopPropagation();
    const newName = prompt("Enter new document name:", currentName);
    if (!newName || newName === currentName) return;
    try {
      const res = await authFetch(`${API}/document/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newName }),
      });
      if (res.ok) fetchDocuments();
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch(`${API}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Upload failed: ${err.detail || res.status}`);
      } else {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to connect to the server for upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const filteredDocs = documents.filter(doc => 
    (doc.filename || doc.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library-container">
      <div className="library-controls">
        <div className="search-bar">
          <Search size={18} color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Search study materials..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect} 
        />

        <button className="btn-primary" onClick={triggerUpload} disabled={uploading}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          {uploading ? 'Ingesting...' : 'Upload Document'}
        </button>
      </div>

      {uploading ? (
        <div className="upload-area" style={{ borderColor: 'var(--color-accent)' }}>
          <div className="upload-title">Ingesting & chunking document for AI retrieval...</div>
          <p className="upload-desc">Generating vector embeddings and semantic citations.</p>
          <div className="progress-track" style={{ width: '280px', marginTop: '1rem' }}>
            <div className="progress-fill" style={{ width: '100%', backgroundColor: 'var(--color-accent)', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      ) : (
        <div className="upload-area" onClick={triggerUpload}>
          <div className="upload-icon">
            <Plus size={32} />
          </div>
          <div className="upload-title">Drop files here to ingest</div>
          <p className="upload-desc">PDFs, lecture notes, textbook chapters, or code. Isolated to your account.</p>
          <button className="btn-ghost" style={{ marginTop: '0.5rem' }}>Browse Local Files</button>
        </div>
      )}

      <div className="library-grid">
        {filteredDocs.length === 0 && !uploading && (
          <div className="empty-mini-state" style={{ gridColumn: '1 / -1' }}>
            No documents found in your vault. Upload PDFs, slides, or code files to begin asking questions!
          </div>
        )}
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="doc-type-icon">
                {getIcon(doc.type || 'text')}
              </div>
              <button 
                className="btn-doc-edit" 
                onClick={(e) => handleRename(doc.id, doc.filename, e)}
                title="Rename document"
              >
                <Edit3 size={14} />
              </button>
            </div>
            
            <div className="doc-title" title={doc.filename || doc.id}>
              {doc.filename || ((doc.id).substring(0, 15) + '...')}
            </div>
            
            <div className="doc-meta">
              <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}</span>
              <span>{doc.chunks_count || 1} chunks</span>
            </div>
            
            <div className="doc-actions">
              <button className="btn-doc-action" onClick={() => onView(doc)} title="Read document">
                <Eye size={14} /> View
              </button>
              <button className="btn-doc-action primary" onClick={() => onOpenAI(doc)} title="Ask AI tutor">
                <MessageCircle size={14} /> Ask AI
              </button>
              <button className="btn-doc-action delete" onClick={(e) => handleDelete(doc.id, e)} title="Delete document">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
