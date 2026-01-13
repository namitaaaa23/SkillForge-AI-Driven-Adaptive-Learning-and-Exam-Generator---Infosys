import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './LearnerDashboard.css';

const AdminLearningContentManager = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    contentType: 'PDF',
    contentUrl: '',
    filePath: '',
    sequenceOrder: 1,
    difficulty: 'Intermediate'
  });

  // Auth context or storage
  const adminId = localStorage.getItem('userId');
  const userProfile = { userName: "Admin", role: "Admin" };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (formData.courseId) {
      fetchContents();
    } else {
      setContents([]);
    }
  }, [formData.courseId]);

  const fetchCourses = async () => {
    try {
      const response = await api.getAllCoursesAdmin();
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await api.request(`/api/learning-content/course/${formData.courseId}/all`);
      if (response) {
        setContents(response);
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        createdBy: adminId,
        isPublished: false
      };

      await api.request('/api/learning-content', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        contentUrl: '',
        filePath: ''
      }));
      setShowForm(false);
      fetchContents();
      alert('Material created successfully!');
    } catch (error) {
      console.error('Error creating content:', error);
      alert('Error creating content');
    }
  };

  const publishContent = async (contentId) => {
    try {
      await api.request(`/api/learning-content/${contentId}/publish`, { method: 'POST' });
      fetchContents();
    } catch (error) {
      console.error('Error publishing content:', error);
    }
  };

  const deleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.request(`/api/learning-content/${contentId}`, { method: 'DELETE' });
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #ddd',
    marginBottom: '1.2rem',
    fontSize: '1rem'
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
            <div className="ld-avatar" onClick={() => navigate('/admin-profile')}>{userProfile.userName?.charAt(0)}</div>
          </div>
        </div>
      </div>

      <main className="ld-main">
        {/* Hero Banner */}
        <div className="ld-hero-banner animate-up" style={{ marginBottom: '2.5rem' }}>
          <div className="ld-hero-content">
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}>
                Content <span style={{ color: '#a18cd1' }}>Manager</span>
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Curate and organize premium learning materials for SkillForge courses.</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'left',
              minWidth: '320px'
            }}>
              <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.8rem', letterSpacing: '2px', fontWeight: '800' }}>SELECT ACTIVE COURSE</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="" style={{ color: '#1a1a2e' }}>-- Choose Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id} style={{ color: '#1a1a2e' }}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Controls Sidebar */}
          <div className="premium-card-v3 animate-up" style={{ padding: '2.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '1.5rem' }}>Management</h3>
            <p style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '2rem', lineHeight: '1.5' }}>
              Select a course to view, edit, or add new learning materials.
            </p>

            <button
              className="primary-btn"
              style={{
                width: '100%',
                padding: '1.2rem',
                opacity: formData.courseId ? 1 : 0.5,
                cursor: formData.courseId ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onClick={() => setShowForm(!showForm)}
              disabled={!formData.courseId}
            >
              {showForm ? 'Cancel Creation' : (
                <>
                  <span style={{ fontSize: '1.4rem' }}>+</span> Add New Material
                </>
              )}
            </button>
          </div>

          {/* Main Content List / Form */}
          <div className="premium-card-v3 animate-up" style={{ padding: '3.5rem' }}>
            {showForm ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '0.5rem' }}>New Learning Material</h2>
                  <p style={{ color: '#718096', fontSize: '1rem' }}>Define the properties of your new course content.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>MATERIAL TITLE *</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} style={{ ...inputStyle, background: '#f8fafc', border: '2px solid #f0f4f8', outline: 'none' }} required placeholder="e.g. Introduction to Neural Networks" />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>DESCRIPTION</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, height: '120px', resize: 'none', background: '#f8fafc', border: '2px solid #f0f4f8', outline: 'none' }} required placeholder="Describe what the students will learn..." />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>CONTENT TYPE</label>
                    <select name="contentType" value={formData.contentType} onChange={handleInputChange} style={{ ...inputStyle, background: '#f8fafc', border: '2px solid #f0f4f8', outline: 'none', appearance: 'none' }}>
                      <option value="PDF">PDF Document</option>
                      <option value="BLOG">Blog/Article</option>
                      <option value="YOUTUBE">YouTube Video</option>
                      <option value="TEXT">Interactive Text</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>SEQUENCE ORDER</label>
                    <input type="number" name="sequenceOrder" value={formData.sequenceOrder} onChange={handleInputChange} style={{ ...inputStyle, background: '#f8fafc', border: '2px solid #f0f4f8', outline: 'none' }} />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#718096', letterSpacing: '1px', marginBottom: '0.8rem' }}>CONTENT SOURCE URL</label>
                    <input name="contentUrl" value={formData.contentUrl} onChange={handleInputChange} style={{ ...inputStyle, background: '#f8fafc', border: '2px solid #f0f4f8', outline: 'none' }} placeholder="https://youtube.com/watch?v=... or link to document" />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                  <button type="submit" className="primary-btn" style={{ flex: 2, padding: '1.2rem' }}>Create Material</button>
                  <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '1.2rem', background: '#f8f9fa', border: 'none', borderRadius: '14px', fontWeight: '800', color: '#718096', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1a1a2e', marginBottom: '2.5rem' }}>Course Materials</h2>
                {!formData.courseId ? (
                  <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#a0aec0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>Select a course above to view its contents.</p>
                  </div>
                ) : loading ? (
                  <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#718096' }}>
                    <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                    Fetching materials...
                  </div>
                ) : contents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '6rem 2rem', color: '#a0aec0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📦</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No materials yet. Click "+ Add New Material" to start building your course.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {contents.map(content => (
                      <div key={content.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '2rem',
                        background: '#f8fafc',
                        borderRadius: '20px',
                        border: '1px solid #edf2f7',
                        transition: 'transform 0.2s'
                      }} className="content-item-hover">
                        <div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              color: '#6a11cb',
                              background: 'rgba(106, 17, 203, 0.1)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              letterSpacing: '1px'
                            }}>{content.contentType}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#718096' }}>ORDER {content.sequenceOrder}</span>
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '1.3rem', color: '#1a1a2e' }}>{content.title}</div>
                          <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.5rem', margin: 0 }}>{content.description?.substring(0, 100)}...</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {!content.isPublished && (
                            <button onClick={() => publishContent(content.id)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', background: '#43e97b', color: 'white', fontWeight: '800', cursor: 'pointer', boxShadow: '0 5px 15px rgba(67, 233, 123, 0.2)' }}>Publish</button>
                          )}
                          <button onClick={() => deleteContent(content.id)} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', background: '#fff', color: '#f5576c', fontWeight: '800', cursor: 'pointer', border: '1px solid #ffeded' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLearningContentManager;
