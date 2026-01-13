import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import { useGuardian } from "../context/GuardianContext"; // Import context
import api from "../services/api";

export default function GuardianAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedWard, wards, selectWard } = useGuardian(); // Use context

  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  const userProfile = location.state?.userProfile || user || { userName: "Guardian", role: "Guardian" };

  useEffect(() => {
    if (selectedWard) {
      loadAttendanceData(selectedWard.id);
    }
  }, [selectedWard]);

  const loadAttendanceData = async (wardId) => {
    try {
      setLoading(true);
      // Simulate real API fetch or fetch via api.getWardProgress if it had attendance
      // For now, simulate delay and mock data specific to the ward
      await new Promise(resolve => setTimeout(resolve, 600));

      setAttendanceData({
        studentName: selectedWard?.fullName || "Student",
        studentId: selectedWard?.id || "STU-Unknown",
        overallAttendance: 94,
        presentDays: 47,
        absentDays: 2,
        leaveDays: 1,
        totalDays: 50,
        monthlyAttendance: [
          { month: "September", percentage: 96, present: 20, absent: 1 },
          { month: "October", percentage: 92, present: 19, absent: 2 },
          { month: "November", percentage: 94, present: 18, absent: 1 },
          { month: "December", percentage: 94, present: 9, absent: 0 }
        ],
        courseAttendance: [
          { course: "Mathematics", attendance: 96, classes: 25, attended: 24 },
          { course: "Physics", attendance: 92, classes: 25, attended: 23 },
          { course: "Chemistry", attendance: 94, classes: 25, attended: 24 },
          { course: "English", attendance: 92, classes: 25, attended: 23 },
          { course: "History", attendance: 96, classes: 25, attended: 24 }
        ],
        recentAbsences: [
          { date: "2024-11-15", course: "Physics", reason: "Medical Appointment", status: "Excused" },
          { date: "2024-10-22", course: "Chemistry", reason: "Illness", status: "Excused" }
        ],
        upcomingClasses: [
          { date: "2024-12-13", course: "Mathematics", time: "09:00 AM", room: "A-101" },
          { date: "2024-12-13", course: "Physics", time: "11:00 AM", room: "B-205" },
          { date: "2024-12-14", course: "Chemistry", time: "10:00 AM", room: "C-310" }
        ]
      });
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || !attendanceData) {
    return (
      <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="spinner" style={{ marginBottom: '1rem' }}></div>
          <p>Analyzing Attendance Records...</p>
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
            <a href="/guardian-attendance" className="active" onClick={(e) => e.preventDefault()}>ATTENDANCE</a>
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
        <div className="ld-hero-banner animate-up" style={{ marginBottom: '2rem' }}>
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Attendance <span style={{ color: '#a18cd1' }}>Analytics</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>{attendanceData.studentName} is maintaining a strong presence in the current term.</p>
            </div>
          </div>
        </div>

        <div className="ld-grid-layout">
          <div className="ld-left animate-up" style={{ animationDelay: '0.2s' }}>
            <div className="ld-section-title">
              <h2>Attendance Summary</h2>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#6a11cb' }}>{attendanceData.overallAttendance}% ENROLLMENT STATUS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '1px', marginBottom: '1rem' }}>DAYS PRESENT</div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#38a169' }}>{attendanceData.presentDays}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Out of {attendanceData.totalDays} Total Days</div>
              </div>
              <div className="premium-card-v3" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '1px', marginBottom: '1rem' }}>UNEXCUSED ABSENCES</div>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: '#e53e3e' }}>{attendanceData.absentDays}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Action Required</div>
              </div>
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Monthly Engagement</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '2rem' }}>
              {attendanceData.monthlyAttendance.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: idx === attendanceData.monthlyAttendance.length - 1 ? 0 : '1.5rem' }}>
                  <div style={{ width: '100px', fontWeight: '800', fontSize: '0.9rem' }}>{m.month}</div>
                  <div style={{ flex: 1, height: '10px', background: '#f0f4f8', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${m.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #6a11cb, #2575fc)' }}></div>
                  </div>
                  <div style={{ width: '50px', fontWeight: '900', textAlign: 'right' }}>{m.percentage}%</div>
                </div>
              ))}
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Course Specific Attendance</h2>
            </div>
            <div className="premium-card-v3" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0' }}>COURSE</th>
                    <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0' }}>ATTENDANCE</th>
                    <th style={{ padding: '1.2rem 2rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: '#a0aec0' }}>RATIO</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.courseAttendance.map((c, i) => (
                    <tr key={i} style={{ borderBottom: i === attendanceData.courseAttendance.length - 1 ? 'none' : '1px solid #f8f8f8' }}>
                      <td style={{ padding: '1.2rem 2rem', fontWeight: '700' }}>{c.course}</td>
                      <td style={{ padding: '1.2rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#f0f4f8', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${c.attendance}%`, height: '100%', background: c.attendance >= 94 ? '#38a169' : '#fbbf24' }}></div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800' }}>{c.attendance}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem 2rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600', color: '#718096' }}>{c.attended}/{c.classes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ld-right animate-up" style={{ animationDelay: '0.4s' }}>
            <div className="ld-section-title">
              <h2>Recent Activity</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {attendanceData.recentAbsences.map((abs, i) => (
                <div key={i} className="premium-card-v3" style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: '#fff5f5', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>🚫</div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>Absent: {abs.course}</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096' }}>{abs.reason}</p>
                    </div>
                  </div>
                  <div style={{ padding: '4px 10px', background: '#f0fdf4', color: '#166534', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>{abs.status.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div className="ld-section-title" style={{ marginTop: '3rem' }}>
              <h2>Upcoming Classes</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {attendanceData.upcomingClasses.map((cls, i) => (
                <div key={i} className="premium-card-v3" style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: '800', color: '#1a1a2e', marginBottom: '5px' }}>{cls.course}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#718096' }}>
                    <span>🕒 {cls.time}</span>
                    <span>📍 Room {cls.room}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card-v3" style={{ marginTop: '3rem', padding: '2rem', background: '#1a1a2e', color: 'white', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Attendance Report</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '1.5rem' }}>Download a detailed PDF report for the current semester.</p>
              <button className="primary-btn" style={{ width: '100%', background: 'white', color: '#1a1a2e' }}>Download PDF</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
