import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminCourseRequests() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("PENDING");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseText, setResponseText] = useState("");
    const [availableCourses, setAvailableCourses] = useState([]);
    const [linkedCourseId, setLinkedCourseId] = useState("");

    useEffect(() => {
        loadRequests();
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await api.getCourses();
            if (response.success) setAvailableCourses(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await api.getAllCourseRequests();
            if (response.success) {
                setRequests(response.data || []);
            }
        } catch (error) {
            console.error("Failed to load requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, status) => {
        try {
            // If approved and a course is linked, we could pass that info too
            // For now, standard response
            const response = await api.respondToCourseRequest(requestId, status, responseText);
            if (response.success) {
                if (status === 'APPROVED' && linkedCourseId) {
                    // Automatically enroll the student in the linked course
                    await api.request(`/courses/${linkedCourseId}/enroll-student/${selectedRequest.learnerName}`, {
                        method: 'POST'
                    });
                }
                alert(`Request ${status.toLowerCase()} successfully!`);
                setSelectedRequest(null);
                setResponseText("");
                setLinkedCourseId("");
                loadRequests();
            }
        } catch (error) {
            alert("Failed to respond: " + error.message);
        }
    };

    const filteredRequests = requests.filter(r =>
        filter === "ALL" ? true : r.status === filter
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "#fbbf24";
            case "APPROVED": return "#10b981";
            case "REJECTED": return "#ef4444";
            default: return "#6b7280";
        }
    };

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/admin-dashboard" onClick={e => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
                        <a href="/admin-courses" onClick={e => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
                        <a href="/admin-users" onClick={e => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
                        <a href="/admin-analytics" onClick={e => { e.preventDefault(); navigate('/admin-analytics'); }}>ANALYTICS</a>
                        <a className="active">REQUESTS</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => navigate('/admin-profile')}>
                            {user?.userName?.charAt(0) || 'A'}
                        </div>
                    </div>
                </div>
            </div>

            <main className="ld-main">
                {/* Hero Banner */}
                <div className="ld-hero-banner animate-up" style={{ marginBottom: '2.5rem' }}>
                    <div className="ld-hero-content">
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                                Course <span style={{ color: '#a18cd1' }}>Requests</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Review and manage enrollment requests from students across the platform.</p>

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{requests.filter(r => r.status === 'PENDING').length}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px' }}>PENDING REQUESTS</span>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            padding: '1.5rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            textAlign: 'center',
                            minWidth: '280px'
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem', letterSpacing: '2px' }}>SORT BY STATUS</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                {["ALL", "PENDING", "APPROVED", "REJECTED"].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: filter === status ? 'white' : 'rgba(255,255,255,0.1)',
                                            color: filter === status ? '#6a11cb' : 'white',
                                            fontWeight: '800',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="animate-up" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#718096' }}>
                            <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                            Fetching course requests...
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="premium-card-v3" style={{ textAlign: 'center', padding: '5rem', color: '#718096' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            No {filter.toLowerCase()} requests found in the system.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {filteredRequests.map(request => (
                                <div key={request.id} className="premium-card-v3 animate-up" style={{ padding: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e' }}>{request.courseName}</h3>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    letterSpacing: '1px',
                                                    background: getStatusColor(request.status) + '15',
                                                    color: getStatusColor(request.status),
                                                    border: `1px solid ${getStatusColor(request.status)}30`
                                                }}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div style={{ color: '#718096', fontSize: '0.95rem', fontWeight: '500' }}>
                                                Learner: <strong style={{ color: '#1a1a2e' }}>{request.learnerName}</strong> • {request.learnerEmail}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#718096', fontWeight: '600' }}>
                                            {new Date(request.requestedAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>COURSE DESCRIPTION</div>
                                            <p style={{ color: '#4a5568', lineHeight: '1.6', fontSize: '0.95rem' }}>{request.courseDescription || 'No description provided.'}</p>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>REASON FOR ENROLLMENT</div>
                                            <p style={{ color: '#4a5568', lineHeight: '1.6', fontSize: '0.95rem' }}>{request.reason}</p>
                                        </div>
                                    </div>

                                    {request.adminResponse && (
                                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginTop: '2rem', border: '1px solid #edf2f7' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.5rem' }}>ADMINISTRATOR FEEDBACK</div>
                                            <p style={{ color: '#1a1a2e', margin: 0, fontWeight: '500' }}>{request.adminResponse}</p>
                                        </div>
                                    )}

                                    {request.status === "PENDING" && (
                                        <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f0f4f8' }}>
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                className="primary-btn"
                                                style={{ width: '100%', padding: '1.2rem' }}
                                            >
                                                Respond to Enrollment Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Response Modal */}
            {selectedRequest && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3 animate-up" style={{ width: '600px', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Action Required</h2>
                        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #edf2f7' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '4px' }}>SELECTED COURSE</div>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1a1a2e' }}>{selectedRequest.courseName}</div>
                            <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '4px' }}>Requested by {selectedRequest.learnerName}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>LINK TO EXISTING COURSE (OPTIONAL)</label>
                            <select
                                value={linkedCourseId}
                                onChange={(e) => setLinkedCourseId(e.target.value)}
                                style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid #f0f4f8', outline: 'none', background: 'white' }}
                            >
                                <option value="">-- No specific course --</option>
                                {availableCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '8px' }}>Selecting a course will auto-enroll the student upon approval.</p>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>DECISION FEEDBACK (OPTIONAL)</label>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Provide a brief explanation for your decision..."
                                style={{ width: '100%', padding: '15px', borderRadius: '14px', border: '2px solid #f0f4f8', fontSize: '1rem', minHeight: '100px', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setSelectedRequest(null); setResponseText(""); }} style={{ flex: 1, padding: '1.2rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '800', color: '#718096', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => handleRespond(selectedRequest.id, "REJECTED")} style={{ flex: 1, padding: '1.2rem', background: '#fff5f5', border: 'none', borderRadius: '14px', fontWeight: '800', color: '#f5576c', cursor: 'pointer' }}>Reject</button>
                            <button onClick={() => handleRespond(selectedRequest.id, "APPROVED")} className="primary-btn" style={{ flex: 1.5 }}>Approve Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
