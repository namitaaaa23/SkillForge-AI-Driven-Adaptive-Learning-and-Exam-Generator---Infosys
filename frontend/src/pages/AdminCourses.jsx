import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminCourses() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [assigningCourse, setAssigningCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [assignEmails, setAssignEmails] = useState("");

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        difficultyLevel: "BEGINNER",
        estimatedHours: 10,
        published: false,
        thumbnailUrl: ""
    });

    const [newMaterial, setNewMaterial] = useState({
        title: "",
        type: "TEXT",
        contentUrl: "",
        textContent: ""
    });

    const userProfile = user || location.state?.userProfile || { userName: "Admin", role: "Admin" };

    useEffect(() => {
        if (!authLoading && !user) navigate('/');
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (user) loadCourses();
    }, [user]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredCourses(courses);
        } else {
            setFilteredCourses(courses.filter(c =>
                c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    }, [searchTerm, courses]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await api.getAllCoursesAdmin();
            if (response.success) {
                setCourses(response.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await api.createCourse(newCourse);
            if (response.success) {
                setShowCreateModal(false);
                setNewCourse({ title: "", description: "", difficultyLevel: "BEGINNER", estimatedHours: 10, published: false, thumbnailUrl: "" });
                loadCourses();
            }
        } catch (err) {
            alert("Failed to create course");
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await api.updateCourse(editingCourse.id, editingCourse);
            if (response.success) {
                setShowEditModal(false);
                loadCourses();
            }
        } catch (err) {
            alert("Failed to update course");
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure? This will delete all course contents too.")) return;
        try {
            const response = await api.deleteCourse(id);
            if (response.success) loadCourses();
        } catch (err) {
            alert("Failed to delete course");
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const response = await api.addCourseMaterial(selectedCourseId, newMaterial);
            if (response.success) {
                setShowMaterialModal(false);
                setNewMaterial({ title: "", type: "TEXT", contentUrl: "", textContent: "" });
                alert("Material added successfully");
            }
        } catch (err) {
            alert("Failed to add material");
        }
    };

    const togglePublish = async (course) => {
        try {
            const response = course.published
                ? await api.unpublishCourse(course.id)
                : await api.publishCourse(course.id);
            if (response.success) loadCourses();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleAssignCourse = async (e) => {
        e.preventDefault();
        if (!assignEmails.trim()) {
            alert("Please enter at least one email address");
            return;
        }

        try {
            const emails = assignEmails.split(',').map(e => e.trim()).filter(e => e);
            const response = await api.assignCourseToLearners(assigningCourse.id, emails);
            if (response.success) {
                alert(`Course assigned to ${emails.length} learner(s) successfully!`);
                setShowAssignModal(false);
                setAssignEmails("");
                setAssigningCourse(null);
            }
        } catch (err) {
            alert("Failed to assign course: " + err.message);
        }
    };

    if (authLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!user) return null;

    const glassModalStyle = {
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        padding: '2.5rem',
        width: '600px',
        maxWidth: '90%',
        maxHeight: '85vh',
        overflowY: 'auto'
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #ddd',
        marginBottom: '1.2rem',
        fontSize: '1rem'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '700',
        color: '#333'
    };

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
                        <a href="/admin-courses" className="active" onClick={(e) => { e.preventDefault(); }}>COURSES</a>
                        <a href="/admin-users" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
                        <a href="/admin-analytics" onClick={(e) => { e.preventDefault(); navigate('/admin-analytics'); }}>ANALYTICS</a>
                        <a href="/admin-course-requests" onClick={(e) => { e.preventDefault(); navigate('/admin-course-requests'); }}>REQUESTS</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => navigate('/admin-profile')}>{userProfile.userName?.charAt(0) || 'A'}</div>
                    </div>
                </div>
            </div>

            <main className="ld-main">
                {/* Hero Banner */}
                <div className="ld-hero-banner animate-up">
                    <div className="ld-hero-content">
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                                Course <span style={{ color: '#a18cd1' }}>Management</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Create and curate high-quality learning paths for students.</p>

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                                <button className="primary-btn" style={{ background: 'white', color: '#6a11cb' }} onClick={() => setShowCreateModal(true)}>
                                    + Create New Course
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{courses.length}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px' }}>TOTAL COURSES</span>
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
                            minWidth: '220px'
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>QUICK SEARCH</div>
                            <input
                                type="text"
                                placeholder="Search courses..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="premium-card-v3" style={{ padding: '5rem', textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                        <p style={{ color: '#718096', fontWeight: '600' }}>Loading courses...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
                        {filteredCourses.map(course => (
                            <div key={course.id} className="premium-card-v3 animate-up" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '10px',
                                        background: '#f0f4ff',
                                        color: '#6a11cb',
                                        fontSize: '0.75rem',
                                        fontWeight: '800'
                                    }}>{course.difficultyLevel}</span>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: course.published ? '#43e97b' : '#f5576c'
                                        }}></div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            color: '#718096',
                                            letterSpacing: '1px'
                                        }}>
                                            {course.published ? 'PUBLISHED' : 'DRAFT'}
                                        </span>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: '#1a1a2e' }}>{course.title}</h3>
                                <p style={{ color: '#718096', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>{course.description}</p>

                                <div style={{ display: 'flex', gap: '0.8rem', paddingTop: '1.5rem', borderTop: '1px solid #f0f0f0' }}>
                                    <button onClick={() => { setEditingCourse(course); setShowEditModal(true); }} className="primary-btn" style={{ flex: 1, padding: '10px', background: '#f8f9fa', color: '#1a1a2e', boxShadow: 'none' }}>Edit</button>
                                    <button onClick={() => { setSelectedCourseId(course.id); setShowMaterialModal(true); }} className="primary-btn" style={{ flex: 1, padding: '10px', background: '#f8f9fa', color: '#1a1a2e', boxShadow: 'none' }}>Content</button>
                                    <button onClick={() => { setAssigningCourse(course); setShowAssignModal(true); }} className="primary-btn" style={{ flex: 1, padding: '10px', background: '#f0f4ff', color: '#6a11cb', boxShadow: 'none' }}>Assign</button>
                                    <button onClick={() => togglePublish(course)} className="primary-btn" style={{
                                        flex: 1.2,
                                        padding: '10px',
                                        background: course.published ? '#fff5f5' : '#f0fff4',
                                        color: course.published ? '#f5576c' : '#2e7d32',
                                        boxShadow: 'none'
                                    }}>
                                        {course.published ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button onClick={() => handleDeleteCourse(course.id)} style={{ padding: '10px', borderRadius: '12px', border: 'none', background: '#fff5f5', color: '#f5576c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modals - Refined Styling */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '600px', maxWidth: '90%', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Create New Course</h2>
                        <form onSubmit={handleCreateCourse}>
                            <label style={labelStyle}>Course Title</label>
                            <input style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} required placeholder="e.g. Advanced Java Microservices" />

                            <label style={labelStyle}>Description</label>
                            <textarea style={{ ...inputStyle, height: '120px', resize: 'none', borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} required placeholder="Enter course overview..." />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Difficulty</label>
                                    <select style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newCourse.difficultyLevel} onChange={e => setNewCourse({ ...newCourse, difficultyLevel: e.target.value })}>
                                        <option>BEGINNER</option>
                                        <option>INTERMEDIATE</option>
                                        <option>ADVANCED</option>
                                        <option>EXPERT</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Hours</label>
                                    <input type="number" style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newCourse.estimatedHours} onChange={e => setNewCourse({ ...newCourse, estimatedHours: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="primary-btn" style={{ flex: 1.5 }}>Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && editingCourse && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '600px', maxWidth: '90%', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Edit Course</h2>
                        <form onSubmit={handleUpdateCourse}>
                            <label style={labelStyle}>Title</label>
                            <input style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={editingCourse.title} onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })} />
                            <label style={labelStyle}>Description</label>
                            <textarea style={{ ...inputStyle, height: '120px', borderRadius: '14px', border: '2px solid #f0f4f8' }} value={editingCourse.description} onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })} />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="primary-btn" style={{ flex: 1.5 }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMaterialModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '600px', maxWidth: '90%', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Add Content</h2>
                        <form onSubmit={handleAddMaterial}>
                            <label style={labelStyle}>Title</label>
                            <input style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newMaterial.title} onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} required />

                            <label style={labelStyle}>Type</label>
                            <select style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newMaterial.type} onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value })}>
                                <option>TEXT</option>
                                <option>VIDEO</option>
                                <option>PDF</option>
                                <option>BLOG</option>
                                <option>YOUTUBE</option>
                            </select>

                            <label style={labelStyle}>URL / Path</label>
                            <input style={{ ...inputStyle, borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newMaterial.contentUrl} onChange={e => setNewMaterial({ ...newMaterial, contentUrl: e.target.value })} placeholder="https://..." />

                            {newMaterial.type === 'TEXT' && (
                                <>
                                    <label style={labelStyle}>Text Content</label>
                                    <textarea style={{ ...inputStyle, height: '150px', borderRadius: '14px', border: '2px solid #f0f4f8' }} value={newMaterial.textContent} onChange={e => setNewMaterial({ ...newMaterial, textContent: e.target.value })} />
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setShowMaterialModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="primary-btn" style={{ flex: 1.5 }}>Add Content</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssignModal && assigningCourse && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '600px', maxWidth: '90%', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Assign Course</h2>
                        <div style={{ padding: '1.2rem', background: '#f0f4ff', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #e0e7ff' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#6a11cb', fontSize: '1.1rem' }}>{assigningCourse.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>{assigningCourse.description?.substring(0, 80)}...</p>
                        </div>

                        <form onSubmit={handleAssignCourse}>
                            <label style={labelStyle}>Learner Email Addresses</label>
                            <p style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.8rem' }}>
                                Separate emails with commas (e.g., student1@mail.com, student2@mail.com).
                            </p>
                            <textarea
                                style={{ ...inputStyle, height: '120px', borderRadius: '14px', border: '2px solid #f0f4f8', fontFamily: 'monospace' }}
                                value={assignEmails}
                                onChange={e => setAssignEmails(e.target.value)}
                                placeholder="john@doe.com, jane@smith.com"
                                required
                            />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" onClick={() => { setShowAssignModal(false); setAssignEmails(""); }} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="primary-btn" style={{ flex: 1.5 }}>Assign Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
