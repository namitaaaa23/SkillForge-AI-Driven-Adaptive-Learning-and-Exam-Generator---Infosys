import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminProfile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Initialize state
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        bio: user?.bio || "System Administrator",
        role: "Administrator"
    });

    const themeGradient = 'linear-gradient(135deg, #232526 0%, #414345 100%)';
    const themeShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';

    const [activeTab, setActiveTab] = useState("details");
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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
                role: "Administrator",
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
                    <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
                        <a href="/admin-courses" onClick={(e) => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
                        <a href="/admin-users" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
                        <a href="/admin-analytics" onClick={(e) => { e.preventDefault(); navigate('/admin-analytics'); }}>ANALYTICS</a>
                        <a href="/admin-course-requests" onClick={(e) => { e.preventDefault(); navigate('/admin-course-requests'); }}>REQUESTS</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" style={{ background: themeGradient }}>
                            {formData.fullName?.charAt(0) || 'A'}
                        </div>
                    </div>
                </div>
            </div>

            <main className="ld-main">
                {/* Hero Banner */}
                <div className="ld-hero-banner animate-up" style={{ marginBottom: '2.5rem' }}>
                    <div className="ld-hero-content" style={{ alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '30px',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                color: '#6a11cb',
                                fontWeight: '800',
                                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                                border: '4px solid rgba(255,255,255,0.2)'
                            }}>
                                {formData.fullName?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: '1.1' }}>
                                    {formData.fullName}
                                </h1>
                                <p style={{ fontSize: '1.2rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>ADMINISTRATOR</span>
                                    {formData.email}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="primary-btn" style={{ background: 'white', color: '#6a11cb' }} onClick={() => navigate('/admin-dashboard')}>
                                Back to Dashboard
                            </button>
                            <button className="primary-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={handleLogout}>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Sidebar Tabs */}
                    <div className="premium-card-v3 animate-up" style={{ padding: '1.5rem', height: 'fit-content' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                onClick={() => setActiveTab("details")}
                                style={{
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: activeTab === "details" ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : 'transparent',
                                    color: activeTab === "details" ? 'white' : '#718096',
                                    textAlign: 'left',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>👤</span> Personal Details
                            </button>
                            <button
                                onClick={() => setActiveTab("settings")}
                                style={{
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: activeTab === "settings" ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : 'transparent',
                                    color: activeTab === "settings" ? 'white' : '#718096',
                                    textAlign: 'left',
                                    fontWeight: '800',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>⚙️</span> Account Settings
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="premium-card-v3 animate-up" style={{ padding: '3.5rem' }}>
                        {message && (
                            <div style={{
                                background: message.includes('successfully') ? '#f0fff4' : '#fff5f5',
                                color: message.includes('successfully') ? '#2e7d32' : '#f5576c',
                                padding: '1.2rem',
                                borderRadius: '16px',
                                marginBottom: '2.5rem',
                                fontWeight: '700',
                                border: `1px solid ${message.includes('successfully') ? '#dcfce7' : '#feb2b2'}`
                            }}>
                                {message}
                            </div>
                        )}

                        {activeTab === "details" && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e' }}>Personal Information</h2>
                                    {!isEditing && (
                                        <button className="primary-btn" onClick={() => setIsEditing(true)} style={{ padding: '0.8rem 1.5rem' }}>
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>FULL NAME</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            style={{
                                                width: '100%',
                                                padding: '1.2rem',
                                                borderRadius: '14px',
                                                border: '2px solid #f0f4f8',
                                                background: isEditing ? 'white' : '#f8fafc',
                                                outline: 'none',
                                                fontWeight: '600',
                                                color: '#1a1a2e'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>EMAIL ADDRESS</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '1.2rem',
                                                borderRadius: '14px',
                                                border: '2px solid #f0f4f8',
                                                background: '#f8fafc',
                                                color: '#718096',
                                                fontWeight: '600'
                                            }}
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>PROFESSIONAL BIO</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows="4"
                                            style={{
                                                width: '100%',
                                                padding: '1.2rem',
                                                borderRadius: '14px',
                                                border: '2px solid #f0f4f8',
                                                background: isEditing ? 'white' : '#f8fafc',
                                                outline: 'none',
                                                fontWeight: '600',
                                                color: '#1a1a2e',
                                                resize: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                {isEditing && (
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                                        <button className="primary-btn" onClick={handleSave} style={{ flex: 1, padding: '1.2rem' }} disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '1.2rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '800', color: '#718096', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '3rem' }}>Account Settings</h2>

                                <div style={{ marginBottom: '4rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '1.5rem' }}>PREFERENCES</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#1a1a2e' }}>Email Notifications</div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Stay updated with course requests and system alerts.</div>
                                            </div>
                                            <input type="checkbox" defaultChecked style={{ width: '40px', height: '20px', cursor: 'pointer' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', color: '#1a1a2e' }}>Two-Factor Authentication</div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>Add an extra layer of security to your account.</div>
                                            </div>
                                            <input type="checkbox" style={{ width: '40px', height: '20px', cursor: 'pointer' }} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '1.5rem' }}>SECURITY</h4>
                                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                                        <button className="primary-btn" style={{ padding: '1rem 2rem' }}>
                                            Update Password
                                        </button>
                                        <button style={{ padding: '1rem 2rem', background: '#fff5f5', color: '#f5576c', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer' }}>
                                            Deactivate Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
