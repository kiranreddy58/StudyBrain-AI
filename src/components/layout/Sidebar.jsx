import './Sidebar.css';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  LineChart, 
  Settings, 
  Sparkles,
  LogIn,
  UserCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library', label: 'My Library', icon: BookOpen },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'progress', label: 'Topic Mastery', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentView, onViewChange, onOpenAuth, currentUser, onNavigateHome }) {
  return (
    <aside className="sidebar">
      <div 
        className="sidebar-logo" 
        onClick={onNavigateHome} 
        title="Go to Homepage"
        role="button"
        tabIndex={0}
      >
        <div className="sidebar-logo-icon">🧠</div>
        <div className="sidebar-logo-text">Study<span>Brain</span></div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.label}
          >
            <div className="sidebar-link-icon">
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {currentUser ? (
          <div className="sidebar-user-badge" onClick={() => onViewChange('settings')} title="View Account Settings">
            <div className="badge-avatar">
              {(currentUser.display_name || currentUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="badge-info">
              <span className="badge-name">{currentUser.display_name || currentUser.username}</span>
              <span className="badge-role">Active Account</span>
            </div>
          </div>
        ) : (
          <button className="sidebar-auth-callout" onClick={onOpenAuth}>
            <Sparkles size={16} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
