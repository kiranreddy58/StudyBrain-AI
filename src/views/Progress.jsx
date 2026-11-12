import { useState, useEffect } from 'react';
import './Progress.css';
import { Award, Brain, TrendingUp, Calendar, Loader } from 'lucide-react';
import { authFetch } from '../utils/api';

const API = '/api';

export default function Progress() {
  const [topics, setTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await authFetch(`${API}/copilot/learning-progress`);
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);
        setRecommendations(data.recommendations || []);
        setHeatmapData(data.heatmap_data || []);
      }
    } catch (err) {
      console.error("Progress fetch error:", err);
      setTopics([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleAuthChange = () => {
      fetchData();
    };
    window.addEventListener('sb_auth_changed', handleAuthChange);
    return () => window.removeEventListener('sb_auth_changed', handleAuthChange);
  }, []);

  const getLevelIcon = (level) => {
    if (level === 'master') return '🏆';
    if (level === 'advanced') return '🚀';
    if (level === 'intermediate') return '📈';
    return '🌱';
  };

  return (
    <div className="progress-container">
      <div className="progress-grid">
        {/* Heatmap Section */}
        <div className="consistency-card">
          <div className="stat-header">
            <h3 className="card-title">Study Consistency Heatmap</h3>
            <div className="eyebrow-tag"><Calendar size={12} style={{marginRight: '4px'}} /> Last 60 Days</div>
          </div>
          {heatmapData.length === 0 ? (
            <div className="empty-mini-state">No study history recorded yet for your account. Complete quizzes to fill your heatmap!</div>
          ) : (
            <div className="heatmap-scroll-wrapper">
              <div className="heatmap-grid">
                {heatmapData.map((lvl, i) => (
                  <div key={i} className={`heatmap-cell lvl-${lvl}`} title={`Day ${i + 1}: ${lvl} study sessions`} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', alignItems: 'center', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                <span>Less</span>
                <div className="heatmap-cell" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-1" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-2" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-3" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-4" style={{width: '12px', height: '12px'}} />
                <span>More</span>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <div className="mastery-radar">
          <h3 className="card-title" style={{marginBottom: '1rem'}}>AI Recommended Focus Areas</h3>
          {loading ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--color-text-muted)', fontSize:'0.85rem'}}>
              <Loader size={14} className="spin" /> Calculating personal recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>
              No specific recommendations yet. Ingest documents and test your knowledge to trigger recommendations.
            </p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              {recommendations.map((rec, i) => {
                const color = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
                return (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 0.85rem', borderRadius:'10px', background:'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                    <span style={{color, fontWeight:800, fontSize:'1.1rem'}}>{i + 1}</span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{fontSize:'0.85rem', fontWeight:600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{rec.topic}</div>
                      <div style={{fontSize:'0.72rem', color:'var(--color-text-muted)'}}>
                        Mastery: {rec.mastery_score}% • <span style={{color, fontWeight: 600}}>{rec.priority.toUpperCase()} PRIORITY</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Topic Mastery List */}
      <div className="topics-list-card">
        <h3 className="card-title">Concept Mastery Breakdown</h3>
        {loading ? (
          <div style={{padding:'1rem 0', color:'var(--color-text-muted)', fontSize:'0.85rem'}}>Loading topic scores...</div>
        ) : topics.length === 0 ? (
          <div className="empty-mini-state">
            No topics tracked yet. Ingest study files and complete quizzes in AI Assistant to establish mastery scores.
          </div>
        ) : (
          <div className="topics-table">
            <div className="table-header">
              <span>Topic Name</span>
              <span>Level</span>
              <span>Mastery Progress</span>
            </div>
            {topics.map((t) => (
              <div key={t.topic} className="table-row">
                <span className="topic-cell">{t.topic}</span>
                <span className={`level-badge ${t.level}`}>
                  {getLevelIcon(t.level)} {t.level}
                </span>
                <div className="topic-progress-wrap">
                  <div className="progress-track" style={{flex: 1}}>
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${t.mastery_score}%`, 
                        background: t.mastery_score >= 80 ? '#10b981' : t.mastery_score >= 60 ? '#6366f1' : '#f59e0b'
                      }} 
                    />
                  </div>
                  <span className="percent-label">{t.mastery_score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
