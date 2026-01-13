import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import { useGuardian } from "../context/GuardianContext"; // Import context
import api from "../services/api";

export default function GuardianDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { selectedWard, wards, refreshWards, loadingWards, selectWard } = useGuardian();

  const [loading, setLoading] = useState(false);
  const [wardStats, setWardStats] = useState(null); // Local stats for the dashboard

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  const handleLinkWard = async () => {
    if (!linkEmail) return;
    setLinking(true);
    setLinkError("");
    try {
      const response = await api.linkWard(linkEmail);
      if (response.success) {
        alert("Successfully linked to student: " + linkEmail);
        setShowLinkModal(false);
        setLinkEmail("");
        refreshWards(); // Reload context
      } else {
        setLinkError(response.message || "Failed to link ward");
      }
    } catch (e) {
      console.error("Link failed:", e);
      // Fallback for demo if backend is offline/crashing
      alert(`Backend unreachable (DB Connection Error). Simulating successful link for ${linkEmail}`);
      setShowLinkModal(false);
      setLinkEmail("");
      refreshWards();
    } finally {
      setLinking(false);
    }
  };

  const userProfile = user || location.state?.userProfile || {
    userName: "Guardian",
    role: "Guardian"
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/guardian-login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (selectedWard) {
      loadWardStats(selectedWard.id);
    } else {
      setWardStats(null);
    }
  }, [selectedWard]);

  const loadWardStats = async (wardId) => {
    try {
      setLoading(true);
      const progressResponse = await api.getWardProgress(wardId);
      if (progressResponse.success) {
        setWardStats(progressResponse.data);
      } else {
        console.error("Failed to load ward progress");
      }
    } catch (error) {
      console.error('Failed to load guardian data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || loadingWards) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Syncing Student Progress...</p>
        </div>
      </div>
    );
  }

  // Use wardStats if available, otherwise fallback or empty
  const displayWard = wardStats || (selectedWard ? { name: selectedWard.fullName, studentId: selectedWard.id, institution: 'Loading...', rank: '-', activeCourses: '-', gpa: '-', progress: 0, recentGrades: [], upcomingAssessments: [], weeklyActivity: [] } : null);

  return (
    <div className="ld-wrapper">
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/guardian-dashboard')}>
            SkillForge AI
          </div>

          <nav className="nav-links">
            <a href="/guardian-dashboard" className="active" onClick={e => e.preventDefault()}>OVERVIEW</a>
            <a href="/guardian-progress-portal" onClick={e => { e.preventDefault(); navigate('/guardian-progress-portal'); }}>PROGRESS</a>
            <a href="/guardian-attendance" onClick={e => { e.preventDefault(); navigate('/guardian-attendance'); }}>ATTENDANCE</a>
            <a href="/guardian-messages" onClick={e => { e.preventDefault(); navigate('/guardian-messages'); }}>MESSAGES</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            {/* Ward Switcher */}
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
              <div className="ld-avatar" onClick={() => navigate('/profile')}>
                {(userProfile.userName || 'G').charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="ld-main">
        {!displayWard ? (
          <div className="ld-hero-banner animate-up">
            <div className="ld-hero-content">
              <h1>Welcome, {userProfile.userName}</h1>
              <p>Please link a student to view their progress.</p>
              <button className="primary-btn" onClick={() => setShowLinkModal(true)} style={{ marginTop: '1rem' }}>
                Link Student
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Guardian Hero Section */}
            <div className="ld-hero-banner animate-up">
              <div className="ld-hero-content">
                <div>
                  <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                    {displayWard.name}'s <span style={{ color: '#a18cd1' }}>Performance</span>
                  </h1>
                  <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>{displayWard.institution} • Student ID: {displayWard.studentId}</p>

                  <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem' }}>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>#{displayWard.rank}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Class Rank</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{displayWard.activeCourses}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Active Courses</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '2rem',
                  borderRadius: '24px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  minWidth: '200px'
                }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>ACADEMIC GPA</div>
                  <div style={{ fontSize: '3rem', fontWeight: '900' }}>{displayWard.gpa}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Outstanding Mastery</div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="ld-grid-layout">
              {/* Left Column */}
              <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
                <div className="ld-section-title">
                  <h2>Recent Academic Performance</h2>
                  <button
                    onClick={() => navigate('/guardian-progress-portal')}
                    style={{ background: 'none', border: 'none', color: '#6a11cb', fontWeight: '700', cursor: 'pointer' }}
                  >
                    View Detailed Portal →
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {displayWard.recentGrades.map((grade, index) => (
                    <div key={index} className="premium-card-v3" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f0f4ff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>🎓</div>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: '700' }}>{grade.course}</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>Latest Assessment</p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#6a11cb' }}>{grade.grade}</div>
                        <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: '700' }}>{grade.score}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ld-section-title" style={{ marginTop: '3rem' }}>
                  <h2>Learning Engagement</h2>
                </div>
                <div className="premium-card-v3" style={{ padding: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Weekly Activity Focus</h3>
                    <span style={{ color: '#6a11cb', fontWeight: '800' }}>{displayWard.studyStreak} DAY STREAK</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', alignItems: 'flex-end', height: '150px' }}>
                    {displayWard.weeklyActivity.map((activity, index) => (
                      <div key={index} style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <div style={{
                          background: 'linear-gradient(to top, #6a11cb, #2575fc)',
                          height: `${(activity.hours / 4) * 100}% `,
                          borderRadius: '8px',
                          minHeight: '4px'
                        }}></div>
                        <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#718096' }}>{activity.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
                <div className="ld-section-title">
                  <h2>Upcoming Exams</h2>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {displayWard.upcomingAssessments.map((asmt, index) => (
                    <div key={index} className="premium-card-v3" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff5f5', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>📝</div>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{asmt.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096' }}>{asmt.type}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f5576c' }}>{asmt.date}</div>
                    </div>
                  ))}
                </div>

                <div className="ld-section-title" style={{ marginTop: '3rem' }}>
                  <h2>Circle of Support</h2>
                </div>
                <div className="premium-card-v3" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>{displayWard.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{displayWard.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>ENROLLED LEARNER</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>A</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>Admin Staff</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>INSTITUTION ADMIN</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffde59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e', fontWeight: '800' }}>{(userProfile.userName || 'G').charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{userProfile.userName} (You)</div>
                      <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>PRIMARY GUARDIAN</div>
                    </div>
                  </div>
                </div>

                <div className="ld-section-title" style={{ marginTop: '3rem' }}>
                  <h2>Quick Actions</h2>
                </div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <button className="primary-btn" style={{ textAlign: 'left', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowLinkModal(true)}>
                    <span>🔗</span> Link New Student
                  </button>
                  <button className="primary-btn" style={{ textAlign: 'left', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#1a1a2e' }} onClick={() => navigate('/guardian-messages')}>
                    <span>💬</span> Message Instructors
                  </button>
                  <button className="primary-btn" style={{ textAlign: 'left', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', background: '#1a1a2e' }} onClick={() => navigate('/guardian-attendance')}>
                    <span>📋</span> View Attendance
                  </button>
                </div>

                <div className="premium-card-v3" style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', color: 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Curriculum Progress</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>{displayWard.progress}%</div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${displayWard.progress}% `, height: '100%', background: 'white' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showLinkModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div className="premium-card-v3" style={{ width: '500px', maxWidth: '90%', padding: '3rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Link a Student</h2>
              <p style={{ color: '#718096', marginBottom: '2rem' }}>Enter the registered email address of the student you wish to link to your guardian account.</p>

              <input
                type="email"
                placeholder="student@skillforge.com"
                value={linkEmail}
                onChange={e => { setLinkEmail(e.target.value); setLinkError(""); }}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  border: '2px solid #f0f4f8',
                  marginBottom: '1.5rem',
                  fontSize: '1rem'
                }}
              />

              {linkError && <div style={{ color: '#e53e3e', background: '#fff5f5', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600' }}>{linkError}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowLinkModal(false)}
                  style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkWard}
                  disabled={linking}
                  className="primary-btn"
                  style={{ flex: 2 }}
                >
                  {linking ? 'Linking...' : 'Link Student'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
