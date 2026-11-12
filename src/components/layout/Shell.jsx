import { useState, useEffect, useRef } from 'react';
import { 
  Search as SearchIcon, 
  X, 
  FileText, 
  Menu, 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  LineChart, 
  Settings as SettingsIcon,
  LogOut, 
  LogIn, 
  User as UserIcon,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import './Shell.css';
import Sidebar from './Sidebar';
import Window from '../ui/Window';
import AuthModal from '../auth/AuthModal';
import { authFetch, getCurrentUser, logoutUser } from '../../utils/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'progress', label: 'Mastery', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Shell({ 
  children, 
  currentView, 
  onViewChange, 
  user, 
  openWindows = [], 
  onCloseWindow,
  onNavigateHome
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('sb_auth_changed', handleAuthChange);
    return () => window.removeEventListener('sb_auth_changed', handleAuthChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await authFetch(`/api/search?query=${encodeURIComponent(query)}`);
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

  const handleLogout = () => {
    logoutUser();
    setUserDropdownOpen(false);
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setUserDropdownOpen(false);
    setMobileDrawerOpen(false);
  };

  const displayName = currentUser?.display_name || currentUser?.username || user?.name || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="shell-container">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          onViewChange(view);
          setMobileDrawerOpen(false);
        }} 
        onOpenAuth={() => openAuth('login')}
        currentUser={currentUser}
        onNavigateHome={onNavigateHome}
      />
      
      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="drawer-brand" onClick={() => { if (onNavigateHome) onNavigateHome(); }}>
            <span className="drawer-logo">🧠</span>
            <span className="drawer-title">Study<strong>Brain</strong></span>
          </div>
          <button className="drawer-close" onClick={() => setMobileDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card in Drawer */}
        <div className="drawer-user-card">
          <div className="drawer-avatar">{initial}</div>
          <div className="drawer-user-info">
            <span className="drawer-user-name">{displayName}</span>
            <span className="drawer-user-status">
              {currentUser ? currentUser.email : 'Personal Vault'}
            </span>
          </div>
        </div>

        {/* Drawer Nav links */}
        <nav className="drawer-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`drawer-link ${currentView === item.id ? 'active' : ''}`}
              onClick={() => {
                onViewChange(item.id);
                setMobileDrawerOpen(false);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="drawer-footer">
          {currentUser ? (
            <button className="drawer-auth-btn logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="drawer-auth-group">
              <button className="drawer-auth-btn signin" onClick={() => openAuth('login')}>
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
              <button className="drawer-auth-btn signup" onClick={() => openAuth('register')}>
                <Sparkles size={18} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      <main className="shell-main">
        {/* Responsive Header */}
        <header className="shell-header">
          <div className="shell-header-left">
            <button 
              className="mobile-hamburger-btn" 
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="shell-header-title">
              {currentView === 'assistant' ? 'AI Study Assistant' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h1>
          </div>

          {/* Global Search Bar (Adaptive for desktop & mobile) */}
          <div className={`shell-global-search ${showSearchMobile ? 'mobile-visible' : ''}`}>
            <SearchIcon size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search concepts, notes & materials..." 
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch} aria-label="Clear search">
                {isSearching ? <span style={{ fontSize: '10px' }}>⏳</span> : <X size={16} />}
              </button>
            )}

            {results.length > 0 && (
              <div className="search-results-dropdown">
                {results.map((res, idx) => (
                  <div 
                    key={idx} 
                    className="search-result-item" 
                    onClick={() => {
                      onViewChange('library');
                      clearSearch();
                      setShowSearchMobile(false);
                    }}
                  >
                    <FileText size={16} />
                    <div className="result-info">
                      <span className="result-text">{res.metadata.filename || res.metadata.source || 'Document'}</span>
                      <p className="result-snippet">{res.metadata.chunk_text || res.metadata.content || 'Snippet...'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="shell-header-actions">
            {/* Mobile search toggle icon */}
            <button 
              className="mobile-search-toggle"
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              aria-label="Toggle mobile search"
            >
              <SearchIcon size={18} />
            </button>

            {/* User Profile Dropdown Button */}
            <div className="user-profile-wrapper" ref={dropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <div className="user-avatar">{initial}</div>
                <div className="user-profile-text">
                  <span className="user-name">{displayName}</span>
                  <span className="user-role">{currentUser ? 'Online' : 'Guest'}</span>
                </div>
                <ChevronDown size={14} className="user-chevron" />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="dropdown-avatar">{initial}</div>
                    <div className="dropdown-meta">
                      <strong>{displayName}</strong>
                      <small>{currentUser?.email || 'Guest Mode (Data Stored Locally)'}</small>
                    </div>
                  </div>

                  <div className="user-dropdown-divider" />

                  <button 
                    className="user-dropdown-item"
                    onClick={() => {
                      onViewChange('settings');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <SettingsIcon size={16} />
                    <span>Account Settings</span>
                  </button>

                  <button 
                    className="user-dropdown-item"
                    onClick={() => {
                      if (onNavigateHome) onNavigateHome();
                      setUserDropdownOpen(false);
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Landing Page</span>
                  </button>

                  <div className="user-dropdown-divider" />

                  {currentUser ? (
                    <button className="user-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <div className="user-dropdown-auth-actions">
                      <button 
                        className="user-dropdown-item signin"
                        onClick={() => openAuth('login')}
                      >
                        <LogIn size={16} />
                        <span>Sign In</span>
                      </button>
                      <button 
                        className="user-dropdown-item signup"
                        onClick={() => openAuth('register')}
                      >
                        <UserIcon size={16} />
                        <span>Create Account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="shell-content">
          {children}
        </div>

        {/* Draggable Multi-Windows */}
        {openWindows.map((win) => (
          <Window 
            key={win.id} 
            {...win} 
            onClose={() => onCloseWindow(win.id)} 
          />
        ))}

        {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
        <nav className="shell-bottom-nav" aria-label="Mobile Navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={(loggedUser) => {
          setCurrentUser(loggedUser);
        }}
      />
    </div>
  );
}
