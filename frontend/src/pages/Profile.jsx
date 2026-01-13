import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Initialize state with location state or auth context user
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        bio: user?.bio || "Passionate learner exploring AI and technology.",
        role: user?.role || "Student",
        // New Academic Fields (Mock data for UI demonstration)
        instituteName: "SkillForge Institute of Technology",
        studentId: "SF-2025-BATCH-A",
        branch: "Computer Science & Engineering",
        adminName: "System Administrator",
        adminContact: "admin@skillforge.com",
        preferredCourses: "Artificial Intelligence, Data Science, Web Development"
    });

    // Determine role for dashboard back link
    const userProfile = location.state?.userProfile || user || {};
    const role = (userProfile.role || "").toUpperCase();

    const dashboardLink = role === 'ADMIN' ? '/admin-dashboard'
        : role === 'GUARDIAN' ? '/guardian-dashboard'
            : '/learner-dashboard';

    // Theme Configuration
    let themeGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Learner (Purple)
    let themeShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';

    if (role === 'ADMIN') {
        themeGradient = 'linear-gradient(135deg, #232526 0%, #414345 100%)'; // Admin (Black/Grey)
        themeShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    } else if (role === 'GUARDIAN') {
        themeGradient = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'; // Guardian (Teal)
        themeShadow = '0 4px 15px rgba(17, 153, 142, 0.3)';
    }

    const [activeTab, setActiveTab] = useState("details");
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => { logout(); navigate('/'); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Update form data when user context updates (fix for initial empty state)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || user.userName || user.username || prev.fullName,
                email: user.email || prev.email,
                role: user.role || prev.role,
                bio: user.bio || prev.bio
            }));
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const updates = {
                fullName: formData.fullName,
                bio: formData.bio,
                // profileImage: ... (if we implementation image upload later)
            };

            const response = await api.updateUser(user.id, updates);

            if (response.success) {
                setMessage("Profile updated successfully!");
                setIsEditing(false);
                // Update local user state if needed
                // updateUserContext(response.data); 
            } else {
                setMessage("Failed to update profile: " + (response.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const isLearner = !userProfile.role ||
        userProfile.role.toUpperCase() === 'STUDENT' ||
        userProfile.role.toUpperCase() === 'LEARNER';
    const isAdmin = userProfile.role?.toUpperCase() === 'ADMIN';
    const isGuardian = userProfile.role?.toUpperCase() === 'GUARDIAN';

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate(dashboardLink)} style={{ cursor: 'pointer' }}>SkillForge AI</div>

                    <nav className="nav-links">
                        {/* Dynamic Nav based on Role */}
                        {isLearner && (
                            <>
                                <a href="/learner-dashboard" onClick={(e) => { e.preventDefault(); navigate('/learner-dashboard'); }}>Dashboard</a>
                                <a href="/learner-content" onClick={(e) => { e.preventDefault(); navigate('/learner-content'); }}>Courses</a>
                                <a href="/learner-progress" onClick={(e) => { e.preventDefault(); navigate('/learner-progress'); }}>Progress</a>
                            </>
                        )}
                        {isAdmin && (
                            <>
                                <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>Dashboard</a>
                                <a href="/admin-courses" onClick={(e) => { e.preventDefault(); navigate('/admin-courses'); }}>Courses</a>
                                <a href="/admin-users" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }}>Users</a>
                                <a href="/admin-analytics" onClick={(e) => { e.preventDefault(); navigate('/admin-analytics'); }}>Analytics</a>
                            </>
                        )}
                        {isGuardian && (
                            <>
                                <a href="/guardian-dashboard" onClick={(e) => { e.preventDefault(); navigate('/guardian-dashboard'); }}>Overview</a>
                                <a href="/guardian-attendance" onClick={(e) => { e.preventDefault(); navigate('/guardian-attendance'); }}>Attendance</a>
                                <a href="/guardian-messages" onClick={(e) => { e.preventDefault(); navigate('/guardian-messages'); }}>Messages</a>
                            </>
                        )}
                    </nav>

                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => navigate('/profile')} style={{ background: themeGradient }}>
                            {formData.fullName?.charAt(0) || userProfile.userName?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-sidebar">
                    <div className="profile-avatar-large" style={{ background: themeGradient }}>
                        {formData.fullName?.charAt(0) || userProfile.userName?.charAt(0) || 'U'}
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>{formData.fullName || userProfile.userName}</h2>
                    <p className="profile-role">{formData.role || userProfile.role}</p>

                    <div className="profile-menu">
                        <button
                            className={activeTab === "details" ? "active" : ""}
                            onClick={() => setActiveTab("details")}
                        >
                            Personal Details
                        </button>
                        {isLearner && (
                            <button
                                className={activeTab === "academic" ? "active" : ""}
                                onClick={() => setActiveTab("academic")}
                            >
                                Academic Info
                            </button>
                        )}
                        <button
                            className={activeTab === "settings" ? "active" : ""}
                            onClick={() => setActiveTab("settings")}
                        >
                            Account Settings
                        </button>

                        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                            <button
                                onClick={() => navigate(dashboardLink)}
                                style={{
                                    background: themeGradient,
                                    color: 'white',
                                    textAlign: 'center',
                                    fontWeight: '700',
                                    boxShadow: themeShadow
                                }}
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    marginTop: '0.5rem',
                                    color: '#ff4444',
                                    textAlign: 'center',
                                    fontWeight: '600',
                                    border: '1px solid #ff4444'
                                }}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-main" style={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
                    {message && <div className="success-message" style={{ borderRadius: '12px', textAlign: 'center' }}>{message}</div>}

                    {activeTab === "details" && (
                        <div className="profile-section">
                            <div className="section-header" style={{ borderBottom: '2px solid #f0f2f5', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a202c' }}>Personal Information</h3>
                                {!isEditing && (
                                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                )}
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled={true}
                                        style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', background: '#f7fafc' }}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        rows="4"
                                        style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', resize: 'none' }}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="save-btn" onClick={handleSave} style={{ background: themeGradient }}>Save Changes</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "academic" && (
                        <div className="profile-section">
                            <div className="section-header" style={{ borderBottom: '2px solid #f0f2f5', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a202c' }}>Academic & Institute Details</h3>
                                {!isEditing && (
                                    <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Preferences</button>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Institute Name</div>
                                    <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{formData.instituteName}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Student / Employee ID</div>
                                    <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{formData.studentId}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Branch / Department</div>
                                    <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{formData.branch}</div>
                                </div>
                            </div>

                            <div className="settings-group">
                                <h4 style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Course Preferences</h4>
                                <div className="form-group full-width">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Preferred Courses</label>
                                    <textarea
                                        name="preferredCourses"
                                        value={formData.preferredCourses}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        rows="2"
                                        style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', resize: 'none' }}
                                        placeholder="e.g. Java, Python, Networking"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="action-buttons" style={{ marginTop: '2rem' }}>
                                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className="save-btn" onClick={handleSave} style={{ background: themeGradient }}>Save Preferences</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="profile-section">
                            <div className="section-header" style={{ borderBottom: '2px solid #f0f2f5', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a202c' }}>Account Settings</h3>
                            </div>

                            <div className="settings-group" style={{ marginBottom: '3rem' }}>
                                <h4 style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Notifications</h4>
                                <div className="toggle-row" style={{ padding: '1.25rem 0' }}>
                                    <span style={{ fontWeight: '600', color: '#2d3748' }}>Email Notifications</span>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="toggle-row" style={{ padding: '1.25rem 0' }}>
                                    <span style={{ fontWeight: '600', color: '#2d3748' }}>Push Alerts</span>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="settings-group">
                                <h4 style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Security</h4>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="edit-btn" style={{ padding: '1rem 2rem' }}>Change Password</button>
                                    <button style={{
                                        background: 'rgba(255, 68, 68, 0.1)',
                                        color: '#ff4444',
                                        border: '1px solid #ff4444',
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseOver={(e) => e.target.style.background = '#ff4444' + '22'}
                                    >Deactivate Account</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
