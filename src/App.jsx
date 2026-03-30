import { useState, useCallback, useEffect } from 'react';
import './index.css';

// Phase 0 Components (Homepage)
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

// Phase 1 Components (Study App)
import Shell from './components/layout/Shell';
import Dashboard from './views/Dashboard';
import Library from './views/Library';
import Progress from './views/Progress';
import Settings from './views/Settings';
import AssistantWorkspace from './views/AssistantWorkspace';

const TOTAL_FRAMES = 192;

export default function App() {
  const [mode, setMode] = useState('home'); // 'home' or 'study'
  const [currentView, setCurrentView] = useState('dashboard');
  const [openWindows, setOpenWindows] = useState([]); // Array of window objects { id, title }
  const [userName, setUserName] = useState('Student');
  const [activeDocument, setActiveDocument] = useState(null);

  useEffect(() => {
    // Initial load
    const savedName = localStorage.getItem('sb_displayName');
    if (savedName) {
      setUserName(savedName);
      // AUTO-LOGIN: If user was last in study mode, return there
      const lastMode = localStorage.getItem('sb_lastMode');
      if (lastMode === 'study') {
        setMode('study');
      }
    }

    // Listen for cross-component setting updates
    const handleSettingsUpdate = () => {
      const updatedName = localStorage.getItem('sb_displayName');
      if (updatedName) setUserName(updatedName);
    };

    window.addEventListener('sb_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('sb_settings_updated', handleSettingsUpdate);
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
  
  // Phase 0 States
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);

  const handleProgress = useCallback((loaded, total) => {
    setLoadProgress(loaded / total);
  }, []);

  const handleReady = useCallback(() => {
    setTimeout(() => setIsReady(true), 700);
  }, []);

  const handleFrameChange = useCallback((idx) => {
    setCurrentFrame(idx);
    setScrollPct(idx / (TOTAL_FRAMES - 1));
  }, []);

  const enterStudyMode = () => {
    localStorage.setItem('sb_lastMode', 'study');
    setMode('study');
    window.scrollTo(0, 0);
  };

  const handleViewDocument = (doc) => {
    setActiveDocument(doc);
    setCurrentView('assistant');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard user={{ name: userName }} onSwitchView={setCurrentView} />;
      case 'library': return <Library onView={handleViewDocument} onOpenAI={handleViewDocument} />;
      case 'progress': return <Progress />;
      case 'settings': return <Settings />;
      case 'assistant': return <AssistantWorkspace user={{ name: userName }} initialDoc={activeDocument} />;
      default: return <Dashboard user={{ name: userName }} />;
    }
  };

  if (mode === 'study') {
    return (
      <Shell 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={{ name: userName }}
        openWindows={openWindows}
        onCloseWindow={handleCloseWindow}
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
      <div className="frame-counter" aria-hidden="true">
        {String(currentFrame + 1).padStart(3, '0')} / {TOTAL_FRAMES}
      </div>

      <Navbar onEnterApp={enterStudyMode} />

      <main className="page-wrapper">
        <HeroSection onEnterApp={enterStudyMode} />
        
        <ProductOverview onEnterApp={enterStudyMode} />
        <FeaturesSection onEnterApp={enterStudyMode} />
        <HowItWorks />
        <TechStack />
        <UseCases />
        <CTASection onEnterApp={enterStudyMode} />
        
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <h2 className="section-title">Ready to start?</h2>
          <button className="btn-primary" onClick={enterStudyMode} style={{ marginTop: '1.5rem' }}>
            Enter Study Workspace
          </button>
        </div>

        <Footer onEnterApp={enterStudyMode} />
      </main>
    </>
  );
}
