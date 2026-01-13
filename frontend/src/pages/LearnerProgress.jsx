import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function LearnerProgress() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, loading: authLoading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [courses, setCourses] = useState([]);
    const [examResults, setExamResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');

    const userProfile = location.state?.userProfile || user || { userName: "Student", role: "Student" };

    useEffect(() => {
        if (!authLoading && !user) navigate('/');
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (user) loadProgressData();
    }, [user]);

    const loadProgressData = async () => {
        try {
            setLoading(true);
            const [coursesRes, resultsRes] = await Promise.all([
                api.getMyCourses().catch(() => ({ success: false, data: [] })),
                api.getMyExamResults().catch(() => ({ success: false, data: [] }))
            ]);

            if (coursesRes.success) setCourses(coursesRes.data || []);
            if (resultsRes.success) setExamResults(resultsRes.data || []);
        } catch (error) {
            console.error("Failed to load progress data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (authLoading) return <div className="ld-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!user) return null;

    const totalCourses = courses.length;
    const completedCourses = courses.filter(c => c.completed).length;
    const overallProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    const averageScore = examResults.length > 0 ? Math.round(examResults.reduce((sum, e) => sum + (e.score || 0), 0) / examResults.length) : 0;

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/learner-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/learner-dashboard" onClick={e => { e.preventDefault(); navigate('/learner-dashboard'); }}>DASHBOARD</a>
                        <a href="/learner-content" onClick={e => { e.preventDefault(); navigate('/learner-content'); }}>COURSES</a>
                        <a href="/learner-progress" className="active" onClick={e => e.preventDefault()}>PROGRESS</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>
                            {userProfile.userName?.charAt(0) || 'S'}
                        </div>
                        {showMenu && (
                            <div className="ld-menu-panel">
                                <div className="ld-user-info">
                                    <h3>{userProfile.userName}</h3>
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
                <div className="ld-hero-banner animate-up">
                    <div className="ld-hero-content">
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem' }}>Your Progress Analytics</h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Visualizing your journey towards mastery.</p>

                            <div style={{ display: 'flex', gap: '3rem', marginTop: '3rem' }}>
                                <div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{overallProgress}%</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Overall Progress</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{averageScore}%</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px', textTransform: 'uppercase' }}>Avg Score</div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            padding: '2.5rem',
                            borderRadius: '32px',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>STATUS</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#43e97b' }}>{overallProgress > 50 ? 'EXCELLING' : 'ON TRACK'}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '5px' }}>Top 15% of Learners</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: '20px' }}>
                    {['overview', 'courses', 'exams'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                border: 'none',
                                borderRadius: '15px',
                                background: selectedTab === tab ? '#1a1a2e' : 'transparent',
                                color: selectedTab === tab ? 'white' : '#718096',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontSize: '0.8rem'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? <div style={{ textAlign: 'center', padding: '5rem' }}>Loading analytics...</div> : (
                    <div className="ld-grid-layout">
                        {selectedTab === 'overview' && (
                            <>
                                <div className="ld-left animate-up">
                                    <div className="ld-section-title"><h2>Weekly Activity</h2></div>
                                    <div className="premium-card-v3">
                                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px', gap: '1rem' }}>
                                            {[3.5, 2.8, 4.2, 3.0, 5.1, 6.3, 4.5].map((h, i) => (
                                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ height: `${h * 20}px`, width: '100%', background: 'linear-gradient(to top, #6a11cb, #2575fc)', borderRadius: '8px 8px 4px 4px' }}></div>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#718096' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="ld-right animate-up" style={{ animationDelay: '0.2s' }}>
                                    <div className="ld-section-title"><h2>Key Metrics</h2></div>
                                    <div className="premium-card-v3" style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#6a11cb', fontWeight: '800' }}>COURSES</div>
                                        <div style={{ fontSize: '2rem', fontWeight: '900' }}>{totalCourses}</div>
                                        <p style={{ margin: 0, color: '#718096' }}>Total Enrollment</p>
                                    </div>
                                    <div className="premium-card-v3">
                                        <div style={{ fontSize: '0.8rem', color: '#38a169', fontWeight: '800' }}>STREAK</div>
                                        <div style={{ fontSize: '2rem', fontWeight: '900' }}>15 Days</div>
                                        <p style={{ margin: 0, color: '#718096' }}>Consistent Learning</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedTab === 'courses' && (
                            <div className="ld-left animate-up" style={{ gridColumn: 'span 2' }}>
                                <div className="ld-section-title"><h2>Course Completion Details</h2></div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                                    {courses.length > 0 ? courses.map((course, idx) => (
                                        <div key={idx} className="premium-card-v3">
                                            <h3 style={{ margin: '0 0 1rem 0' }}>{course.title}</h3>
                                            <div style={{ height: '8px', background: '#f0f4f8', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                                <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #6a11cb, #2575fc)' }}></div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#718096' }}>
                                                <span>45% Complete</span>
                                                <span>{course.difficultyLevel}</span>
                                            </div>
                                        </div>
                                    )) : <p style={{ textAlign: 'center', gridColumn: 'span 2' }}>No enrolled courses found. <a href="/learner-content" style={{ color: '#6a11cb' }}>Browse Catalog</a></p>}
                                </div>
                            </div>
                        )}

                        {selectedTab === 'exams' && (
                            <div className="ld-left animate-up" style={{ gridColumn: 'span 2' }}>
                                <div className="ld-section-title"><h2>Exam Transcript</h2></div>
                                <div className="premium-card-v3">
                                    {examResults.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f4f8' }}>
                                                    <th style={{ padding: '1.5rem 0', color: '#718096' }}>EXAM NAME</th>
                                                    <th style={{ padding: '1.5rem 0', color: '#718096' }}>SCORE</th>
                                                    <th style={{ padding: '1.5rem 0', color: '#718096' }}>STATUS</th>
                                                    <th style={{ padding: '1.5rem 0', color: '#718096' }}>DATE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {examResults.map((e, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f0f4f8' }}>
                                                        <td style={{ padding: '1.5rem 0', fontWeight: '800' }}>{e.examTitle || 'Quiz'}</td>
                                                        <td style={{ padding: '1.5rem 0', fontWeight: '900' }}>{e.score}%</td>
                                                        <td style={{ padding: '1.5rem 0' }}>
                                                            <span style={{ padding: '5px 12px', borderRadius: '10px', background: e.passed ? '#f0fff4' : '#fff5f5', color: e.passed ? '#38a169' : '#e53e3e', fontSize: '0.8rem', fontWeight: '800' }}>
                                                                {e.passed ? 'PASSED' : 'FAILED'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.5rem 0', color: '#718096' }}>{e.completedAt ? new Date(e.completedAt).toLocaleDateString() : 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p style={{ textAlign: 'center' }}>No exams taken yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
