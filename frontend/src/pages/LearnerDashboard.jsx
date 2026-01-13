import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LearnerDashboard.css";
import api from "../services/api";
import AiAssistant from "../components/AiAssistant";

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const userProfile = location.state?.userProfile || JSON.parse(localStorage.getItem('user')) || { fullName: "Student", email: "demo@skillforge.com", username: "Student" };

  const [dashboardData, setDashboardData] = useState({
    currentModule: "No courses enrolled yet",
    moduleProgress: 0,
    studyStreak: 0,
    activeCourses: 0,
    completedCourses: 0,
    upcomingAssessments: [],
    recentGrades: [],
    enrolledCourses: []
  });

  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await api.getLearnerDashboardStats();
        const courses = await api.getMyCourses();

        if (stats && stats.data) {
          setDashboardData(prev => ({
            ...prev,
            ...stats.data
          }));
        }

        if (courses.success) {
          setDashboardData(prev => ({
            ...prev,
            enrolledCourses: courses.data,
            activeCourses: courses.data.length,
            currentModule: courses.data[0]?.title || prev.currentModule || "Explore Courses",
            moduleProgress: courses.data[0] ? 45 : 0
          }));
        }
      } catch (err) {
        console.error("Using mock data due to API error");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleResume = () => {
    if (dashboardData.enrolledCourses.length > 0) {
      navigate('/learner-content', { state: { userProfile } });
    } else {
      navigate('/learner-content', { state: { userProfile } });
    }
  };

  const handleGenerateAI = () => {
    navigate('/ai-exam-generator', { state: { userProfile } });
  };

  return (
    <div className="ld-wrapper">
      {/* Premium Topbar */}
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/learner-dashboard')}>
            SkillForge AI
          </div>

          <nav className="nav-links">
            <a href="/learner-dashboard" className="active" onClick={e => e.preventDefault()}>DASHBOARD</a>
            <a href="/learner-content" onClick={e => { e.preventDefault(); navigate('/learner-content', { state: { userProfile } }); }}>COURSES</a>
            <a href="/learner-progress" onClick={e => { e.preventDefault(); navigate('/learner-progress', { state: { userProfile } }); }}>PROGRESS</a>
          </nav>

          <div className="ld-topbar-right">
            <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>
              {(userProfile.username || userProfile.fullName || 'S').charAt(0)}
            </div>
            {showMenu && (
              <div className="ld-menu-panel">
                <div className="ld-user-info">
                  <h3>{userProfile.fullName}</h3>
                  <p>{userProfile.email}</p>
                </div>
                <hr style={{ margin: '1rem 0', border: '0', borderTop: '1px solid #f0f0f0' }} />
                <button className="ld-menu-item" onClick={() => navigate('/profile')}>Profile</button>
                <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="ld-main">
        {/* Banner */}
        <div className="ld-hero-banner animate-up">
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Welcome back, <span style={{ color: '#a18cd1' }}>{userProfile.username || userProfile.fullName}</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Track your journey and master the next frontier.</p>
              {(userProfile.institution || userProfile.studentId) && (
                <p style={{ fontSize: '1rem', opacity: 0.6, marginTop: '0.5rem' }}>
                  {userProfile.institution && <span>{userProfile.institution}</span>}
                  {userProfile.institution && userProfile.studentId && <span> • </span>}
                  {userProfile.studentId && <span>Student ID: {userProfile.studentId}</span>}
                </p>
              )}

              <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{dashboardData.studyStreak}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Day Streak</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{dashboardData.activeCourses}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Courses</div>
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
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>RANK</div>
              <div style={{ fontSize: '3rem', fontWeight: '900' }}>M-V</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Level 5 Mastery</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="ld-grid-layout">
          {/* Left: Active Path */}
          <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="ld-section-title">
              <h2>Active Learning Path</h2>
              <button onClick={() => navigate('/learner-content')} style={{ background: 'none', border: 'none', color: '#6a11cb', fontWeight: '700', cursor: 'pointer' }}>View All →</button>
            </div>

            <div className="premium-card-v3">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#6a11cb', textTransform: 'uppercase' }}>Current Focus</div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '5px 0' }}>{dashboardData.currentModule}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{dashboardData.moduleProgress}%</div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Completed</div>
                </div>
              </div>

              <div style={{ height: '10px', background: '#f0f4f8', borderRadius: '5px', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ width: `${dashboardData.moduleProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6a11cb, #2575fc)' }}></div>
              </div>

              <button className="primary-btn" style={{ width: '100%' }} onClick={handleResume}>
                {dashboardData.activeCourses > 0 ? "Resume Learning" : "Browse Courses"}
              </button>
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>AI Assessments</h2>
              <button
                className="primary-btn"
                style={{ fontSize: '0.75rem', padding: '10px 20px', background: '#1a1a2e' }}
                onClick={handleGenerateAI}
              >
                + Generate AI Exam
              </button>
            </div>

            {dashboardData.upcomingAssessments.length > 0 ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {dashboardData.upcomingAssessments.map(asmt => (
                  <div key={asmt.id} className="premium-card-v3" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', background: '#f0f4ff', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>📜</div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: '700' }}>{asmt.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>{asmt.type}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: '700', color: '#6a11cb' }}>{asmt.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1a1a2e' }}>No Assessments Yet</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Start your learning journey! Generate AI-powered exams to test your knowledge or enroll in courses to access course assessments.
                </p>
                <button className="primary-btn" onClick={handleGenerateAI}>
                  Create Your First AI Exam
                </button>
              </div>
            )}
          </div>

          {/* Right: Growth & Skills */}
          <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
            <div className="ld-section-title">
              <h2>Growth</h2>
            </div>

            {dashboardData.recentGrades.length > 0 ? (
              <>
                {dashboardData.recentGrades.map((grade, idx) => (
                  <div key={idx} className="premium-card-v3" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{grade.course}</span>
                      <span style={{ fontWeight: '900', color: '#38a169' }}>{grade.grade}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f0f4f8', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${grade.score}%`, height: '100%', background: '#38a169' }}></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1a1a2e' }}>No Grades Yet</h3>
                <p style={{ color: '#718096', lineHeight: '1.6' }}>
                  Your performance metrics will appear here once you complete assessments and exams.
                </p>
              </div>
            )}

            {/* Completed Assessments with Motivation */}
            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>History & Motivation</h2>
            </div>

            {dashboardData.recentGrades.length > 0 ? (
              <>
                {dashboardData.recentGrades.map((grade, idx) => (
                  <div key={idx} className="premium-card-v3" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{grade.course}</span>
                      <span style={{ fontWeight: '900', color: '#38a169' }}>{grade.grade}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#718096', fontStyle: 'italic', marginBottom: '1rem' }}>
                      "{grade.score >= 90 ? "Outstanding mastery! Keep leading the pack." :
                        grade.score >= 75 ? "Great progress! You are on the right track." :
                          "Every step counts. Keep pushing forward!"}"
                    </div>
                    <div style={{ height: '6px', background: '#f0f4f8', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${grade.score}%`, height: '100%', background: '#38a169' }}></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#1a1a2e' }}>Ready to Start?</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  <strong>What you can do as a Learner:</strong><br />
                  • Enroll in available courses<br />
                  • Generate AI-powered practice exams<br />
                  • Track your progress and performance<br />
                  • Access learning materials anytime<br />
                  • Get AI assistance for your doubts
                </p>
                <button className="primary-btn" onClick={() => navigate('/learner-content')}>
                  Explore Courses
                </button>
              </div>
            )}

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Your Support Network</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>{userProfile.fullName?.charAt(0) || 'L'}</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{userProfile.fullName} (You)</div>
                  <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>ACTIVE LEARNER</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffde59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e', fontWeight: '800' }}>G</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>Primay Guardian</div>
                  <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>FAMILY SUPPORT</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>A</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>Academic Admin</div>
                  <div style={{ fontSize: '0.7rem', color: '#a0aec0', fontWeight: '700' }}>INSTITUTION SUPPORT</div>
                </div>
              </div>
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Recommended AI Articles</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <a href="#" className="ai-article-link" style={{ display: 'block', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>The Future of {dashboardData.currentModule}</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>AI Generated Insight • 5 min read</div>
                </a>
                <a href="#" className="ai-article-link" style={{ display: 'block', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Mastering Advanced Concepts in 2026</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>AI Generated Insight • 8 min read</div>
                </a>
                <a href="#" className="ai-article-link" style={{ display: 'block', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Top Industry Trends for Learners</div>
                  <div style={{ fontSize: '0.75rem', color: '#718096' }}>AI Generated Insight • 6 min read</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AiAssistant user={userProfile} />
    </div>
  );
}
