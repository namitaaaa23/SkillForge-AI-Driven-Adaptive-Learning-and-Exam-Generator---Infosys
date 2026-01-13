import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function GuardianProgressAnalytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const userProfile = location.state?.userProfile || user || { userName: "Guardian", role: "Guardian" };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));

      setAnalytics({
        wardName: "Alex Johnson",
        wardId: "STU001",
        overallProgress: 73,
        gpa: 3.85,
        velocity: "Fast Lane",
        progressTrend: [
          { month: "Aug", progress: 45 },
          { month: "Sep", progress: 52 },
          { month: "Oct", progress: 61 },
          { month: "Nov", progress: 68 },
          { month: "Dec", progress: 73 }
        ],
        courseProgress: [
          { name: "Linear Algebra", progress: 85, status: "Excellent" },
          { name: "Physics II", progress: 78, status: "Good" },
          { name: "Organic Chemistry", progress: 72, status: "Good" },
          { name: "English Literature", progress: 65, status: "Fair" }
        ],
        skillBreakdown: [
          { skill: "Problem Solving", level: 82 },
          { skill: "Critical Thinking", level: 75 },
          { skill: "Applied Logic", level: 88 }
        ]
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Compiling Advanced Analytics...</p>
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
            <a href="/guardian-progress-portal" onClick={(e) => { e.preventDefault(); navigate('/guardian-progress-portal'); }}>PROGRESS</a>
            <a href="/guardian-attendance" onClick={(e) => { e.preventDefault(); navigate('/guardian-attendance'); }}>ATTENDANCE</a>
            <a href="/guardian-messages" onClick={(e) => { e.preventDefault(); navigate('/guardian-messages'); }}>MESSAGES</a>
          </nav>
          <div className="ld-topbar-right">
            <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>{userProfile.userName?.charAt(0) || 'G'}</div>
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
                Academic <span style={{ color: '#a18cd1' }}>Forecasting</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>A deep dive into learning velocities and cognitive growth patterns for {analytics.wardName}.</p>
            </div>

            <div style={{ display: 'flex', gap: '3rem' }}>
              <div className="premium-card-v3" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.7, marginBottom: '0.5rem' }}>GPA PROJECTION</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{analytics.gpa}</div>
              </div>
              <div className="premium-card-v3" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', opacity: 0.7, marginBottom: '0.5rem' }}>LEARNING VELOCITY</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{analytics.velocity}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ld-grid-layout" style={{ marginTop: '2.5rem' }}>
          <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="ld-section-title">
              <h2>Progress Trends</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontWeight: '800' }}>Semester-long Progress Curve</h3>
                <span style={{ color: '#38a169', fontWeight: '900' }}>↑ +28% OVER QUARTER</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', height: '250px', alignItems: 'flex-end' }}>
                {analytics.progressTrend.map((t, idx) => (
                  <div key={idx} style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#6a11cb', marginBottom: '10px' }}>{t.progress}%</div>
                    <div style={{
                      background: 'linear-gradient(180deg, #6a11cb 0%, #2575fc 100%)',
                      height: `${t.progress}%`,
                      borderRadius: '12px 12px 4px 4px',
                      boxShadow: '0 10px 20px rgba(106, 17, 203, 0.2)'
                    }}></div>
                    <div style={{ marginTop: '15px', fontWeight: '800', color: '#718096' }}>{t.month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ld-section-title" style={{ marginTop: '3.5rem' }}>
              <h2>Skill Cognitive Map</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '2.5rem' }}>
              {analytics.skillBreakdown.map((s, idx) => (
                <div key={idx} style={{ marginBottom: idx === analytics.skillBreakdown.length - 1 ? 0 : '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: '800' }}>{s.skill}</span>
                    <span style={{ fontWeight: '900', color: '#6a11cb' }}>{s.level}% Mastery</span>
                  </div>
                  <div style={{ height: '12px', background: '#f0f4ff', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.level}%`, height: '100%', background: 'linear-gradient(90deg, #6a11cb, #2575fc)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
            <div className="ld-section-title">
              <h2>Course Efficiency</h2>
            </div>
            <div style={{ display: 'grid', gap: '1.2rem' }}>
              {analytics.courseProgress.map((cp, idx) => (
                <div key={idx} className="premium-card-v3" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem' }}>{cp.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096', fontWeight: '600' }}>{cp.status} Engagement</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#6a11cb' }}>{cp.progress}%</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card-v3" style={{ marginTop: '3.5rem', padding: '2.5rem', background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '6rem', opacity: 0.1 }}>🎯</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '1rem' }}>Forecast Summary</h3>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', opacity: 0.9, marginBottom: '2rem' }}>
                Based on current velocity, Alex is projected to complete "English Literature" with 92% mastery by January 15th.
              </p>
              <button className="primary-btn" style={{ background: 'white', color: '#6a11cb', width: '100%' }}>View Full Roadmap</button>
            </div>

            <div className="premium-card-v3" style={{ marginTop: '1.5rem', padding: '2rem', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
              <p style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '700' }}>Need deeper insights?</p>
              <button onClick={() => navigate('/guardian-messages')} style={{ background: 'none', border: 'none', color: '#6a11cb', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}>Message Instructor</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
