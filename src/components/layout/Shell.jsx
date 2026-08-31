import { useState } from 'react';
import { Search as SearchIcon, X, FileText } from 'lucide-react';
import './Shell.css';
import Sidebar from './Sidebar';
import Window from '../ui/Window';

export default function Shell({ children, currentView, onViewChange, user, openWindows = [], onCloseWindow }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div className="shell-container">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      
      <main className="shell-main">
        <header className="shell-header">
          <div className="shell-header-title">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </div>

          <div className="shell-global-search">
            <SearchIcon size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search across all materials..." 
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}

            {results.length > 0 && (
              <div className="search-results-dropdown">
                {results.map((res, idx) => (
                  <div key={idx} className="search-result-item" onClick={() => {
                    
                    console.log("Navigate to:", res.metadata.doc_id);
                    clearSearch();
                  }}>
                    <FileText size={14} />
                    <div className="result-info">
                      <span className="result-text">{res.metadata.filename || 'Document'}</span>
                      <p className="result-snippet">{res.metadata.chunk_text || res.metadata.content || 'Snippet...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="shell-header-actions">
            <div className="user-profile">
              <span className="user-name">{user?.name || 'Guest Student'}</span>
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'G'}
              </div>
            </div>
          </div>
        </header>
        
        <div className="shell-content">
          {children}
        </div>

        {}
        {openWindows.map((win) => (
          <Window 
            key={win.id} 
            {...win} 
            onClose={() => onCloseWindow(win.id)} 
          />
        ))}
      </main>
    </div>
  );
}
