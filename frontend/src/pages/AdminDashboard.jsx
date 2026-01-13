import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courseRequests, setCourseRequests] = useState([]);
  const [error, setError] = useState(null);

  const userProfile = user || {};

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [coursesRes, statsRes, usersRes, requestsRes] = await Promise.all([
        api.getCourses(),
        api.getAdminOverview(),
        api.getAllUsers(),
        api.getPendingCourseRequests()
      ]);

      if (coursesRes.success) setCourses(coursesRes.data || []);
      if (statsRes.success) setAdminStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (requestsRes.success) setCourseRequests(requestsRes.data || []);

    } catch (error) {
      console.error('Failed to load admin data:', error);
      setError(error.message || "Access Denied. You may not have administrative privileges.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleReviewTask = (taskType) => {
    if (taskType === 'requests') navigate('/admin-course-requests');
    else if (taskType === 'courses') navigate('/admin-courses', { state: { userProfile } });
    else if (taskType === 'users') navigate('/admin-users', { state: { userProfile } });
    else navigate('/admin-analytics', { state: { userProfile } });
  };

  const adminData = {
    totalStudents: adminStats?.totalUsers || users.length,
    activeCourses: courses.length,
    pendingReviews: 6,
    activeInstructors: users.filter(u => u.role === 'INSTRUCTOR').length,
    avgCompletion: adminStats?.courseCompletionRate || 0,
    systemHealth: adminStats?.systemUptime || 100,
    recentActivity: [
      { action: "New course created", user: "Dr. Smith", time: "2 hours ago" },
      { action: "Assessment published", user: "Prof. Johnson", time: "4 hours ago" },
      { action: "Student enrolled", user: "System", time: "5 hours ago" }
    ],
    pendingTasks: [
      { task: "Course Requests from Learners", priority: "High", count: courseRequests.length, type: "requests" },
      { task: "Approve course updates", priority: "Medium", count: 3, type: "courses" },
      { task: "User access requests", priority: "Low", count: 2, type: "users" }
    ].filter(task => task.count > 0)
  };

  if (loading) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Loading Admin Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ld-wrapper">
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>
            SkillForge AI
          </div>

          <nav className="nav-links">
            <a href="/admin-dashboard" className="active" onClick={e => e.preventDefault()}>DASHBOARD</a>
            <a href="/admin-courses" onClick={e => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
            <a href="/admin-users" onClick={e => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
            <a href="/admin-analytics" onClick={e => { e.preventDefault(); navigate('/admin-analytics'); }}>ANALYTICS</a>
            <a href="/admin-course-requests" onClick={e => { e.preventDefault(); navigate('/admin-course-requests'); }}>REQUESTS</a>
            <a href="/admin-messages" onClick={e => { e.preventDefault(); navigate('/admin-messages'); }}>MESSAGES</a>
          </nav>

          <div className="ld-topbar-right">
            <div className="ld-avatar" onClick={() => navigate('/admin-profile')}>
              {userProfile.userName?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>

      <main className="ld-main">
        {/* Admin Hero Section */}
        <div className="ld-hero-banner animate-up">
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Admin <span style={{ color: '#a18cd1' }}>Control Center</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Managing SkillForge at scale. System status: Operational.</p>

              <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{adminData.totalStudents}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Total Users</div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{adminData.activeCourses}</div>
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
              <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>SYSTEM HEALTH</div>
              <div style={{ fontSize: '3rem', fontWeight: '900', color: adminData.systemHealth > 90 ? '#43e97b' : '#ff9800' }}>{adminData.systemHealth}%</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Peak Performance</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="ld-grid-layout">
          {/* Left Column */}
          <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="ld-section-title">
              <h2>Pending Tasks</h2>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f5576c' }}>{adminData.pendingTasks.reduce((acc, task) => acc + task.count, 0)} ACTIONS REQUIRED</span>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {adminData.pendingTasks.map((task, index) => (
                <div key={index} className="premium-card-v3" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{task.task}</h3>
                    <span style={{
                      background: task.priority === 'High' ? '#fee2e2' : '#f3f4f6',
                      color: task.priority === 'High' ? '#b91c1c' : '#4b5563',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '800'
                    }}>{task.priority}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>{task.count} items awaiting review</p>
                    <button className="primary-btn" onClick={() => handleReviewTask(task.type)}>Review Now</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Recent Platform Activity</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '1.5rem' }}>
              {adminData.recentActivity.map((activity, index) => (
                <div key={index} style={{
                  padding: '1.2rem',
                  borderBottom: index === adminData.recentActivity.length - 1 ? 'none' : '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f0f4ff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>⚡</div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '700' }}>{activity.action}</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>By {activity.user}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600' }}>{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
            <div className="ld-section-title">
              <h2>Quick Actions</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className="premium-card-v3" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/admin-courses')}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 5px 0' }}>Manage Courses</h3>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem' }}>Create & edit content</p>
              </div>
              <div className="premium-card-v3" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/admin-users')}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 5px 0' }}>Manage Users</h3>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem' }}>Review accessibility</p>
              </div>
              <div className="premium-card-v3" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/admin-analytics')}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 5px 0' }}>Analytics</h3>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem' }}>Platform metrics</p>
              </div>
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Security Status</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: '#f0fff4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>🛡️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Protected</h3>
              <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>All systems are currently running within secure parameters.</p>
              <button className="primary-btn" style={{ width: '100%', background: '#1a1a2e' }} onClick={() => navigate('/profile')}>Security Settings</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
