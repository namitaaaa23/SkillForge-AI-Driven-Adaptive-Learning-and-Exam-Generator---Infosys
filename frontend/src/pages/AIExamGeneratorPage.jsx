import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AIExamGeneratorPage.css';

const AIExamGeneratorPage = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    topic: '',
    questionCount: 10,
    difficulty: 'Intermediate'
  });
  const [generatedExam, setGeneratedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const studentId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'questionCount' ? parseInt(value) : value
    }));
  };

  const handleGenerateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8081/api/ai/generate-exam', null, {
        params: {
          courseId: formData.courseId,
          topic: formData.topic,
          questionCount: formData.questionCount,
          difficulty: formData.difficulty
        }
      });

      const examData = JSON.parse(response.data);
      setGeneratedExam(examData);
    } catch (error) {
      console.error('Error generating exam:', error);
      setError('Failed to generate exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (generatedExam) {
      localStorage.setItem('currentExam', JSON.stringify(generatedExam));
      window.location.href = '/exam/ai-generated';
    }
  };

  return (
    <div className="ai-exam-generator-container">
      <div className="generator-header">
        <h1>AI Exam Generator</h1>
        <p>Create personalized exams powered by artificial intelligence</p>
      </div>

      <div className="generator-layout">
        {/* Form Section */}
        <div className="generator-form-section">
          <form onSubmit={handleGenerateExam} className="exam-form">
            <h2>Generate Your Exam</h2>

            <div className="form-group">
              <label>Select Course *</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Choose a Course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Topic/Chapter *</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., Linear Algebra, Photosynthesis"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Number of Questions</label>
                <select
                  name="questionCount"
                  value={formData.questionCount}
                  onChange={handleInputChange}
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="25">25 Questions</option>
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn-generate"
              disabled={loading || !formData.courseId || !formData.topic}
            >
              {loading ? 'Generating Exam...' : 'Generate Exam'}
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <h3>How It Works</h3>
            <ul>
              <li>Select your course and topic</li>
              <li>Choose difficulty level and question count</li>
              <li>AI generates personalized questions</li>
              <li>Take the exam and get instant feedback</li>
              <li>Review detailed explanations</li>
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        <div className="generator-preview-section">
          {generatedExam ? (
            <div className="exam-preview">
              <div className="preview-header">
                <h2>{generatedExam.topic} Exam</h2>
                <span className="difficulty-badge">{generatedExam.difficulty}</span>
              </div>

              <div className="exam-stats">
                <div className="stat">
                  <span className="stat-label">Questions</span>
                  <span className="stat-value">{generatedExam.questions.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Estimated Time</span>
                  <span className="stat-value">{generatedExam.questions.length * 2} min</span>
                </div>
              </div>

              <div className="questions-preview">
                <h3>Question Preview</h3>
                {generatedExam.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="question-preview-item">
                    <p className="question-text">
                      <strong>Q{index + 1}:</strong> {question.question}
                    </p>
                    <p className="question-type">Type: {question.type}</p>
                  </div>
                ))}
                {generatedExam.questions.length > 3 && (
                  <p className="more-questions">
                    + {generatedExam.questions.length - 3} more questions
                  </p>
                )}
              </div>

              <button className="btn-start-exam" onClick={handleStartExam}>
                Start Exam
              </button>
            </div>
          ) : (
            <div className="no-preview">
              <p>Generate an exam to see preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIExamGeneratorPage;
