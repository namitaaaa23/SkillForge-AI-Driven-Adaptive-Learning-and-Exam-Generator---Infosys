import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AiExamGenerator() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, loading: authLoading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const userProfile = user || location.state?.userProfile || { userName: "Student", email: "demo@skillforge.com", role: "Student" };

    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [questionCount, setQuestionCount] = useState(30);
    const [examMode, setExamMode] = useState('exam');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedExam, setGeneratedExam] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) navigate('/');
    }, [authLoading, user, navigate]);

    const handleLogout = () => { logout(); navigate('/'); };

    const handleGenerate = async () => {
        if (!topic) return;

        setIsGenerating(true);
        try {
            const currentCourseId = location.state?.courseId || "General";
            const response = await api.generateExamQuestions(currentCourseId, topic, questionCount, difficulty);

            if (response && response.questions) {
                setGeneratedExam({
                    title: `${response.topic || topic} Assessment`,
                    questions: response.questions,
                    courseId: response.courseId,
                    difficulty: response.difficulty || difficulty,
                    topic: response.topic || topic
                });
            } else {
                throw new Error("Invalid response from AI Service");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate exam. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }

    if (authLoading) return <div className="ld-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!user) return null;

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/learner-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/learner-dashboard" onClick={e => { e.preventDefault(); navigate('/learner-dashboard'); }}>DASHBOARD</a>
                        <a href="/learner-content" onClick={e => { e.preventDefault(); navigate('/learner-content'); }}>COURSES</a>
                        <a href="/learner-progress" onClick={e => { e.preventDefault(); navigate('/learner-progress'); }}>PROGRESS</a>
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
                {!generatedExam ? (
                    <div className="animate-up">
                        <div className="ld-hero-banner">
                            <div className="ld-hero-content">
                                <div>
                                    <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1rem' }}>AI Exam Architect</h1>
                                    <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '600px' }}>
                                        Craft bespoke assessments instantly. Our AI analyzes your requirements to generate industry-standard questions.
                                    </p>
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(20px)',
                                    padding: '2rem',
                                    borderRadius: '24px',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    minWidth: '220px'
                                }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>ENGINE</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#a18cd1' }}>GEMINI 2.0</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '5px' }}>Pro Reasoning Active</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ maxWidth: '900px', margin: '0 auto' }} className="animate-up">
                            <div className="premium-card-v3">
                                <div className="ld-section-title"><h2>Configure Your Assessment</h2></div>

                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '5px', background: '#f8f9fa', borderRadius: '12px' }}>
                                    <button
                                        onClick={() => { setExamMode('assessment'); setQuestionCount(10); }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: examMode === 'assessment' ? 'white' : 'transparent',
                                            boxShadow: examMode === 'assessment' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                            fontWeight: examMode === 'assessment' ? '700' : '500',
                                            color: examMode === 'assessment' ? '#6a11cb' : '#718096',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Quick Assessment (10 Q)
                                    </button>
                                    <button
                                        onClick={() => { setExamMode('exam'); setQuestionCount(20); }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: examMode === 'exam' ? 'white' : 'transparent',
                                            boxShadow: examMode === 'exam' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                            fontWeight: examMode === 'exam' ? '700' : '500',
                                            color: examMode === 'exam' ? '#6a11cb' : '#718096',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Full Exam (~20 Q)
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#718096', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject or Topic</label>
                                        <input
                                            type="text"
                                            className="premium-card-v3"
                                            style={{ width: '100%', padding: '1.2rem', border: '2px solid #f0f4f8', boxShadow: 'none', fontSize: '1.1rem' }}
                                            placeholder="e.g., Quantum Computing, React Advanced Hooks, Ancient History..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#718096', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Difficulty Complexity</label>
                                            <select
                                                className="premium-card-v3"
                                                style={{ width: '100%', padding: '1.2rem', border: '2px solid #f0f4f8', boxShadow: 'none', background: 'white', cursor: 'pointer' }}
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                            >
                                                <option>Beginner</option>
                                                <option>Intermediate</option>
                                                <option>Advanced</option>
                                                <option>Expert</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', color: '#718096', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Question Volume</label>
                                            <input
                                                type="number"
                                                className="premium-card-v3"
                                                style={{ width: '100%', padding: '1.2rem', border: '2px solid #f0f4f8', boxShadow: 'none', opacity: examMode === 'assessment' ? 0.7 : 1 }}
                                                min="5"
                                                max="50"
                                                value={questionCount}
                                                readOnly={examMode === 'assessment'}
                                                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="primary-btn"
                                        style={{ width: '100%', padding: '1.5rem', fontSize: '1.2rem' }}
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !topic}
                                    >
                                        {isGenerating ? "Synthesizing Assessment..." : `Generate ${examMode === 'exam' ? 'Full Exam' : 'Quick Assessment'} ✨`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="premium-card-v3" style={{ textAlign: 'center', padding: '4rem' }}>
                            <div style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '3rem', color: 'white', boxShadow: '0 20px 40px rgba(79, 172, 254, 0.3)' }}>✓</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Assessment Ready</h2>
                            <p style={{ color: '#718096', fontSize: '1.2rem', marginBottom: '3rem' }}>{generatedExam.title}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1a1a2e' }}>{generatedExam.questions.length}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '800' }}>QUESTIONS</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1a1a2e' }}>{difficulty}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '800' }}>LEVEL</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1a1a2e', paddingTop: '8px' }}>{topic.substring(0, 15)}...</div>
                                    <div style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '800' }}>TOPIC</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button
                                    className="primary-btn"
                                    style={{ flex: 1.5, padding: '1.2rem' }}
                                    onClick={async () => {
                                        try {
                                            const response = await api.createExam(generatedExam);
                                            if (response.success && response.data) {
                                                navigate(`/exam/${response.data.id}`, { state: { userProfile } });
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Error starting exam");
                                        }
                                    }}
                                >
                                    Begin Assessment Now
                                </button>
                                <button
                                    className="premium-card-v3"
                                    style={{ flex: 1, padding: '1.2rem', margin: 0, boxShadow: 'none', border: '2px solid #f0f4f8' }}
                                    onClick={() => setGeneratedExam(null)}
                                >
                                    Refine Design
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
