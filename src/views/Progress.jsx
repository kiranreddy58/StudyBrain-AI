import { useState, useEffect } from 'react';
import './Progress.css';
import { Award, Brain, TrendingUp, Calendar, Loader } from 'lucide-react';

const API = '/api';

export default function Progress() {
  const [topics, setTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API}/copilot/learning-progress`);
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
    }
    fetchData();
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
        {/* Study Consistency Heatmap */}
        <div className="consistency-card">
          <div className="stat-header">
            <h3 className="card-title">Study Consistency</h3>
            <div className="eyebrow-tag"><Calendar size={12} style={{marginRight: '4px'}} /> Last 60 Days</div>
          </div>
          {heatmapData.length === 0 ? (
            <div className="empty-mini-state">No study history recorded yet</div>
          ) : (
            <>
              <div className="heatmap-grid">
                {heatmapData.map((lvl, i) => (
                  <div key={i} className={`heatmap-cell lvl-${lvl}`} title={`${lvl} sessions`} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                <span>Less</span>
                <div className="heatmap-cell" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-1" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-2" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-3" style={{width: '12px', height: '12px'}} />
                <div className="heatmap-cell lvl-4" style={{width: '12px', height: '12px'}} />
                <span>More</span>
              </div>
            </>
          )}
        </div>

        {/* What to Study Next (live recommendations) */}
        <div className="mastery-radar">
          <h3 className="card-title" style={{marginBottom: '1rem'}}>What to Study Next</h3>
          {loading ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--color-text-muted)', fontSize:'0.85rem'}}>
              <Loader size={14} /> Loading recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <p style={{color: 'var(--color-text-muted)', fontSize: '0.85rem'}}>
              Track more activity to get recommendations.
            </p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              {recommendations.map((rec, i) => {
                const color = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
                return (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0.75rem', borderRadius:'8px', background:'var(--color-surface-2, rgba(255,255,255,0.04))'}}>
                    <span style={{color, fontWeight:700, fontSize:'1.1rem'}}>{i + 1}</span>
                    <div>
                      <div style={{fontSize:'0.85rem', fontWeight:600}}>{rec.topic}</div>
                      <div style={{fontSize:'0.72rem', color:'var(--color-text-muted)'}}>
                        Mastery {rec.mastery_score}% · <span style={{color}}>{rec.priority} priority</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Topic Mastery (live) */}
      <div className="progress-list">
        <h3 className="card-title">Detailed Topic Mastery</h3>
        {loading ? (
          <div style={{color:'var(--color-text-muted)', fontSize:'0.85rem', padding:'1rem 0'}}>
            Loading topic data...
          </div>
        ) : topics.length === 0 ? (
          <div style={{color:'var(--color-text-muted)', fontSize:'0.85rem', padding:'1rem 0'}}>
            No topics tracked yet. Complete quizzes and use the AI assistant to build your progress profile.
          </div>
        ) : (
          topics.map(topic => (
            <div key={topic.topic} className="topic-row">
              <div className="topic-icon">{getLevelIcon(topic.level)}</div>
              <div className="topic-main">
                <div className="topic-title">{topic.topic}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width: `${topic.mastery_score}%`, backgroundColor: 'var(--color-accent)'}} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{topic.mastery_score}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{topic.level}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
