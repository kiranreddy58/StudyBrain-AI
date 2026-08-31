import { useState, useEffect } from 'react';
import './Dashboard.css';
import { Book, Clock, Target, Zap, ChevronRight, Loader } from 'lucide-react';
import OnboardingWelcome from '../components/OnboardingWelcome';

const API = '/api';

export default function Dashboard({ user, onSwitchView }) {
  const [mastery, setMastery] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [docsCount, setDocsCount] = useState(0);
  const [stats, setStats] = useState({ studyTime: '0h', streak: '0d' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [masteryRes, recRes, docRes] = await Promise.all([
          fetch(`${API}/learning/topic-mastery`),
          fetch(`${API}/copilot/learning-progress`),
          fetch(`${API}/documents`),
        ]);
        
        if (masteryRes.ok) {
          const m = await masteryRes.json();
          setMastery(m.topics || []);
        }

        if (docRes.ok) {
          const d = await docRes.json();
          setDocsCount(d.documents?.length || 0);
        }

        if (recRes.ok) {
          const data = await recRes.json();
          setRecommendations(data.recommendations || []);
          setStats({
            studyTime: data.total_study_time || '0h',
            streak: data.streak || '0d'
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    
    const eventSource = new EventSource(`${API}/events`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Real-time update received:", data.type);
      
      fetchData();
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  
  const avgAccuracy = mastery.length
    ? Math.round(mastery.reduce((s, t) => s + t.mastery_score, 0) / mastery.length)
    : 0;

  const STATS_CARDS = [
    { label: 'Topics Tracked', value: String(docsCount), icon: Book, color: '#6366f1' },
    { label: 'Study Time', value: stats.studyTime || '0h', icon: Clock, color: '#22d3ee' },
    { label: 'Avg. Mastery', value: mastery.length ? `${avgAccuracy}%` : '0%', icon: Target, color: '#a78bfa' },
    { label: 'Study Streak', value: stats.streak || '0d', icon: Zap, color: '#f59e0b' },
  ];

  const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#f472b6', '#10b981', '#f59e0b'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-welcome" style={{ gridColumn: 'span 2', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome back, {user?.name || 'Student'}! 👋</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Here is what's happening with your study progress.</p>
      </header>

      {mastery.length === 0 && !loading && (
        <OnboardingWelcome onUploadClick={() => onSwitchView('library')} />
      )}

      <div className="dashboard-stats-row">
        {STATS_CARDS.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-header">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="stat-value">
              {loading ? <Loader size={18} className="spin" /> : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-card">
        <h3 className="card-title">Subject Mastery</h3>
        {loading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
            Loading mastery data...
          </div>
        ) : mastery.length === 0 ? (
          <div className="empty-mini-state">No topic data yet</div>
        ) : (
          <div className="mastery-list">
            {mastery.slice(0, 3).map((item) => (
              <div key={item.topic} className="mastery-item">
                <div className="mastery-info">
                  <span className="mastery-name">{item.topic}</span>
                  <span className="mastery-percent">{item.mastery_score}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.mastery_score}%`, background: item.mastery_score > 70 ? '#10b981' : '#6366f1' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-card">
        <div className="stat-header" style={{ marginBottom: '0.5rem' }}>
          <h3 className="card-title">What to Study Next</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>AI Recommendations</span>
        </div>
        {loading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>Loading...</div>
        ) : recommendations.length === 0 ? (
          <div className="empty-mini-state">Upload files to get AI insights</div>
        ) : (
          <div className="recent-activities">
            {recommendations.map((rec, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <p className="activity-title">{rec.type}: {rec.topic}</p>
                  <p className="activity-time">{rec.reason}</p>
                </div>
                <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
