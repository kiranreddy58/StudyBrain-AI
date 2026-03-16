import { useState, useEffect, useRef } from 'react';
import './Library.css';
import { Search, FileText, FileCode, Image as ImageIcon, Plus, MessageCircle, Eye } from 'lucide-react';

const API = '/api';

const getIcon = (type) => {
  switch (type) {
    case 'pdf': return <FileText size={22} color="#f87171" />;
    case 'code': return <FileCode size={22} color="#60a5fa" />;
    case 'image': return <ImageIcon size={22} color="#fbbf24" />;
    default: return <FileText size={22} color="#94a3b8" />;
  }
};

export default function Library({ onOpenAI }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        // Re-fetch document list after successful upload
        await fetchDocuments();
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.detail || res.status}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to connect to the server for upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // reset input
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

        <button className="btn-primary" onClick={triggerUpload} disabled={uploading} style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          {uploading ? 'Uploading...' : 'New Module'}
        </button>
      </div>

      {uploading ? (
        <div className="upload-area" style={{ borderColor: 'var(--color-accent)' }}>
          <div className="upload-title">Ingesting document... please wait.</div>
          <div className="progress-track" style={{ width: '300px', marginTop: '1rem' }}>
            <div className="progress-fill" style={{ width: '100%', backgroundColor: 'var(--color-accent)', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      ) : (
        <div className="upload-area" onClick={triggerUpload}>
          <div className="upload-icon">
            <Plus size={32} />
          </div>
          <div className="upload-title">Drop files here to ingest</div>
          <p className="upload-desc">PDFs, images, notes, or code. Max 50MB per file.</p>
          <button className="btn-ghost" style={{ marginTop: '0.5rem' }}>Browse Local Files</button>
        </div>
      )}

      <div className="library-grid">
        {filteredDocs.length === 0 && !uploading && (
          <div style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            No documents found. Start by uploading your study materials.
          </div>
        )}
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-type-icon">
              {getIcon(doc.type || 'text')}
            </div>
            <div className="doc-title" title={doc.filename || doc.id}>
              {doc.filename || ((doc.id).substring(0, 15) + '...')}
            </div>
            <div className="doc-meta">
              <span>{new Date(doc.uploaded_at || Date.now()).toLocaleDateString() || 'Today'}</span>
              <span>{doc.chunks_count ? `${doc.chunks_count} chunks` : 'Indexed'}</span>
            </div>
            
            <div className="doc-actions">
              <button className="btn-doc-action" onClick={() => alert("Viewing raw file feature coming soon!")}>
                <Eye size={14} />
                View
              </button>
              <button className="btn-doc-action" onClick={() => onOpenAI(doc.filename || doc.id)}>
                <MessageCircle size={14} />
                Ask AI
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
