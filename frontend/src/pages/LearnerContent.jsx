import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function LearnerContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user, loading: authLoading } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseContents, setCourseContents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterLevel, setFilterLevel] = useState("ALL");
    const [enrolling, setEnrolling] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [courseRequestForm, setCourseRequestForm] = useState({
        courseName: "",
        courseDescription: "",
        reason: ""
    });
    const [myRequests, setMyRequests] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const userProfile = user || location.state?.userProfile || { userName: "Student", email: "", id: "", role: "Student" };

    useEffect(() => {
        if (!authLoading && !user) navigate('/');
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (user) {
            loadCourses();
            loadEnrolledCourses();
            loadMyRequests();
        }
    }, [user]);

    useEffect(() => {
        filterAndSortCourses();
    }, [courses, searchTerm, filterLevel]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await api.getCourses();
            if (response.success) setCourses(response.data || []);
        } catch (error) {
            console.error("Failed to load courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCourses = () => {
        let filtered = courses.filter(c => {
            const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = filterLevel === "ALL" || c.difficultyLevel === filterLevel;
            return matchesSearch && matchesLevel;
        });
        setFilteredCourses(filtered);
    };

    const handleViewCourse = async (course) => {
        setSelectedCourse(course);
        try {
            setLoading(true);
            const response = await api.request(`/api/learning-content/course/${course.id}`);
            if (response) setCourseContents(response);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadEnrolledCourses = async () => {
        try {
            const response = await api.getMyCourses();
            if (response.success) {
                const enrolledIds = (response.data || []).map(c => c.id);
                setEnrolledCourses(enrolledIds);
            }
        } catch (error) {
            console.error("Failed to load enrolled courses:", error);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            setEnrolling(courseId);
            const response = await api.enrollInCourse(courseId);
            if (response.success) {
                // Instant UI feedback
                setEnrolledCourses(prev => [...prev, courseId]);

                alert("Successfully enrolled in course! You can now access all learning materials.");

                // Background refresh to ensure consistency
                loadCourses();
                loadEnrolledCourses();
            }
        } catch (error) {
            alert("Enrollment failed: " + error.message);
        } finally {
            setEnrolling(null);
        }
    };

    const handleStartCourse = (courseId) => {
        localStorage.setItem('currentCourseId', courseId);
        navigate('/student-learning', { state: { userProfile } });
    };

    const handleRequestCourse = async (e) => {
        e.preventDefault();
        if (!courseRequestForm.courseName || !courseRequestForm.reason) {
            alert("Please fill all required fields");
            return;
        }

        try {
            const response = await api.createCourseRequest(courseRequestForm);
            if (response.success) {
                alert("Course request submitted successfully! Admin will review your request.");
                setShowRequestModal(false);
                setCourseRequestForm({ courseName: "", courseDescription: "", reason: "" });
                loadMyRequests();
            }
        } catch (error) {
            alert("Failed to submit request: " + error.message);
        }
    };

    const loadMyRequests = async () => {
        try {
            const response = await api.getMyCourseRequests();
            if (response.success) {
                setMyRequests(response.data || []);
            }
        } catch (error) {
            console.error("Failed to load requests:", error);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (authLoading) return <div className="ld-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/learner-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/learner-dashboard" onClick={e => { e.preventDefault(); navigate('/learner-dashboard'); }}>DASHBOARD</a>
                        <a href="/learner-content" className="active" onClick={e => e.preventDefault()}>COURSES</a>
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
                {!selectedCourse ? (
                    <>
                        <div className="ld-hero-banner animate-up">
                            <div className="ld-hero-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1.5rem' }}>
                                <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.1' }}>Curated Course Library</h1>
                                <p style={{ fontSize: '1.1rem', opacity: 0.7, maxWidth: '800px' }}>Skip the fluff. Master industry-grade skills with paths designed by experts.</p>

                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    width: '100%',
                                    marginTop: '2rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '1.5rem',
                                    borderRadius: '24px',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="Search courses..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', padding: '15px 20px', borderRadius: '14px', color: 'white', fontSize: '1rem' }}
                                    />
                                    <select
                                        value={filterLevel}
                                        onChange={e => setFilterLevel(e.target.value)}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '15px 20px', borderRadius: '14px', color: 'white', cursor: 'pointer', minWidth: '180px' }}
                                    >
                                        <option value="ALL" style={{ color: 'black' }}>All Levels</option>
                                        <option value="BEGINNER" style={{ color: 'black' }}>Beginner</option>
                                        <option value="INTERMEDIATE" style={{ color: 'black' }}>Intermediate</option>
                                        <option value="ADVANCED" style={{ color: 'black' }}>Advanced</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="primary-btn"
                                style={{
                                    padding: '15px 40px',
                                    fontSize: '1.05rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                📬 Request New Course from Admin
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                            {filteredCourses.map((course, idx) => (
                                // ... card contents ...
                                <div key={course.id} className="premium-card-v3 animate-up" style={{ animationDelay: `${idx * 0.1}s`, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ height: '200px', background: 'linear-gradient(135deg, #f0f4ff, #e2e8f0)', borderRadius: '20px', marginBottom: '1.5rem', overflow: 'hidden', position: 'relative' }}>
                                        {course.thumbnailUrl && <img src={course.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', padding: '5px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', color: '#6a11cb' }}>{course.difficultyLevel}</div>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.5rem' }}>{course.title}</h3>
                                    <p style={{ color: '#718096', fontSize: '0.95rem', lineHeight: '1.6', flex: 1 }}>{course.description?.substring(0, 100)}...</p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0', color: '#a0aec0', fontSize: '0.85rem', fontWeight: '700' }}>
                                        <span>⏱ {course.estimatedHours}h</span>
                                        <span>👥 {course.enrolledUserIds?.length || 0} Learners</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => handleViewCourse(course)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid #6a11cb', color: '#6a11cb', fontWeight: '800', background: 'none', cursor: 'pointer' }}>Details</button>
                                        <button
                                            className="primary-btn"
                                            style={{
                                                flex: 1,
                                                background: enrolledCourses.includes(course.id) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => enrolledCourses.includes(course.id) ? handleStartCourse(course.id) : handleEnroll(course.id)}
                                            disabled={enrolling === course.id}
                                        >
                                            {enrolling === course.id ? "Enrolling..." : enrolledCourses.includes(course.id) ? "Start Learning →" : "Enroll Now"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {myRequests.length > 0 && (
                            <div style={{ marginTop: '5rem' }}>
                                <div className="ld-section-title">
                                    <h2>My Course Requests</h2>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6a11cb' }}>{myRequests.length} SUBMITTED</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {myRequests.map((req, i) => (
                                        <div key={i} className="premium-card-v3" style={{ padding: '1.5rem', borderLeft: `5px solid ${req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : '#fbbf24'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, fontWeight: '800' }}>{req.courseName}</h4>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#ef4444' : '#fbbf24' }}>{req.status}</span>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0 0 1rem 0' }}>{req.reason.substring(0, 60)}...</p>
                                            {req.adminResponse && (
                                                <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '10px', fontSize: '0.8rem' }}>
                                                    <strong>Admin:</strong> {req.adminResponse}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <button onClick={() => setSelectedCourse(null)} style={{ background: 'none', border: 'none', color: '#6a11cb', fontWeight: '800', cursor: 'pointer', fontSize: '1.1rem', marginBottom: '2rem' }}>← Back to Courses</button>
                        <div className="premium-card-v3">
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>{selectedCourse.title}</h1>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                                <div>
                                    <p style={{ fontSize: '1.1rem', color: '#718096', lineHeight: '1.7', marginBottom: '2.5rem' }}>{selectedCourse.description}</p>
                                    <div className="ld-section-title"><h2>Course Contents</h2></div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {courseContents.length > 0 ? courseContents.map((content, i) => (
                                            <div key={i} style={{ padding: '1.25rem', background: '#f8f9fa', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '700' }}>{content.title || `Module ${i + 1}`}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#6a11cb', fontWeight: '800' }}>{content.type}</span>
                                            </div>
                                        )) : <p>No contents available yet.</p>}
                                    </div>
                                </div>
                                <div className="premium-card-v3" style={{ height: 'fit-content' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6a11cb', fontWeight: '800', marginBottom: '1rem' }}>ENROLLMENT</div>
                                    <button
                                        className="primary-btn"
                                        style={{
                                            width: '100%',
                                            marginBottom: '1rem',
                                            background: enrolledCourses.includes(selectedCourse.id) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => enrolledCourses.includes(selectedCourse.id) ? handleStartCourse(selectedCourse.id) : handleEnroll(selectedCourse.id)}
                                    >
                                        {enrolledCourses.includes(selectedCourse.id) ? "Start Learning →" : "Enroll in Course"}
                                    </button>
                                    <p style={{ fontSize: '0.85rem', color: '#718096', textAlign: 'center' }}>Master this skill in approx. {selectedCourse.estimatedHours} hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Course Request Modal */}
            {showRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '30px',
                        padding: '3rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.3)'
                    }}>
                        <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>
                            Request New Course
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                            Can't find the course you're looking for? Let the admin know what you'd like to learn!
                        </p>

                        <form onSubmit={handleRequestCourse}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Course Name *
                                </label>
                                <input
                                    type="text"
                                    value={courseRequestForm.courseName}
                                    onChange={(e) => setCourseRequestForm({ ...courseRequestForm, courseName: e.target.value })}
                                    placeholder="e.g., Advanced Machine Learning"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        background: 'rgba(255,255,255,0.95)'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Course Description
                                </label>
                                <textarea
                                    value={courseRequestForm.courseDescription}
                                    onChange={(e) => setCourseRequestForm({ ...courseRequestForm, courseDescription: e.target.value })}
                                    placeholder="What should this course cover?"
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        background: 'rgba(255,255,255,0.95)',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    Why do you need this course? *
                                </label>
                                <textarea
                                    value={courseRequestForm.reason}
                                    onChange={(e) => setCourseRequestForm({ ...courseRequestForm, reason: e.target.value })}
                                    placeholder="Tell us why this course would be valuable to you"
                                    required
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        background: 'rgba(255,255,255,0.95)',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRequestModal(false);
                                        setCourseRequestForm({ courseName: "", courseDescription: "", reason: "" });
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        borderRadius: '15px',
                                        border: '2px solid white',
                                        background: 'transparent',
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        borderRadius: '15px',
                                        border: 'none',
                                        background: 'white',
                                        color: '#667eea',
                                        fontWeight: '800',
                                        fontSize: '1rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
