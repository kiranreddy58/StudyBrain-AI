import './Sidebar.css';
import { LayoutDashboard, BookOpen, MessageSquare, LineChart, Settings, HelpCircle, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library', label: 'My Library', icon: BookOpen },
  { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
  { id: 'progress', label: 'Topic Mastery', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🧠</div>
        <div className="sidebar-logo-text">Study<span>Brain</span></div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <div className="sidebar-link-icon">
              <item.icon size={20} strokeWidth={currentView === item.id ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link support-btn" style={{ marginTop: 'auto' }}>
          <div className="sidebar-link-icon"><HelpCircle size={20} /></div>
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
}
