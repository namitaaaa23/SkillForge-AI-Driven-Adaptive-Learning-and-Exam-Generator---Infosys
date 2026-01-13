import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./LearnerDashboard.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function AdminMessages() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [conversations, setConversations] = useState([]);

    const userProfile = location.state?.userProfile || user || { userName: "Admin", role: "ADMIN" };

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await api.getAdminConversations(userProfile.id);

            if (data && Array.isArray(data) && data.length > 0) {
                setConversations(data.map(c => ({
                    id: c.id,
                    name: c.guardianName || "Guardian",
                    role: "Guardian of " + (c.studentName || "Student"),
                    lastMessage: c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].content : "No messages",
                    timestamp: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : "New",
                    unread: 0,
                    messages: (c.messages || []).map((m, idx) => ({
                        id: idx,
                        sender: m.senderRole === 'ADMIN' ? "You" : (c.guardianName || "Guardian"),
                        text: m.content,
                        timestamp: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : "",
                        isOwn: m.senderRole === 'ADMIN'
                    }))
                })));
                setSelectedConversation(0);
            } else {
                // Mock data if no real conversations
                setConversations([
                    {
                        id: "mock-1",
                        name: "Michael Johnson",
                        role: "Guardian of Alex Johnson",
                        lastMessage: "I had a question about the latest calculus scores.",
                        timestamp: "2 hours ago",
                        unread: 1,
                        messages: [
                            { id: 1, sender: "Michael Johnson", text: "Hello, I had a question about the latest calculus scores.", timestamp: "10:30 AM", isOwn: false },
                            { id: 2, sender: "You", text: "Hello Michael, I'd be happy to discuss Alex's performance.", timestamp: "10:45 AM", isOwn: true }
                        ]
                    }
                ]);
                setSelectedConversation(0);
            }
        } catch (error) {
            console.error('Failed to load admin messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || selectedConversation === null) return;

        const currentConv = conversations[selectedConversation];

        try {
            if (currentConv.id && !currentConv.id.startsWith('mock')) {
                await api.sendCommunicationMessage(currentConv.id, userProfile.id, 'ADMIN', messageText);
            }

            // Optimistic Update
            const updated = [...conversations];
            updated[selectedConversation].messages.push({
                id: Date.now(),
                sender: "You",
                text: messageText,
                timestamp: "Just Now",
                isOwn: true
            });
            updated[selectedConversation].lastMessage = messageText;
            setConversations(updated);
            setMessageText("");
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send message");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    <p>Loading Admin Communications...</p>
                </div>
            </div>
        );
    }

    const currentConversation = conversations[selectedConversation];

    return (
        <div className="ld-wrapper">
            <div className="ld-topbar">
                <div className="header-container">
                    <div className="ld-logo" onClick={() => navigate('/admin-dashboard')}>SkillForge AI</div>
                    <nav className="nav-links">
                        <a href="/admin-dashboard" onClick={(e) => { e.preventDefault(); navigate('/admin-dashboard'); }}>DASHBOARD</a>
                        <a href="/admin-courses" onClick={(e) => { e.preventDefault(); navigate('/admin-courses'); }}>COURSES</a>
                        <a href="/admin-users" onClick={(e) => { e.preventDefault(); navigate('/admin-users'); }}>USERS</a>
                        <a href="/admin-messages" className="active" onClick={(e) => e.preventDefault()}>MESSAGES</a>
                    </nav>
                    <div className="ld-topbar-right">
                        <div className="ld-avatar" onClick={() => setShowMenu(!showMenu)}>{userProfile.userName?.charAt(0) || 'A'}</div>
                    </div>
                </div>
            </div>

            {showMenu && (
                <div className="ld-menu-panel">
                    <div className="ld-user-info"><h3>{userProfile.userName}</h3><p>{userProfile.email}</p></div>
                    <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <button className="ld-menu-item" onClick={() => navigate('/admin-profile')}>My Profile</button>
                    <button className="ld-logout" onClick={handleLogout}>Sign Out</button>
                </div>
            )}

            <main className="ld-main">
                <div className="ld-hero-banner animate-up" style={{ marginBottom: '2rem' }}>
                    <div className="ld-hero-content">
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                                Admin <span style={{ color: '#a18cd1' }}>Messages</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Manage guardian communications and support inquiries.</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: 'calc(100vh - 450px)', minHeight: '600px' }}>
                    {/* Conversation List */}
                    <div className="premium-card-v3 animate-up" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Inboxes</h3>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {conversations.map((conv, idx) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(idx)}
                                    style={{
                                        padding: '1.5rem',
                                        borderBottom: '1px solid #f8f8f8',
                                        cursor: 'pointer',
                                        background: selectedConversation === idx ? '#f0f4ff' : 'white',
                                        borderLeft: selectedConversation === idx ? '5px solid #6a11cb' : '5px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: '800', fontSize: '1rem' }}>{conv.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{conv.timestamp}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#6a11cb', fontWeight: '700', marginBottom: '8px' }}>{conv.role}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="premium-card-v3 animate-up" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', animationDelay: '0.2s' }}>
                        {currentConversation ? (
                            <>
                                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '45px', height: '45px', borderRadius: '15px', background: 'linear-gradient(135deg, #6a11cb, #2575fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800' }}>
                                        {currentConversation.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>{currentConversation.name}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#718096' }}>{currentConversation.role}</p>
                                    </div>
                                </div>

                                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fdfdfd' }}>
                                    {currentConversation.messages.map((m, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                                            <div style={{
                                                maxWidth: '70%',
                                                padding: '1.2rem 1.5rem',
                                                borderRadius: m.isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                                background: m.isOwn ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : 'white',
                                                color: m.isOwn ? 'white' : '#1a1a2e',
                                                boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                                                border: m.isOwn ? 'none' : '1px solid #f0f0f0'
                                            }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{m.text}</p>
                                                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.7, textAlign: m.isOwn ? 'right' : 'left' }}>{m.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '1rem', background: '#fff' }}>
                                    <input
                                        type="text"
                                        placeholder="Provide professional response..."
                                        value={messageText}
                                        onChange={e => setMessageText(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                                        style={{ flex: 1, padding: '15px 25px', borderRadius: '15px', border: '2px solid #f0f4f8', outline: 'none', fontSize: '0.95rem' }}
                                    />
                                    <button onClick={handleSendMessage} className="primary-btn" style={{ padding: '0 2rem' }}>Send Response</button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📫</div>
                                <p>Select a guardian message to begin professional correspondence.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
