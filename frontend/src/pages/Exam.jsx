import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Exam.css";

export default function Exam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const userProfile = location.state?.userProfile;

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        loadExam();
    }, [id]);

    const loadExam = async () => {
        try {
            setLoading(true);
            const response = await api.getExamById(id);
            if (response.success) {
                setExam(response.data);
            } else {
                alert("Failed to load exam");
            }
        } catch (error) {
            console.error("Error loading exam:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!window.confirm("Are you sure you want to submit?")) return;

        try {
            setSubmitting(true);
            const answersList = Object.entries(answers).map(([qId, selectedOptionIndex]) => {
                const question = exam.questions.find(q => q.id === qId);
                return {
                    id: qId,
                    correctAnswers: [question.options[selectedOptionIndex]]
                };
            });

            const response = await api.submitExam(id, answersList);

            if (response.success) {
                setResult(response.data);
            } else {
                alert("Failed to submit exam: " + response.message);
            }
        } catch (error) {
            alert("Error submitting exam: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                <p>Loading Exam Content...</p>
            </div>
        </div>
    );

    if (!exam) return (
        <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <h2>Exam Not Found</h2>
                <button onClick={() => navigate('/learner-dashboard')} className="primary-btn">Go Back</button>
            </div>
        </div>
    );

    if (result) {
        return (
            <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '4rem 2rem' }}>
                <div className="ld-main" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="ld-stat-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '32px' }}>
                        <div style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            border: `8px solid ${result.passed ? '#43e97b' : '#f5576c'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 2rem'
                        }}>
                            <div style={{ fontSize: '3rem', fontWeight: '800', color: result.passed ? '#43e97b' : '#f5576c' }}>{result.score}%</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: '600' }}>SCORE</div>
                        </div>

                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            {result.score >= 90 ? "Mastery Achieved! 🏆" :
                                result.score >= 70 ? "Great Job! 🌟" :
                                    result.score >= 50 ? "Good Effort! 👍" : "Keep Learning 📚"}
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '3rem' }}>
                            {result.score >= 90 ? "You've demonstrated exceptional understanding. You're ready for the next challenge!" :
                                result.score >= 70 ? "You have a solid grasp of the concepts. A little more practice and you'll be perfect." :
                                    result.score >= 50 ? "You passed! Review the areas where you missed marks to improve." :
                                        "Don't be discouraged. Review the course material and try again. Persistence is key to mastery."}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '16px' }}>
                                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: result.passed ? '#2e7d32' : '#c62828' }}>{result.passed ? "PASSED" : "FAILED"}</div>
                            </div>
                            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '16px' }}>
                                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Time Taken</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>12:45</div>
                            </div>
                        </div>

                        <button
                            className="primary-btn"
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
                            onClick={() => navigate('/learner-dashboard', { state: { userProfile } })}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ld-wrapper" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <div className="ld-topbar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="header-container">
                    <div className="ld-logo">SkillForge AI</div>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>{exam.title}</div>
                    <div className="ld-topbar-right">
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', fontWeight: '700' }}>
                            ⏱️ 14:59
                        </div>
                    </div>
                </div>
            </div>

            <div className="ld-main" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
                    {exam.questions.map((q, index) => (
                        <div key={q.id} className="ld-stat-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{
                                    minWidth: '35px',
                                    height: '35px',
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700'
                                }}>{index + 1}</span>
                                <h4 style={{ fontSize: '1.2rem', color: '#333', marginTop: '5px' }}>{q.questionText}</h4>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem', paddingLeft: '3rem' }}>
                                {q.options.map((opt, i) => (
                                    <label key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1.2rem',
                                        borderRadius: '12px',
                                        border: `2px solid ${answers[q.id] === i ? '#667eea' : '#eee'}`,
                                        background: answers[q.id] === i ? '#f0f4ff' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: answers[q.id] === i ? '600' : '400'
                                    }}>
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            checked={answers[q.id] === i}
                                            onChange={() => handleOptionSelect(q.id, i)}
                                            style={{ width: '20px', height: '20px', accentColor: '#667eea' }}
                                        />
                                        <span style={{ fontSize: '1.05rem' }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
                    position: 'sticky',
                    bottom: '2rem'
                }}>
                    <div style={{ color: '#666' }}>
                        <strong>{Object.keys(answers).length}</strong> of <strong>{exam.questions.length}</strong> questions answered
                    </div>
                    <button
                        className="primary-btn"
                        style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Assessment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
