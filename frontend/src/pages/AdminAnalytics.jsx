import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminAnalytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const userProfile = location.state?.userProfile || user || {
    userName: "Admin",
    email: "",
    id: "",
    role: "Admin"
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminOverview();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Loading Analytics Data...</p>
        </div>
      </div>
    );
  }

  const analyticsData = {
    totalUsers: analytics?.totalUsers || 1250,
    activeLearners: analytics?.activeLearners || 850,
    courseCompletionRate: analytics?.courseCompletionRate || 76.5,
    systemUptime: analytics?.systemUptime || 99.99,
    revenue: analytics?.revenue || 45000.00,
    userGrowth: [
      { month: "Jan", users: 450 },
      { month: "Feb", users: 620 },
      { month: "Mar", users: 850 },
      { month: "Apr", users: 1050 },
      { month: "May", users: 1250 }
    ],
    courseStats: [
      { name: "Mathematics", enrollments: 320, completion: 82 },
      { name: "Science", enrollments: 280, completion: 75 },
      { name: "Literature", enrollments: 210, completion: 68 },
      { name: "History", enrollments: 190, completion: 71 },
      { name: "Technology", enrollments: 250, completion: 85 }
    ],
    userDistribution: [
      { role: "Students", count: 850, percentage: 68, color: '#4caf50' },
      { role: "Instructors", count: 120, percentage: 10, color: '#2196F3' },
      { role: "Guardians", count: 200, percentage: 16, color: '#ff9800' },
      { role: "Admins", count: 80, percentage: 6, color: '#f5576c' }
    ]
  };

  return (
    <div className="ld-wrapper">
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
          <nav className="nav-links">
            <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
            <a href="/admin-courses" onClick={(e) => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
            <a href="/admin-users" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
            <a href="/admin-analytics" className="active" onClick={(e) => e.preventDefault()}>ANALYTICS</a>
            <a href="/admin-course-requests" onClick={(e) => { e.preventDefault(); navigate('/admin-course-requests'); }}>REQUESTS</a>
          </nav>
          <div className="ld-topbar-right">
            <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>{userProfile.userName?.charAt(0)}</div>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="ld-menu-panel">
          <div className="ld-user-info"><h3>{userProfile.userName}</h3><p>{userProfile.email}</p></div>
          <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
          <button className="ld-menu-item" onClick={() => navigate('/admin-profile')}>Profile Settings</button>
          <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
          <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      )}

      <main className="ld-main">
        {/* Hero Banner */}
        <div className="ld-hero-banner animate-up" style={{ marginBottom: '2rem' }}>
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Platform <span style={{ color: '#a18cd1' }}>Analytics</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Gain deep insights into SkillForge performance, engagement, and growth.</p>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px', marginBottom: '4px' }}>UPTIME</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{analyticsData.systemUptime}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px', marginBottom: '4px' }}>REVENUE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#43e97b' }}>${analyticsData.revenue.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>DATA REFRESHED</div>
              <div style={{ fontSize: '1rem', fontWeight: '700' }}>Every 24 Hours</div>
              <button className="primary-btn" onClick={loadAnalytics} style={{ marginTop: '1rem', background: 'white', color: '#6a11cb', width: '100%' }}>Refresh Now</button>
            </div>
          </div>
        </div>

        <div className="ld-stats-grid animate-up">
          <div className="premium-card-v3">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#718096', letterSpacing: '1px' }}>TOTAL USERS</span>
              <span style={{ color: '#43e97b', fontWeight: '800', fontSize: '0.8rem' }}>+12% ↑</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a2e' }}>{analyticsData.totalUsers}</div>
            <div style={{ width: '100%', height: '4px', background: '#f0f4f8', borderRadius: '2px', marginTop: '1rem' }}>
              <div style={{ width: '70%', height: '100%', background: '#667eea', borderRadius: '2px' }}></div>
            </div>
          </div>

          <div className="premium-card-v3">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#718096', letterSpacing: '1px' }}>ACTIVE LEARNERS</span>
              <span style={{ color: '#43e97b', fontWeight: '800', fontSize: '0.8rem' }}>+8% ↑</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a2e' }}>{analyticsData.activeLearners}</div>
            <div style={{ width: '100%', height: '4px', background: '#f0f4f8', borderRadius: '2px', marginTop: '1rem' }}>
              <div style={{ width: '60%', height: '100%', background: '#764ba2', borderRadius: '2px' }}></div>
            </div>
          </div>

          <div className="premium-card-v3">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#718096', letterSpacing: '1px' }}>COMPLETION RATE</span>
              <span style={{ color: '#f5576c', fontWeight: '800', fontSize: '0.8rem' }}>-2% ↓</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a2e' }}>{analyticsData.courseCompletionRate}%</div>
            <div style={{ width: '100%', height: '4px', background: '#f0f4f8', borderRadius: '2px', marginTop: '1rem' }}>
              <div style={{ width: `${analyticsData.courseCompletionRate}%`, height: '100%', background: '#43e97b', borderRadius: '2px' }}></div>
            </div>
          </div>

          <div className="premium-card-v3">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#718096', letterSpacing: '1px' }}>SYSTEM UPTIME</span>
              <span style={{ color: '#43e97b', fontWeight: '800', fontSize: '0.8rem' }}>STABLE</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1a1a2e' }}>{analyticsData.systemUptime}%</div>
            <div style={{ width: '100%', height: '4px', background: '#f0f4f8', borderRadius: '2px', marginTop: '1rem' }}>
              <div style={{ width: '99.9%', height: '100%', background: '#00d2ff', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
          {/* User Growth Chart */}
          <div className="premium-card-v3 animate-up" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '2rem' }}>GROWTH TRAJECTORY</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '250px', gap: '25px', paddingBottom: '20px', borderBottom: '2px solid #f0f4f8' }}>
              {analyticsData.userGrowth.map((item, index) => {
                const height = (item.users / 1500) * 100;
                return (
                  <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      width: '100%',
                      background: 'linear-gradient(to top, #6a11cb 0%, #2575fc 100%)',
                      borderRadius: '8px 8px 0 0',
                      height: `${height}%`,
                      position: 'relative',
                      boxShadow: '0 10px 20px rgba(106, 17, 203, 0.2)'
                    }}>
                      <div style={{ position: 'absolute', top: '-30px', width: '100%', textAlign: 'center', fontWeight: '800', color: '#1a1a2e', fontSize: '0.75rem' }}>{item.users}</div>
                    </div>
                    <div style={{ color: '#718096', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>{item.month.toUpperCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Distribution */}
          <div className="premium-card-v3 animate-up" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '2rem' }}>USER SEGMENTATION</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {analyticsData.userDistribution.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span style={{ fontWeight: '800', color: '#1a1a2e', fontSize: '0.9rem' }}>{item.role.toUpperCase()}</span>
                    <span style={{ color: '#718096', fontWeight: '700', fontSize: '0.9rem' }}>{item.count} ({item.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f0f4f8', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, borderRadius: '5px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="premium-card-v3 animate-up" style={{ marginTop: '2.5rem', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1a1a2e' }}>COURSE PERFORMANCE METRICS</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fff', borderBottom: '2px solid #f0f4f8' }}>
                  <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>COURSE NAME</th>
                  <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>ENROLLMENTS</th>
                  <th style={{ padding: '1.5rem 2.5rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>COMPLETION TRACKING</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.courseStats.map((course, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f8f8f8' }}>
                    <td style={{ padding: '1.5rem 2.5rem', fontWeight: '800', color: '#1a1a2e' }}>{course.name}</td>
                    <td style={{ padding: '1.5rem 2.5rem', color: '#718096', fontWeight: '700' }}>{course.enrollments} Learners</td>
                    <td style={{ padding: '1.5rem 2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ flex: 1, height: '10px', background: '#f0f4f8', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.completion}%`, height: '100%', background: course.completion > 80 ? '#43e97b' : course.completion > 60 ? '#667eea' : '#f5576c' }}></div>
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1a1a2e', width: '45px' }}>{course.completion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
