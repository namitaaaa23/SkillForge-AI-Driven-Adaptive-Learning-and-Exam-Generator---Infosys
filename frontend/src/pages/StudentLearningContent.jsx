import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import './StudentLearningContent.css';

const StudentLearningContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedChapterForGeneration, setSelectedChapterForGeneration] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Fallback values if not in localStorage
  const studentId = localStorage.getItem('userId');
  const courseId = localStorage.getItem('currentCourseId');
  const userProfile = location.state?.userProfile || { userName: "Student", role: "Student" };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchLearningContent();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.getCourseById(courseId);
      if (response.success) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const fetchLearningContent = async () => {
    setLoading(true);
    try {
      // Using the endpoint from previous version but through api.request for consistency
      const response = await api.request(`/api/learning-content/course/${courseId}`);
      if (response) {
        setContents(response.sort((a, b) => a.sequenceOrder - b.sequenceOrder));
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (content) => {
    setSelectedContent(content);
    markContentAsAccessed(content.id);
  };

  const markContentAsAccessed = async (contentId) => {
    try {
      await api.request(`/api/student-progress/update-lesson?studentId=${studentId}&courseId=${courseId}&lessonId=${contentId}&score=0`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error marking content as accessed:', error);
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedFormat) {
      alert('Please select a content format');
      return;
    }

    setGeneratingContent(true);
    try {
      // Call AI content generation API
      const response = await api.request('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          courseName: course?.title || 'Course',
          topic: selectedChapterForGeneration,
          contentType: selectedFormat,
          studentId: studentId
        })
      });

      if (response) {
        setGenerationSuccess(true);
        setTimeout(() => {
          setShowGenerateModal(false);
          setGenerationSuccess(false);
          setSelectedFormat('');
          setSelectedChapterForGeneration(null);
          // Refresh learning content to show newly generated content
          fetchLearningContent();
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGeneratingContent(false);
    }
  };


  const renderContentPreview = () => {
    if (!selectedContent) return null;

    const contentStyle = {
      background: 'white',
      padding: '2.5rem',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
      border: '1px solid #f0f0f0'
    };

    switch (selectedContent.contentType) {
      case 'PDF':
        return (
          <div style={contentStyle}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>{selectedContent.title}</h3>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>{selectedContent.description}</p>
            <a href={selectedContent.contentUrl} target="_blank" rel="noopener noreferrer" className="btn-download" style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              display: 'inline-block'
            }}>
              Download PDF Study Material
            </a>
          </div>
        );
      case 'YOUTUBE':
      case 'VIDEO':
        return (
          <div style={contentStyle}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>{selectedContent.title}</h3>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>{selectedContent.description}</p>
            <iframe
              width="100%"
              height="500"
              src={selectedContent.contentUrl?.replace("watch?v=", "embed/")}
              title={selectedContent.title}
              frameBorder="0"
              allowFullScreen
              style={{ borderRadius: '16px' }}
            ></iframe>
          </div>
        );
      case 'BLOG':
      case 'TEXT':
        return (
          <div style={contentStyle}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: '700' }}>{selectedContent.title}</h3>
            <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '16px', color: '#333', lineHeight: '1.8', fontStyle: 'Inter' }}>
              {selectedContent.textContent || selectedContent.description}
            </div>
            {selectedContent.contentUrl && (
              <a href={selectedContent.contentUrl} target="_blank" rel="noopener noreferrer" className="btn-read" style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '700',
                display: 'inline-block'
              }}>
                Read Full Article
              </a>
            )}
          </div>
        );
      default:
        return <p>Unsupported content type</p>;
    }
  };

  const groupedContents = contents.reduce((acc, content) => {
    const title = content.title || 'General Resources';
    if (!acc[title]) acc[title] = [];
    acc[title].push(content);
    return acc;
  }, {});

  const [selectedChapter, setSelectedChapter] = useState(null);

  return (
    <div className="ld-wrapper" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <div className="ld-topbar">
        <div className="header-container">
          <div className="ld-logo" onClick={() => navigate('/learner-dashboard')} style={{ cursor: 'pointer' }}>SkillForge AI</div>
          <nav className="nav-links">
            <a href="/learner-dashboard" onClick={(e) => { e.preventDefault(); navigate('/learner-dashboard'); }}>Dashboard</a>
            <a href="/learner-content" className="active" onClick={(e) => { e.preventDefault(); navigate('/learner-content'); }}>Courses</a>
            <a href="/learner-progress" onClick={(e) => { e.preventDefault(); navigate('/learner-progress'); }}>Progress</a>
          </nav>
          <div className="ld-topbar-right">
            <div className="ld-avatar" onClick={() => navigate('/profile')}>{userProfile.userName?.charAt(0) || 'S'}</div>
          </div>
        </div>
      </div>

      <div className="ld-main" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '3rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white'
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>
              {course ? course.title : 'Course Materials'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>
              {course ? course.description : 'Explore your learning resources and master new concepts.'}
            </p>
          </div>
        </div>

        <div className="learning-content-layout">
          {!selectedChapter ? (
            <div className="chapter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
              {Object.keys(groupedContents).length === 0 ? (
                <div style={{ background: 'white', padding: '4rem', borderRadius: '24px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <p style={{ fontSize: '1.2rem', color: '#888' }}>No learning content available for this course yet.</p>
                </div>
              ) : (
                Object.keys(groupedContents).map((chapterTitle, index) => (
                  <div
                    key={index}
                    className="chapter-card"
                    style={{
                      background: 'white',
                      padding: '2rem',
                      borderRadius: '24px',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedChapter(chapterTitle)}
                    >
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#333' }}>{chapterTitle}</h3>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{groupedContents[chapterTitle].length} Resources</p>
                      </div>
                      <div style={{ fontSize: '1.5rem', color: '#ccc' }}>→</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChapterForGeneration(chapterTitle);
                        setShowGenerateModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '0.9rem 1.5rem',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 15px rgba(245, 87, 108, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(245, 87, 108, 0.3)';
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>✨</span>
                      Generate Content
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="chapter-detail-view" style={{ background: 'white', padding: '3rem', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => { setSelectedChapter(null); setSelectedContent(null); }}
                style={{ background: '#f8f9fa', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: '#666', marginBottom: '2rem' }}
              >
                ← Back to Chapters
              </button>

              <h2 style={{ fontSize: '2.2rem', marginBottom: '3rem', color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '1.5rem' }}>{selectedChapter}</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {groupedContents[selectedChapter].map(content => (
                  <div
                    key={content.id}
                    onClick={() => handleContentClick(content)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '20px',
                      border: `3px solid ${selectedContent?.id === content.id ? '#667eea' : '#f0f0f0'}`,
                      background: selectedContent?.id === content.id ? '#f0f4ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                      {content.contentType === 'PDF' && '📄'}
                      {content.contentType === 'BLOG' && '📝'}
                      {content.contentType === 'TEXT' && '📝'}
                      {(content.contentType === 'YOUTUBE' || content.contentType === 'VIDEO') && '🎥'}
                      {content.contentType === 'ADMIN_UPLOADED' && '📦'}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: selectedContent?.id === content.id ? '#667eea' : '#333' }}>
                      {content.contentType}
                    </h4>
                  </div>
                ))}
              </div>

              <div className="content-viewer-section">
                {selectedContent ? renderContentPreview() : (
                  <div style={{ padding: '4rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '24px', color: '#999', fontStyle: 'italic' }}>
                    Select a resource above to view its content
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Content Modal */}
      {showGenerateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onClick={() => {
            if (!generatingContent) {
              setShowGenerateModal(false);
              setSelectedFormat('');
              setSelectedChapterForGeneration(null);
            }
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '3rem',
              borderRadius: '32px',
              maxWidth: '600px',
              width: '90%',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!generationSuccess ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    margin: '0 auto 1.5rem'
                  }}>
                    ✨
                  </div>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#333', fontWeight: '700' }}>
                    Generate Learning Content
                  </h2>
                  <p style={{ color: '#888', fontSize: '1rem' }}>
                    Topic: <strong>{selectedChapterForGeneration}</strong>
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', color: '#333', fontSize: '1.1rem' }}>
                    Select Content Format:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {[
                      { value: 'TEXT', label: 'Text Article', icon: '📝', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
                      { value: 'VIDEO', label: 'Video Link', icon: '🎥', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
                      { value: 'BLOG', label: 'Blog Post', icon: '📄', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
                      { value: 'PDF', label: 'PDF Document', icon: '📋', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' }
                    ].map((format) => (
                      <div
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value)}
                        style={{
                          padding: '1.5rem',
                          borderRadius: '16px',
                          border: selectedFormat === format.value ? '3px solid #667eea' : '2px solid #f0f0f0',
                          background: selectedFormat === format.value ? '#f0f4ff' : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'center',
                          boxShadow: selectedFormat === format.value ? '0 8px 20px rgba(102, 126, 234, 0.3)' : '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{format.icon}</div>
                        <div style={{ fontWeight: '700', color: selectedFormat === format.value ? '#667eea' : '#333' }}>
                          {format.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedFormat('');
                      setSelectedChapterForGeneration(null);
                    }}
                    disabled={generatingContent}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '2px solid #e0e0e0',
                      background: 'white',
                      color: '#666',
                      fontWeight: '700',
                      cursor: generatingContent ? 'not-allowed' : 'pointer',
                      opacity: generatingContent ? 0.5 : 1,
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateContent}
                    disabled={!selectedFormat || generatingContent}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: selectedFormat && !generatingContent
                        ? 'linear-gradient(135deg, #667eea, #764ba2)'
                        : '#e0e0e0',
                      color: 'white',
                      fontWeight: '700',
                      cursor: selectedFormat && !generatingContent ? 'pointer' : 'not-allowed',
                      fontSize: '1rem',
                      boxShadow: selectedFormat && !generatingContent ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                    }}
                  >
                    {generatingContent ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '3px solid rgba(255,255,255,0.3)',
                          borderTop: '3px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></span>
                        Generating...
                      </span>
                    ) : 'Generate Content'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #43e97b, #38f9d7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  margin: '0 auto 2rem',
                  animation: 'scaleUp 0.5s ease-out'
                }}>
                  ✓
                </div>
                <h2 style={{ fontSize: '2rem', color: '#333', marginBottom: '1rem', fontWeight: '700' }}>
                  Content Generated Successfully!
                </h2>
                <p style={{ color: '#888', fontSize: '1.1rem' }}>
                  Your learning content has been created and added to this chapter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .chapter-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
          border-color: #667eea !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes scaleUp {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentLearningContent;
