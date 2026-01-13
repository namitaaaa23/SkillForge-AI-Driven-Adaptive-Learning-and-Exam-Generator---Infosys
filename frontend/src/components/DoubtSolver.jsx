import React, { useState } from 'react';
import axios from 'axios';
import './DoubtSolver.css';

const DoubtSolver = () => {
  const [doubt, setDoubt] = useState('');
  const [courseId, setCourseId] = useState('');
  const [topic, setTopic] = useState('');
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8081/api/ai/solve-doubt', null, {
        params: {
          doubt,
          courseId,
          topic
        }
      });

      const solutionData = JSON.parse(response.data);
      setSolution(solutionData);
    } catch (error) {
      console.error('Error solving doubt:', error);
      setError('Failed to solve doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doubt-solver-container">
      <div className="solver-header">
        <h2>AI Doubt Solver</h2>
        <p>Get instant answers to your questions</p>
      </div>

      <div className="solver-layout">
        {/* Input Section */}
        <div className="solver-input-section">
          <form onSubmit={handleSolveDoubt}>
            <div className="form-group">
              <label>Your Doubt *</label>
              <textarea
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="Describe your doubt or question..."
                rows="5"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course</label>
                <input
                  type="text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="Course name"
                />
              </div>

              <div className="form-group">
                <label>Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic/Chapter"
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn-solve"
              disabled={loading || !doubt}
            >
              {loading ? 'Solving...' : 'Get Solution'}
            </button>
          </form>
        </div>

        {/* Solution Section */}
        {solution && (
          <div className="solver-solution-section">
            <div className="solution-card">
              <h3>Solution</h3>
              <p className="solution-text">{solution.solution}</p>

              <div className="explanation-box">
                <h4>Detailed Explanation</h4>
                <p>{solution.explanation}</p>
              </div>

              {solution.relatedConcepts && (
                <div className="related-concepts">
                  <h4>Related Concepts</h4>
                  <ul>
                    {JSON.parse(solution.relatedConcepts).map((concept, index) => (
                      <li key={index}>{concept}</li>
                    ))}
                  </ul>
                </div>
              )}

              {solution.practiceProblems && (
                <div className="practice-problems">
                  <h4>Practice Problems</h4>
                  <ul>
                    {JSON.parse(solution.practiceProblems).map((problem, index) => (
                      <li key={index}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}

              {solution.resources && (
                <div className="resources">
                  <h4>Recommended Resources</h4>
                  <ul>
                    {JSON.parse(solution.resources).map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtSolver;
