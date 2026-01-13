import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function LearnerProfile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Initialize state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        bio: user?.bio || "Passionate learner exploring AI and technology.",
        role: "Student",
        instituteName: "SkillForge Institute of Technology",
        studentId: "SF-2025-BATCH-A",
        branch: "Computer Science & Engineering",
        preferredCourses: "Artificial Intelligence, Data Science, Web Development"
    });

    const themeGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const themeShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';

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
            const updates = { fullName: formData.fullName, bio: formData.bio };
            const response = await api.updateUser(user.id, updates);
            if (response.success) {
                setMessage("Profile updated successfully!");
                setIsEditing(false);
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

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar" style={{
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div className="header-container" style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '1rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="ld-logo" onClick={() => navigate('/learner-dashboard')} style={{
                        cursor: 'pointer',
                        fontSize: '1.6rem',
                        letterSpacing: '-0.5px',
                        fontWeight: '800',
                        background: 'linear-gradient(90deg, #fff, #a18cd1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        SkillForge AI
                    </div>
                    <nav className="nav-links" style={{ marginLeft: '4rem', display: 'flex', gap: '2.5rem' }}>
                        <a href="/learner-dashboard" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/learner-dashboard'); }}>DASHBOARD</a>
                        <a href="/learner-content" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/learner-content'); }}>COURSES</a>
                        <a href="/learner-progress" style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/learner-progress'); }}>PROGRESS</a>
                    </nav>
                    <div className="ld-topbar-right" style={{ marginLeft: 'auto' }}>
                        <div className="ld-avatar" style={{
                            width: '42px',
                            height: '42px',
                            background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }} onClick={() => setShowMenu(!showMenu)}>
                            {formData.fullName?.charAt(0) || 'L'}
                        </div>
                    </div>
                </div>
            </div>

            {showMenu && (
                <div className="ld-menu-panel" style={{
                    position: 'absolute',
                    top: '80px',
                    right: '2rem',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    minWidth: '240px'
                }}>
                    <div className="ld-user-info">
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{formData.fullName}</h3>
                        <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '0.9rem' }}>{formData.email}</p>
                    </div>
                    <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #f0f0f0' }} />
                    <button className="ld-menu-item" style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }} onClick={() => navigate('/profile')}>Edit Profile</button>
                    <button className="ld-menu-item" style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px' }} onClick={() => navigate('/profile')}>Settings</button>
                    <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #f0f0f0' }} />
                    <button className="ld-logout" style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: '#e53e3e', fontWeight: '600' }} onClick={handleLogout}>Sign Out</button>
                </div>
            )}

            <div className="profile-content" style={{ padding: '4rem 2rem', maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '3rem', animation: 'fadeInUp 0.8s ease' }}>
                <div className="profile-sidebar" style={{
                    flex: '0 0 320px',
                    background: 'white',
                    padding: '3rem 2rem',
                    borderRadius: '32px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f4f8',
                    height: 'fit-content',
                    position: 'sticky',
                    top: '120px'
                }}>
                    <div className="profile-avatar-large" style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                        borderRadius: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '3rem',
                        color: 'white',
                        fontWeight: '900',
                        margin: '0 auto 2rem',
                        boxShadow: '0 20px 40px rgba(106, 17, 203, 0.2)'
                    }}>
                        {formData.fullName?.charAt(0) || 'L'}
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '0.25rem', letterSpacing: '-0.5px' }}>{formData.fullName || "Learner"}</h2>
                        <p style={{ color: '#718096', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Student</p>
                    </div>

                    <div className="profile-menu" style={{ display: 'grid', gap: '0.5rem' }}>
                        <button style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: activeTab === "details" ? '#f0f4ff' : 'transparent',
                            color: activeTab === "details" ? '#6a11cb' : '#718096',
                            fontWeight: '800',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }} onClick={() => setActiveTab("details")}>Personal Details</button>
                        <button style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: activeTab === "academic" ? '#f0f4ff' : 'transparent',
                            color: activeTab === "academic" ? '#6a11cb' : '#718096',
                            fontWeight: '800',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }} onClick={() => setActiveTab("academic")}>Academic Info</button>
                        <button style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '16px',
                            border: 'none',
                            background: activeTab === "settings" ? '#f0f4ff' : 'transparent',
                            color: activeTab === "settings" ? '#6a11cb' : '#718096',
                            fontWeight: '800',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }} onClick={() => setActiveTab("settings")}>Account Settings</button>
                    </div>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f0f4f8' }}>
                        <button onClick={() => navigate('/learner-dashboard')} className="primary-btn" style={{ width: '100%', marginBottom: '1rem' }}>Back to Dashboard</button>
                        <button onClick={handleLogout} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '2px solid #fee2e2', color: '#ef4444', fontWeight: '800', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
                    </div>
                </div>

                <div className="profile-main" style={{
                    flex: 1,
                    background: 'white',
                    borderRadius: '40px',
                    padding: '4rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
                    border: '1px solid #f0f4f8'
                }}>
                    {message && <div style={{
                        padding: '1rem 2rem',
                        background: '#f0fff4',
                        color: '#38a169',
                        borderRadius: '16px',
                        fontWeight: '700',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        border: '1px solid #c6f6d5'
                    }}>{message}</div>}

                    {activeTab === "details" && (
                        <div className="profile-section">
                            <div className="section-header" style={{ borderBottom: '2px solid #f0f2f5', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a202c' }}>Personal Information</h3>
                                {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>}
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Email Address</label>
                                    <input type="email" name="email" value={formData.email} disabled={true} style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', background: '#f7fafc' }} />
                                </div>
                                <div className="form-group full-width">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Bio</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows="4" style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', resize: 'none' }} />
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
                                {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Preferences</button>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Institute Name</div>
                                    <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{formData.instituteName}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Student ID</div>
                                    <div style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '800' }}>{formData.studentId}</div>
                                </div>
                            </div>
                            <div className="settings-group">
                                <h4 style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Course Preferences</h4>
                                <div className="form-group full-width">
                                    <label style={{ color: '#718096', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Preferred Courses</label>
                                    <textarea name="preferredCourses" value={formData.preferredCourses} onChange={handleInputChange} disabled={!isEditing} rows="2" style={{ border: '2px solid #edf2f7', borderRadius: '12px', padding: '1rem', resize: 'none' }} />
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
                                <div className="toggle-row" style={{ padding: '1.25rem 0' }}><span style={{ fontWeight: '600', color: '#2d3748' }}>Email Notifications</span><label className="switch"><input type="checkbox" defaultChecked /><span className="slider round"></span></label></div>
                                <div className="toggle-row" style={{ padding: '1.25rem 0' }}><span style={{ fontWeight: '600', color: '#2d3748' }}>Push Alerts</span><label className="switch"><input type="checkbox" /><span className="slider round"></span></label></div>
                            </div>
                            <div className="settings-group">
                                <h4 style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700' }}>Security</h4>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="edit-btn" style={{ padding: '1rem 2rem' }}>Change Password</button>
                                    <button style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: '1px solid #ff4444', padding: '1rem 2rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Deactivate Account</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
