import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentRankingDashboard.css';

const StudentRankingDashboard = () => {
  const [studentProgress, setStudentProgress] = useState(null);
  const [courseRankings, setCourseRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const studentId = localStorage.getItem('userId');
  const courseId = localStorage.getItem('currentCourseId');

  useEffect(() => {
    fetchProgressData();
  }, [courseId]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const progressResponse = await axios.get(
        `http://localhost:8081/api/student-progress/${studentId}/${courseId}`
      );
      setStudentProgress(progressResponse.data);

      const rankingsResponse = await axios.get(
        `http://localhost:8081/api/student-progress/rankings/${courseId}`
      );
      setCourseRankings(rankingsResponse.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 45) return 'Average';
    return 'Needs Improvement';
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return '#27ae60';
    if (score >= 75) return '#3498db';
    if (score >= 60) return '#f39c12';
    if (score >= 45) return '#e67e22';
    return '#e74c3c';
  };

  if (loading) {
    return <div className="ranking-container"><p>Loading ranking data...</p></div>;
  }

  if (!studentProgress) {
    return <div className="ranking-container"><p>No progress data available</p></div>;
  }

  const performanceColor = getPerformanceColor(studentProgress.overallScore);
  const performanceLevel = getPerformanceLevel(studentProgress.overallScore);

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h1>Your Performance Dashboard</h1>
        <p className="subtitle">Track your progress and ranking</p>
      </div>

      <div className="ranking-grid">
        {/* Main Score Card */}
        <div className="score-card main-score">
          <div className="score-circle" style={{ borderColor: performanceColor }}>
            <div className="score-value">{studentProgress.overallScore.toFixed(1)}</div>
            <div className="score-label">Overall Score</div>
          </div>
          <div className="score-details">
            <p className="performance-level" style={{ color: performanceColor }}>
              {performanceLevel}
            </p>
            <p className="rank-info">Rank: <span className="rank-number">#{studentProgress.studentRank}</span></p>
          </div>
        </div>

        {/* Progress Card */}
        <div className="progress-card">
          <h3>Course Progress</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${studentProgress.progressPercentage}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {studentProgress.completedLessons} of {studentProgress.totalLessons} lessons completed
            </p>
          </div>
          <p className="progress-percentage">{studentProgress.progressPercentage.toFixed(1)}%</p>
        </div>

        {/* Study Hours Card */}
        <div className="stats-card">
          <h3>Study Hours</h3>
          <p className="stat-value">{studentProgress.totalStudyHours}</p>
          <p className="stat-label">hours invested</p>
        </div>

        {/* Level Card */}
        <div className="stats-card">
          <h3>Current Level</h3>
          <p className="stat-value">{studentProgress.currentLevel}</p>
          <p className="stat-label">proficiency level</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="top-performers">
        <h2>Course Rankings</h2>
        <div className="rankings-list">
          {courseRankings.slice(0, 10).map((ranking, index) => (
            <div 
              key={ranking.id} 
              className={`ranking-item ${ranking.studentId === studentId ? 'current-student' : ''}`}
            >
              <div className="rank-position">
                <span className="rank-badge">#{index + 1}</span>
              </div>
              <div className="rank-info-details">
                <p className="student-name">
                  {ranking.studentId === studentId ? 'You' : `Student ${index + 1}`}
                </p>
                <p className="rank-score">Score: {ranking.overallScore.toFixed(1)}</p>
              </div>
              <div className="rank-progress">
                <div className="mini-progress-bar">
                  <div 
                    className="mini-progress-fill" 
                    style={{ width: `${ranking.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>Milestones</h2>
        <div className="achievements-grid">
          <div className={`achievement ${studentProgress.progressPercentage >= 25 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">25%</div>
            <p>Quarter Way</p>
          </div>
          <div className={`achievement ${studentProgress.progressPercentage >= 50 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">50%</div>
            <p>Halfway There</p>
          </div>
          <div className={`achievement ${studentProgress.progressPercentage >= 75 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">75%</div>
            <p>Almost Done</p>
          </div>
          <div className={`achievement ${studentProgress.progressPercentage >= 100 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">100%</div>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <button className="refresh-btn" onClick={fetchProgressData}>
        Refresh Data
      </button>
    </div>
  );
};

export default StudentRankingDashboard;
