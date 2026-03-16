import './Shell.css';
import Sidebar from './Sidebar';
import Window from '../ui/Window';

export default function Shell({ children, currentView, onViewChange, user, openWindows = [], onCloseWindow }) {
  return (
    <div className="shell-container">
      <Sidebar currentView={currentView} onViewChange={onViewChange} />
      
      <main className="shell-main">
        <header className="shell-header">
          <div className="shell-header-title">
            {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
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

        {/* Floating Windows Area */}
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
