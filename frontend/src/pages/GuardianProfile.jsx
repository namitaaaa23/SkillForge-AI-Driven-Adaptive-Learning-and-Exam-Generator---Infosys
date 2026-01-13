import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function GuardianProfile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Initialize state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        bio: user?.bio || "Parent/Guardian account.",
        role: "Guardian"
    });

    const themeGradient = 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    const themeShadow = '0 10px 40px rgba(106, 17, 203, 0.2)';

    const [activeTab, setActiveTab] = useState("details");
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const userProfile = user || { userName: "Guardian", email: "" };

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
                role: "Guardian",
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
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/guardian-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/guardian-dashboard" onClick={(e) => { e.preventDefault(); navigate('/guardian-dashboard'); }}>OVERVIEW</a>
                        <a href="/guardian-progress-portal" onClick={(e) => { e.preventDefault(); navigate('/guardian-progress-portal'); }}>PROGRESS</a>
                        <a href="/guardian-attendance" onClick={(e) => { e.preventDefault(); navigate('/guardian-attendance'); }}>ATTENDANCE</a>
                        <a href="/guardian-messages" onClick={(e) => { e.preventDefault(); navigate('/guardian-messages'); }}>MESSAGES</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>
                            {formData.fullName?.charAt(0) || 'G'}
                        </div>
                    </div>
                </div>
            </div>

            {showMenu && (
                <div className="ld-menu-panel">
                    <div className="ld-user-info"><h3>{userProfile.userName}</h3><p>{userProfile.email}</p></div>
                    <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <button className="ld-menu-item" onClick={() => setShowMenu(false)}>My Profile</button>
                    <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            )}

            <div className="profile-content" style={{ padding: '3rem 2rem' }}>
                <div className="profile-sidebar animate-up">
                    <div className="profile-avatar-large" style={{ background: themeGradient, border: 'none', boxShadow: themeShadow }}>
                        {formData.fullName?.charAt(0) || 'G'}
                    </div>
                    <h2 style={{ marginTop: '1.5rem', fontWeight: '800' }}>{formData.fullName || "Guardian"}</h2>
                    <p className="profile-role" style={{ color: '#6a11cb', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '2px' }}>VERIFIED GUARDIAN</p>

                    <div className="profile-menu" style={{ marginTop: '2.5rem' }}>
                        <button className={activeTab === "details" ? "active" : ""} onClick={() => setActiveTab("details")}>Personal Details</button>
                        <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>Security & Settings</button>

                        <div style={{ marginTop: '3rem' }}>
                            <button onClick={() => navigate('/guardian-dashboard')} className="primary-btn" style={{ width: '100%', marginBottom: '1rem' }}>Dashboard Overview</button>
                            <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '2px solid #ff4444', color: '#ff4444', height: '50px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>Sign Out</button>
                        </div>
                    </div>
                </div>

                <div className="profile-main animate-up" style={{ animationDelay: '0.1s', borderRadius: '30px', padding: '3rem' }}>
                    {message && <div style={{ background: '#f0fdf4', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontWeight: '700', textAlign: 'center' }}>{message}</div>}

                    {activeTab === "details" && (
                        <div className="profile-section">
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>Identity Details</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>FULL LEGAL NAME</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} style={{ borderRadius: '14px', border: '2px solid #f0f4f8' }} />
                                </div>
                                <div className="form-group">
                                    <label>SECURE EMAIL ADDRESS</label>
                                    <input type="email" name="email" value={formData.email} disabled={true} style={{ borderRadius: '14px', border: '2px solid #f0f4f8', background: '#f8fafc' }} />
                                </div>
                                <div className="form-group full-width">
                                    <label>PROFILE BIOGRAPHY</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!isEditing} rows="4" style={{ borderRadius: '14px', border: '2px solid #f0f4f8' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                {!isEditing ? (
                                    <button className="primary-btn" onClick={() => setIsEditing(true)}>Edit Profile Details</button>
                                ) : (
                                    <>
                                        <button className="primary-btn" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Profile Changes'}</button>
                                        <button onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#1a1a2e', border: 'none', padding: '0 2rem', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="profile-section">
                            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem' }}>System Settings</h3>
                            {/* Same settings logic but prettier */}
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Email Alerts</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Receive real-time progress updates via email</div>
                                    </div>
                                    <input type="checkbox" defaultChecked />
                                </div>
                                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '800' }}>Two-Factor Auth</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Enhance account security with SMS verification</div>
                                    </div>
                                    <button className="primary-btn" style={{ padding: '10px 20px', fontSize: '0.8rem' }}>ENABLE</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
