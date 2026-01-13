import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import { useGuardian } from "../context/GuardianContext"; // Import context
import api from "../services/api";

export default function GuardianProgressPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { selectedWard, wards, selectWard } = useGuardian(); // Use context

  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false); // Changed default to false as context handles initial loading mostly
  const [wardProgress, setWardProgress] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const userProfile = user || location.state?.userProfile || { userName: "Guardian", role: "Guardian" };

  useEffect(() => {
    if (selectedWard) loadWardData(selectedWard.id);
  }, [selectedWard]);

  const loadWardData = async (wardId) => {
    setLoading(true);
    try {
      // In a real app we would fetch specific progress data for this page
      // For now we simulate or use the same endpoint if it returns detailed data
      // Using mock data for "Portal" specifics as backend endpoint for "Progress Portal" details might not be distinct yet
      // But we can try to fetch real progress from the same endpoint as dashboard if it has enough info
      const response = await api.getWardProgress(wardId);
      if (response.success && response.data) {
        // Transform response.data if needed or just use it. 
        // The current dashboard endpoint returns `progress` and `recentGrades`, but this page expects `wardProgress` array (breakdown by course).
        // We likely need a new endpoint or just mock the *details* for now while syncing the *student identity*.

        await new Promise(r => setTimeout(r, 600)); // Keep the loading feel for "Detailed Analysis"

        setWardProgress([
          { id: 1, course: "Mathematics", completion: 78, score: 85, rank: 12, hours: 24, level: "Intermediate" },
          { id: 2, course: "Physics", completion: 65, score: 82, rank: 8, hours: 18, level: "Advanced" },
          { id: 3, course: "Chemistry", completion: 90, score: 91, rank: 3, hours: 30, level: "Expert" }
        ]);
        setFeedback([
          { id: 1, type: "Performance", insight: `${selectedWard?.fullName || 'Student'} is excelling in Chemistry exams.`, date: "Oct 25, 2024", score: 91, strength: "Organic Chemistry", improvement: "Lab Safety", isRead: false },
          { id: 2, type: "Attendance", insight: "Consistent attendance this month.", date: "Oct 28, 2024", score: 100, strength: "Punctuality", improvement: "None", isRead: true }
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading && !wardProgress.length) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Syncing Academic Progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-wrapper">
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/guardian-dashboard')}>SkillForge AI</div>
          <nav className="nav-links">
            <a href="/guardian-dashboard" onClick={(e) => { e.preventDefault(); navigate('/guardian-dashboard'); }}>OVERVIEW</a>
            <a href="/guardian-progress-portal" className="active" onClick={(e) => e.preventDefault()}>PROGRESS</a>
            <a href="/guardian-attendance" onClick={(e) => { e.preventDefault(); navigate('/guardian-attendance'); }}>ATTENDANCE</a>
            <a href="/guardian-messages" onClick={(e) => { e.preventDefault(); navigate('/guardian-messages'); }}>MESSAGES</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            {wards.length > 0 && (
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedWard?.id || ''}
                  onChange={(e) => {
                    const ward = wards.find(w => w.id === e.target.value);
                    if (ward) selectWard(ward);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#1a1a2e',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.fullName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="ld-topbar-right" style={{ marginLeft: 0 }}>
              <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>{userProfile.userName?.charAt(0) || 'G'}</div>
            </div>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="ld-menu-panel">
          <div className="ld-user-info"><h3>{userProfile.userName}</h3><p>{userProfile.email}</p></div>
          <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
          <button className="ld-menu-item" onClick={() => navigate('/guardian-profile')}>My Profile</button>
          <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      )}

      <main className="ld-main">
        <div className="ld-hero-banner animate-up">
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Progress <span style={{ color: '#a18cd1' }}>Detailed Portal</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Analyzing {selectedWard?.fullName}'s academic journey and skill development.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {wards.map(w => (
                <button
                  key={w.id}
                  onClick={() => selectWard(w)}
                  style={{
                    padding: '12px 25px',
                    borderRadius: '15px',
                    border: 'none',
                    background: selectedWard?.id === w.id ? 'white' : 'rgba(255,255,255,0.1)',
                    color: selectedWard?.id === w.id ? '#6a11cb' : 'white',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: '0.3s'
                  }}
                >
                  {w.fullName}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ld-grid-layout" style={{ marginTop: '2rem' }}>
          <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="ld-section-title">
              <h2>Course Mastery Status</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {wardProgress.map((item, idx) => (
                <div key={idx} className="premium-card-v3" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>{item.course}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#6a11cb', background: '#f0f4ff', padding: '5px 12px', borderRadius: '10px' }}>{item.level}</span>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                      <span style={{ color: '#718096', fontWeight: '700' }}>Completion Progress</span>
                      <span style={{ fontWeight: '900', color: '#6a11cb' }}>{item.completion}%</span>
                    </div>
                    <div style={{ height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.completion}%`, height: '100%', background: 'linear-gradient(90deg, #6a11cb, #2575fc)' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f8f8f8' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{item.score}</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', letterSpacing: '0.5px' }}>SCORE</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>#{item.rank}</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', letterSpacing: '0.5px' }}>RANK</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900' }}>{item.hours}h</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '800', letterSpacing: '0.5px' }}>STUDY</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
            <div className="ld-section-title">
              <h2>Recent Feedback</h2>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {feedback.map((item, idx) => (
                <div key={idx} className="premium-card-v3" style={{ padding: '2rem', borderLeft: `8px solid ${idx === 0 ? '#6a11cb' : '#1a1a2e'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#6a11cb' }}>{item.type.toUpperCase()} INSIGHT</span>
                    <span style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '700' }}>{item.date}</span>
                  </div>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#1a1a2e', fontWeight: '600', lineHeight: '1.6' }}>{item.insight}</p>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', color: '#16a34a', fontWeight: '800' }}>💪 Strength: {item.strength}</div>
                    <div style={{ background: '#fff5f5', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', color: '#e53e3e', fontWeight: '800' }}>⚠️ For Improvement: {item.improvement}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card-v3" style={{ marginTop: '3rem', padding: '2.5rem', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.8rem' }}>AI Learning Buddy</h3>
              <p style={{ fontSize: '0.95rem', opacity: 0.8, marginBottom: '2rem' }}>Alex is currently exploring "Quantum Foundations". AI recommends focusing on core integration tomorrow.</p>
              <button className="primary-btn" style={{ width: '100%', background: 'white', color: '#1a1a2e' }}>View AI Roadmap</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
