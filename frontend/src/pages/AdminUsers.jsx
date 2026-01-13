import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminUsers() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [sortBy, setSortBy] = useState("name");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [linkType, setLinkType] = useState("admin");
    const [selectedLinkUser, setSelectedLinkUser] = useState(null);
    const [showAssignCourseModal, setShowAssignCourseModal] = useState(false);
    const [assigningUser, setAssigningUser] = useState(null);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "STUDENT"
    });

    const [bulkUsers, setBulkUsers] = useState("");

    const userProfile = user || {};

    const glassModalStyle = {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '2.5rem',
        width: '500px',
        maxWidth: '90%'
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
    }, [authLoading, user, navigate]);

    useEffect(() => {
        if (user) {
            loadUsers();
        }
    }, [user]);

    // PREVENT WHITE SCREEN: Don't render dashboard until auth is resolved
    if (authLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    if (!user) return null; // Will redirect via useEffect

    useEffect(() => {
        filterAndSortUsers();
    }, [users, searchTerm, filterRole, sortBy]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllUsers();
            if (response.success) {
                setUsers(response.data || []);
            }
        } catch (err) {
            console.error(err);
            if (err.message.includes('401') || err.message.includes('403')) {
                // logout(); // Prevent auto-logout loop
            }
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortUsers = () => {
        let filtered = users.filter(u => {
            const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = filterRole === "ALL" || u.role === filterRole;
            return matchesSearch && matchesRole;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return (a.fullName || "").localeCompare(b.fullName || "");
                case "email":
                    return (a.email || "").localeCompare(b.email || "");
                case "role":
                    return (a.role || "").localeCompare(b.role || "");
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        setFilteredUsers(filtered);
    };

    const validateUser = () => {
        const newErrors = {};
        if (!newUser.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!newUser.email.trim()) newErrors.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) newErrors.email = "Invalid email format";
        if (newUser.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInviteUser = async () => {
        if (!validateUser()) return;

        try {
            const payload = {
                ...newUser,
                username: newUser.email.split('@')[0],
                fullName: newUser.fullName
            };

            const response = await api.createUser(payload);

            if (response && response.success) {
                setSuccessMessage("User created successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
                setShowInviteModal(false);
                setNewUser({ fullName: "", email: "", password: "", role: "STUDENT" });
                loadUsers();
            } else {
                setErrors({ submit: response?.message || "Failed to create user. Check server logs." });
            }
        } catch (error) {
            console.error("Create User Error:", error);
            setErrors({ submit: error.message || "Network error or server unreachable." });
        }
    };

    const handleBulkInvite = async () => {
        const lines = bulkUsers.trim().split("\n").filter(line => line.trim());
        if (lines.length === 0) {
            setErrors({ bulk: "Please enter at least one user" });
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const line of lines) {
            const parts = line.split(",").map(s => s.trim());
            if (parts.length < 2) continue;

            const [fullName, email, role] = parts;
            if (!fullName || !email) continue;

            try {
                const payload = {
                    fullName,
                    email,
                    username: email.split('@')[0],
                    password: Math.random().toString(36).slice(-8),
                    role: role ? role.toUpperCase() : "STUDENT"
                };

                const response = await api.createUser(payload);
                if (response && response.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Failed to create user ${email}:`, error);
                failCount++;
            }
        }

        if (successCount > 0) {
            setSuccessMessage(`${successCount} users created successfully! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowBulkModal(false);
            setBulkUsers("");
            loadUsers();
        } else {
            setErrors({ bulk: `Failed to create users. ${failCount} errors occurred.` });
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure? This action cannot be undone.")) return;
        try {
            const response = await api.deleteUser(id);
            if (response.success) {
                setSuccessMessage("User deleted successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
                loadUsers();
            }
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const endpoint = currentStatus ? `/users/${id}/deactivate` : `/users/${id}/activate`;
            const response = await api.request(endpoint, { method: 'POST' });
            if (response.success) {
                setSuccessMessage(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
                setTimeout(() => setSuccessMessage(""), 3000);
                loadUsers();
            }
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };

    const handleChangeRole = async (id, newRole) => {
        try {
            const response = await api.request(`/users/${id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole })
            });
            if (response.success) {
                setSuccessMessage("User role updated successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
                loadUsers();
            }
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };

    const handleLink = async () => {
        if (!selectedLinkUser) {
            setErrors({ link: "Please select a user to link" });
            return;
        }

        try {
            if (linkType === "admin") {
                // FIXED: Use correct endpoint structure /linking/admin/{adminId}/learner/{learnerId}
                await api.request(`/linking/admin/${selectedLinkUser.id}/learner/${selectedUser.id}`, {
                    method: 'POST'
                });
            } else {
                // FIXED: Use correct endpoint structure /linking/guardian/{guardianId}/ward/{wardId}
                await api.request(`/linking/guardian/${selectedLinkUser.id}/ward/${selectedUser.id}`, {
                    method: 'POST'
                });
            }
            setSuccessMessage("Link created successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowLinkModal(false);
            loadUsers();
        } catch (error) {
            setErrors({ link: error.message });
        }
    };

    const handleOpenAssignModal = async (user) => {
        setAssigningUser(user);
        setShowAssignCourseModal(true);
        setSelectedCourses([]);

        // Load available courses
        try {
            const response = await api.getAllCoursesAdmin();
            if (response.success) {
                setAvailableCourses(response.data || []);
            }
        } catch (error) {
            console.error("Failed to load courses:", error);
        }
    };

    const handleAssignCourses = async () => {
        if (!assigningUser || selectedCourses.length === 0) {
            setErrors({ assign: "Please select at least one course" });
            return;
        }

        try {
            // Enroll user in selected courses
            for (const courseId of selectedCourses) {
                await api.enrollInCourse(courseId);
            }

            setSuccessMessage(`Successfully assigned ${selectedCourses.length} course(s) to ${assigningUser.fullName}!`);
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowAssignCourseModal(false);
            setSelectedCourses([]);
            setAssigningUser(null);
        } catch (error) {
            setErrors({ assign: error.message || "Failed to assign courses" });
        }
    };

    const toggleCourseSelection = (courseId) => {
        setSelectedCourses(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const getRoleColor = (role) => {
        const colors = {
            STUDENT: "#e3f2fd",
            ADMIN: "#fce4ec",
            GUARDIAN: "#e8f5e9"
        };
        return colors[role] || "#f5f5f5";
    };

    const getRoleTextColor = (role) => {
        const colors = {
            STUDENT: "#1976d2",
            ADMIN: "#c2185b",
            GUARDIAN: "#388e3c"
        };
        return colors[role] || "#333";
    };

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
                        <a href="/admin-courses" onClick={(e) => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
                        <a href="/admin-users" className="active" onClick={(e) => e.preventDefault()}>USERS</a>
                        <a href="/admin-analytics" onClick={(e) => { e.preventDefault(); navigate('/admin-analytics'); }}>ANALYTICS</a>
                        <a href="/admin-course-requests" onClick={(e) => { e.preventDefault(); navigate('/admin-course-requests'); }}>REQUESTS</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>{userProfile.userName?.charAt(0)}</div>
                    </div>
                </div>
            </div>

            {showMenu && (
                <div className="ld-menu-panel">
                    <div className="ld-user-info"><h3>{userProfile.userName}</h3><p>{userProfile.email}</p></div>
                    <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <button className="ld-menu-item" onClick={() => navigate('/admin-profile')}>Profile Settings</button>
                    <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            )}

            <main className="ld-main">
                {/* Hero Banner */}
                <div className="ld-hero-banner animate-up" style={{ marginBottom: '2rem' }}>
                    <div className="ld-hero-content">
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                                User <span style={{ color: '#a18cd1' }}>Management</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Manage student access, roles, and platform permissions.</p>

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                                <button className="primary-btn" style={{ background: 'white', color: '#6a11cb' }} onClick={() => setShowInviteModal(true)}>
                                    + Add New User
                                </button>
                                <button className="primary-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setShowBulkModal(true)}>
                                    Bulk Import
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{users.length}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '1px' }}>TOTAL USERS</span>
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
                            minWidth: '250px'
                        }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', letterSpacing: '2px' }}>QUICK FILTERS</div>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                            >
                                <option value="ALL">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="ADMIN">Admins</option>
                                <option value="GUARDIAN">Guardians</option>
                            </select>
                        </div>
                    </div>
                </div>

                {successMessage && (
                    <div className="animate-up" style={{ background: '#f0fff4', color: '#2e7d32', padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #dcfce7', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>✓</span> {successMessage}
                    </div>
                )}

                <div className="premium-card-v3 animate-up" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1a1a2e' }}>USER REPOSITORY</h3>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '300px', outline: 'none', fontSize: '0.9rem' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#718096' }}>
                            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                            Loading system users...
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fff', borderBottom: '2px solid #f0f0f0' }}>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>USER</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>EMAIL</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>ROLE</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'left', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>STATUS</th>
                                        <th style={{ padding: '1.2rem 2rem', textAlign: 'right', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #f8f8f8', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '1.2rem 2rem', fontWeight: '700', color: '#1a1a2e' }}>{u.fullName || u.username}</td>
                                            <td style={{ padding: '1.2rem 2rem', color: '#718096', fontSize: '0.9rem' }}>{u.email}</td>
                                            <td style={{ padding: '1.2rem 2rem' }}>
                                                <select value={u.role} onChange={e => handleChangeRole(u.id, e.target.value)} style={{ padding: '6px 14px', background: getRoleColor(u.role), color: getRoleTextColor(u.role), border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                                    <option value="STUDENT">STUDENT</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="GUARDIAN">GUARDIAN</option>
                                                </select>
                                            </td>
                                            <td style={{ padding: '1.2rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.active ? '#43e97b' : '#f5576c' }}></div>
                                                    <span style={{ color: u.active ? '#43e97b' : '#f5576c', fontWeight: '800', fontSize: '0.75rem' }}>
                                                        {u.active ? 'ACTIVE' : 'INACTIVE'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => { setSelectedUser(u); setShowDetailModal(true); }} style={{ background: '#f8f9fa', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#1a1a2e', fontWeight: '700', fontSize: '0.75rem' }}>View</button>
                                                    <button onClick={() => { setSelectedUser(u); setShowLinkModal(true); }} style={{ background: '#f0f4ff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#6a11cb', fontWeight: '700', fontSize: '0.75rem' }}>Link</button>
                                                    {u.role === 'STUDENT' && (
                                                        <button onClick={() => handleOpenAssignModal(u)} style={{ background: '#f0fdf4', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#2e7d32', fontWeight: '700', fontSize: '0.75rem' }}>Assign</button>
                                                    )}
                                                    <button onClick={() => handleToggleActive(u.id, u.active)} style={{ background: u.active ? '#fff5f5' : '#f0fff4', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: u.active ? '#f5576c' : '#2e7d32', fontWeight: '700', fontSize: '0.75rem' }}>
                                                        {u.active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && <div style={{ color: '#718096', padding: '4rem', textAlign: 'center', fontSize: '0.9rem' }}>No users found matching your search.</div>}
                        </div>
                    )}
                </div>
            </main>

            {/* Modals - Refined Styling */}
            {showInviteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '500px', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Add System User</h2>
                        {errors.submit && <div style={{ background: '#fff5f5', color: '#f5576c', padding: '12px', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '600', fontSize: '0.9rem' }}>{errors.submit}</div>}

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>FULL NAME</label>
                            <input type="text" placeholder="John Doe" style={{ width: '100%', padding: '12px', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none' }} value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>EMAIL ADDRESS</label>
                            <input type="email" placeholder="john@skillforge.com" style={{ width: '100%', padding: '12px', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none' }} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>INITIAL PASSWORD</label>
                            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '12px', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none' }} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>SYSTEM ROLE</label>
                            <select style={{ width: '100%', padding: '12px', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none', background: 'white' }} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="STUDENT">Student</option>
                                <option value="ADMIN">Admin</option>
                                <option value="GUARDIAN">Guardian</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleInviteUser} className="primary-btn" style={{ flex: 1.5 }}>Create Account</button>
                        </div>
                    </div>
                </div>
            )}

            {/* More modals would follow the same pattern... */}
            {showBulkModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '600px', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1rem' }}>Bulk Import Users</h2>
                        <p style={{ color: '#718096', marginBottom: '2rem' }}>Enter email addresses or full records (Name, Email, Role) separated by lines.</p>

                        <textarea
                            style={{ width: '100%', height: '200px', padding: '1.2rem', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none', background: '#f8fafc', marginBottom: '2rem', resize: 'none' }}
                            placeholder="john@example.com&#10;Jane Smith, jane@example.com, STUDENT"
                            value={bulkUsers}
                            onChange={e => setBulkUsers(e.target.value)}
                        />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleBulkInvite} className="primary-btn" style={{ flex: 2 }}>Execute Import</button>
                        </div>
                    </div>
                </div>
            )}

            {showLinkModal && selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '500px', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '1.5rem' }}>Link Relationship</h2>
                        <p style={{ color: '#718096', marginBottom: '2rem' }}>Establish a connection for <strong>{selectedUser.fullName}</strong>.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>RELATIONSHIP TYPE</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => setLinkType("admin")}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: linkType === 'admin' ? '#6a11cb' : '#f0f4f8', color: linkType === 'admin' ? 'white' : '#718096', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    Admin Link
                                </button>
                                <button
                                    onClick={() => setLinkType("guardian")}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: linkType === 'guardian' ? '#6a11cb' : '#f0f4f8', color: linkType === 'guardian' ? 'white' : '#718096', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    Guardian Link
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: '#718096', fontSize: '0.75rem', letterSpacing: '1px' }}>SELECT TARGET {linkType.toUpperCase()}</label>
                            <select
                                style={{ width: '100%', padding: '12px', border: '2px solid #f0f4f8', borderRadius: '14px', outline: 'none', background: 'white' }}
                                onChange={(e) => setSelectedLinkUser(users.find(u => u.id === e.target.value))}
                                value={selectedLinkUser?.id || ""}
                            >
                                <option value="">Select a user...</option>
                                {users.filter(u => u.role === (linkType === 'admin' ? 'ADMIN' : 'GUARDIAN')).map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        {errors.link && <div style={{ color: '#f5576c', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '700' }}>{errors.link}</div>}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setShowLinkModal(false); setErrors({}); }} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleLink} className="primary-btn" style={{ flex: 1.5 }}>Establish Link</button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailModal && selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '500px', padding: '3.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '35px', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: '800', boxShadow: '0 15px 35px rgba(106, 17, 203, 0.3)' }}>
                                {selectedUser.fullName?.charAt(0)}
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{selectedUser.fullName}</h2>
                            <p style={{ color: '#718096', fontWeight: '600' }}>{selectedUser.email}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '1px', marginBottom: '5px' }}>ROLE</div>
                                <div style={{ fontWeight: '800', color: '#1a1a2e' }}>{selectedUser.role}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '1px', marginBottom: '5px' }}>STATUS</div>
                                <div style={{ fontWeight: '800', color: selectedUser.active ? '#38a169' : '#f5576c' }}>{selectedUser.active ? 'ACTIVE' : 'INACTIVE'}</div>
                            </div>
                        </div>

                        <button onClick={() => setShowDetailModal(false)} className="primary-btn" style={{ width: '100%' }}>Close Profile</button>
                    </div>
                </div>
            )}

            {showAssignCourseModal && assigningUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="premium-card-v3" style={{ width: '700px', padding: '3.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Assign Local Courses</h2>
                        <p style={{ color: '#718096', marginBottom: '2.5rem' }}>Choose specialized paths for <strong>{assigningUser.fullName}</strong>.</p>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
                            {availableCourses.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => toggleCourseSelection(course.id)}
                                    style={{
                                        padding: '1.2rem',
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        borderColor: selectedCourses.includes(course.id) ? '#6a11cb' : '#f0f4f8',
                                        background: selectedCourses.includes(course.id) ? 'rgba(106, 17, 203, 0.05)' : 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '800', color: '#1a1a2e' }}>{course.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>{course.difficultyLevel} • {course.estimatedHours}h</div>
                                    </div>
                                    {selectedCourses.includes(course.id) && <div style={{ color: '#6a11cb', fontWeight: '900' }}>✓</div>}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowAssignCourseModal(false)} style={{ flex: 1, padding: '1rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleAssignCourses} className="primary-btn" style={{ flex: 2 }} disabled={selectedCourses.length === 0}>Deploy Assignments</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
