import { useState, useEffect } from 'react';
import './Dashboard.css';
import { Book, Clock, Target, Zap, ChevronRight, Loader } from 'lucide-react';

const API = 'http://127.0.0.1:8000/api';

export default function Dashboard({ user }) {
  const [mastery, setMastery] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ studyTime: '—', streak: '—' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [masteryRes, recRes] = await Promise.all([
          fetch(`${API}/learning/topic-mastery`),
          fetch(`${API}/copilot/learning-progress`),
        ]);
        if (masteryRes.ok) {
          const data = await masteryRes.json();
          setMastery(data.topics || []);
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
        setMastery([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Derive quick-stats from live mastery data
  const totalTopics = mastery.length;
  const avgAccuracy = mastery.length
    ? Math.round(mastery.reduce((s, t) => s + t.mastery_score, 0) / mastery.length)
    : 0;

  const STATS_CARDS = [
    { label: 'Topics Tracked', value: String(totalTopics || '—'), icon: Book, color: '#6366f1' },
    { label: 'Study Time', value: stats.studyTime, icon: Clock, color: '#22d3ee' },
    { label: 'Avg. Mastery', value: mastery.length ? `${avgAccuracy}%` : '—', icon: Target, color: '#a78bfa' },
    { label: 'Study Streak', value: stats.streak, icon: Zap, color: '#f59e0b' },
  ];

  const COLORS = ['#6366f1', '#22d3ee', '#a78bfa', '#f472b6', '#10b981', '#f59e0b'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-welcome" style={{ gridColumn: 'span 2', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome back, {user?.name || 'Student'}! 👋</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Here is what's happening with your study progress.</p>
      </header>

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
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
            No topics tracked yet. Upload study materials and take quizzes to build your mastery profile.
          </div>
        ) : (
          <div className="mastery-list">
            {mastery.slice(0, 6).map((item, idx) => (
              <div key={item.topic} className="mastery-item">
                <div className="mastery-info">
                  <span className="mastery-name">{item.topic}</span>
                  <span className="mastery-percent">{item.mastery_score}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.mastery_score}%`, backgroundColor: COLORS[idx % COLORS.length] }}
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
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
            Keep studying to unlock personalised recommendations.
          </div>
        ) : (
          <div className="recent-activities">
            {recommendations.map((rec, i) => {
              const priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
              return (
                <div key={i} className="activity-item">
                  <div className="activity-dot" style={{ backgroundColor: priorityColor }} />
                  <div className="activity-content">
                    <div className="activity-title">{rec.topic}</div>
                    <div className="activity-time">
                      Mastery: {rec.mastery_score}% · Priority: {rec.priority}
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-muted)" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
