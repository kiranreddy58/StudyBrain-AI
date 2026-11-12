import { useState, useCallback, useEffect } from 'react';
import './index.css';

import ScrollCanvas from './components/ScrollCanvas';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductOverview from './components/ProductOverview';
import FeaturesSection from './components/FeaturesSection';
import HowItWorks from './components/HowItWorks';
import TechStack from './components/TechStack';
import UseCases from './components/UseCases';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

import Shell from './components/layout/Shell';
import Dashboard from './views/Dashboard';
import Library from './views/Library';
import Progress from './views/Progress';
import Settings from './views/Settings';
import AssistantWorkspace from './views/AssistantWorkspace';
import AuthView from './views/AuthView';
import AuthModal from './components/auth/AuthModal';
import { getCurrentUser, getToken } from './utils/api';

const TOTAL_FRAMES = 192;

export default function App() {
  const initialUser = getCurrentUser();
  const initialToken = getToken();
  const [mode, setMode] = useState(initialUser && initialToken ? 'study' : 'auth'); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [openWindows, setOpenWindows] = useState([]); 
  const [userName, setUserName] = useState('Student');
  const [activeDocument, setActiveDocument] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const updateUserInfo = () => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.display_name || user.username || 'Student');
    } else {
      const savedName = localStorage.getItem('sb_displayName');
      if (savedName) setUserName(savedName);
      else setUserName('Student');
    }
  };

  useEffect(() => {
    updateUserInfo();

    const handleAuthChange = () => {
      updateUserInfo();
      const user = getCurrentUser();
      const token = getToken();
      if (!user || !token) {
        setMode('auth');
      }
    };

    window.addEventListener('sb_settings_updated', updateUserInfo);
    window.addEventListener('sb_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('sb_settings_updated', updateUserInfo);
      window.removeEventListener('sb_auth_changed', handleAuthChange);
    };
  }, []);

  const handleOpenWindow = useCallback((docTitle) => {
    const windowId = Date.now();
    setOpenWindows(prev => [
      ...prev, 
      { id: windowId, title: docTitle, initialPos: { x: 100 + prev.length * 40, y: 100 + prev.length * 40 } }
    ]);
  }, []);

  const handleCloseWindow = useCallback((id) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  }, []);
  
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  const handleProgress = useCallback((loaded, total) => {
    setLoadProgress(loaded / total);
  }, []);

  const handleReady = useCallback(() => {
    setTimeout(() => setIsReady(true), 700);
  }, []);

  const handleFrameChange = useCallback((idx) => {
    setScrollPct(idx / (TOTAL_FRAMES - 1));
  }, []);

  const enterStudyMode = (force = false) => {
    if (!force) {
      const user = getCurrentUser();
      const token = getToken();
      if (!user || !token) {
        openAuth('login');
        return;
      }
    }
    localStorage.setItem('sb_lastMode', 'study');
    setMode('study');
    window.scrollTo(0, 0);
  };

  const navigateHome = () => {
    setMode('home');
    window.scrollTo(0, 0);
  };

  const handleViewDocument = (doc) => {
    setActiveDocument(doc);
    setCurrentView('assistant');
  };

  const openAuth = (m = 'login') => {
    setAuthMode(m);
    setMode('auth');
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={{ name: userName }} onSwitchView={setCurrentView} />;
      case 'library': return <Library onView={handleViewDocument} onOpenAI={handleViewDocument} />;
      case 'progress': return <Progress />;
      case 'settings': return <Settings />;
      case 'assistant': return <AssistantWorkspace user={{ name: userName }} initialDoc={activeDocument} />;
      default: return <Dashboard user={{ name: userName }} onSwitchView={setCurrentView} />;
    }
  };

  if (mode === 'auth') {
    return (
      <AuthView 
        initialMode={authMode}
        onAuthSuccess={() => {
          updateUserInfo();
          enterStudyMode(true);
        }}
        onBackToHome={navigateHome}
      />
    );
  }

  if (mode === 'study') {
    return (
      <Shell 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={{ name: userName }}
        openWindows={openWindows}
        onOpenWindow={handleOpenWindow}
        onCloseWindow={handleCloseWindow}
        onNavigateHome={navigateHome}
      >
        {renderView()}
      </Shell>
    );
  }

  return (
    <>
      <LoadingScreen progress={loadProgress} hidden={isReady} />
      <ScrollCanvas onProgress={handleProgress} onReady={handleReady} onFrameChange={handleFrameChange} />
      
      <div className="scroll-progress-bar" style={{ width: `${scrollPct * 100}%` }} aria-hidden="true" />

      <Navbar onEnterApp={enterStudyMode} onOpenAuth={openAuth} />

      <main className="page-wrapper">
        <HeroSection onEnterApp={enterStudyMode} />
        
        <ProductOverview onEnterApp={enterStudyMode} />
        <FeaturesSection onEnterApp={enterStudyMode} />
        <HowItWorks />
        <TechStack />
        <UseCases />
        <CTASection onEnterApp={enterStudyMode} />
        
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <h2 className="section-title">Ready to build your personal knowledge vault?</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={enterStudyMode}>
              Enter Study Workspace →
            </button>
            <button className="btn-ghost" onClick={() => openAuth('register')} style={{ padding: '0.85rem 1.5rem' }}>
              Create Account
            </button>
          </div>
        </div>

        <Footer onEnterApp={enterStudyMode} />
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          enterStudyMode();
        }}
      />
    </>
  );
}
