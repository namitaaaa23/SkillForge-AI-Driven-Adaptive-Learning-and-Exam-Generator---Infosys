const API_BASE_URL = 'http://localhost:8082';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    return headers;
  }

  /** REMOVED: Mock data is no longer used - all data comes from real backend
  getMockData(endpoint, options) {
    console.warn("Using Mock Data for:", endpoint);

    // Mock Login
    if (endpoint === '/auth/login') {
      const body = options.body ? JSON.parse(options.body) : {};
      const lowerEmail = (body.email || '').toLowerCase();
      let role = 'STUDENT';
      if (lowerEmail.includes('admin')) role = 'ADMIN';
      else if (lowerEmail.includes('guardian')) role = 'GUARDIAN';

      const mockUser = {
        id: 'mock-id-' + Date.now(),
        email: body.email || 'demo@skillforge.com',
        username: role.charAt(0) + role.slice(1).toLowerCase(),
        fullName: role.charAt(0) + role.slice(1).toLowerCase() + ' User',
        role: role
      };

      // Store for /auth/me
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      // Return user data at top level, not nested under 'user'
      return { token: 'mock-offline-token', ...mockUser };
    }

    // Mock Current User
    if (endpoint === '/auth/me') {
      const stored = localStorage.getItem('mockUser');
      return stored ? JSON.parse(stored) : { id: 'mock', role: 'GUARDIAN', username: 'Guardian User', email: 'guardian@skillforge.com' };
    }

    // Mock Guardian Data
    if (endpoint.includes('/guardian/wards')) {
      return { success: true, data: [{ id: 'w1', fullName: 'Alex Johnson', email: 'alex@skillforge.com' }] };
    }

    // Mock AI Exam Generation - DISABLED FOR NOW TO FORCE REAL API
    // if (endpoint.includes('/api/ai/generate-exam')) { ... }


    // Mock Create Exam
    if (endpoint === '/exams' && options.method === 'POST') {
      return { success: true, data: { id: "mock-exam-123" } };
    }

    // Mock Get Exam Details (for Exam Page)
    if (endpoint.match(/\/exams\/[a-zA-Z0-9-]+$/) && options.method !== 'POST') {
      return {
        success: true, data: {
          id: "mock-exam-123",
          title: "Mock Exam (Offline Mode)",
          questions: [
            { id: 'q1', questionText: "Sample Question 1?", options: ["A", "B", "C", "D"], type: 'MULTIPLE_CHOICE' },
            { id: 'q2', questionText: "Sample Question 2?", options: ["A", "B", "C", "D"], type: 'MULTIPLE_CHOICE' }
          ]
        }
      };
    }

    // Mock My Courses
    if (endpoint === '/courses/my-courses') {
      return {
        success: true,
        data: [
          {
            id: 'course-1',
            title: 'Introduction to Java Programming',
            description: 'Learn the fundamentals of Java programming',
            published: true,
            enrolledStudents: 150,
            createdAt: new Date().toISOString()
          },
          {
            id: 'course-2',
            title: 'Web Development with React',
            description: 'Build modern web applications with React',
            published: true,
            enrolledStudents: 200,
            createdAt: new Date().toISOString()
          },
          {
            id: 'course-3',
            title: 'Data Structures and Algorithms',
            description: 'Master essential data structures and algorithms',
            published: true,
            enrolledStudents: 180,
            createdAt: new Date().toISOString()
          }
        ]
      };
    }

    // Mock Learner Dashboard Stats
    if (endpoint === '/learner/dashboard-stats') {
      return {
        success: true,
        data: {
          enrolledCoursesCount: 3,
          activeCourses: 3,
          completedCourses: 1,
          studyStreak: 12,
          totalHours: 45
        }
      };
    }

    // Mock My Exam Results
    if (endpoint === '/exams/my-results') {
      return {
        success: true,
        data: [
          {
            id: 'result-1',
            examTitle: 'Java Fundamentals Quiz',
            score: 85,
            totalQuestions: 10,
            passed: true,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'result-2',
            examTitle: 'React Components Test',
            score: 92,
            totalQuestions: 10,
            passed: true,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'result-3',
            examTitle: 'Algorithms Assessment',
            score: 78,
            totalQuestions: 10,
            passed: true,
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    }

    // Default Generic Success
    return { success: true, message: "Operation simulated (Backend Offline)", data: [] };
  }
  */

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.requireAuth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          const message = errorJson.message || errorJson.error || errorText;
          throw new Error(message);
        } catch (e) {
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
      }

      let data;
      const text = await response.text();
      try {
        // Clean markdown backticks if present
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        data = JSON.parse(cleanedText);
      } catch (e) {
        console.error('JSON Parse Error, returning raw text:', e);
        data = text;
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);

      // NO MORE MOCK DATA FALLBACK - Always use real backend
      // If backend is down, the error will be properly handled by the UI
      throw error;
    }
  }

  // Authentication APIs
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      requireAuth: false,
    });

    // Handle ApiResponse wrapper (response.data.token) or direct response (response.token)
    const token = response.data?.token || response.token;

    if (token) {
      this.setToken(token);
      // Return the inner data object if wrapped, or the whole response if not
      return { success: true, data: response.data || response };
    }
    return { success: false, message: response.message || 'Registration failed' };
  }

  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        requireAuth: false,
      });
      if (response.token) {
        this.setToken(response.token);
        return { success: true, data: response };
      }
      // If no token but has message/error
      return { success: false, message: response.message || response.error || 'Login failed' };
    } catch (error) {
      // Extract error message from API error response
      const errorMessage = error.message || 'Login failed';
      return { success: false, message: errorMessage };
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
  }

  // Learner APIs
  async getLearnerDashboardStats() {
    return this.request('/learner/dashboard-stats');
  }

  // User APIs
  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin APIs
  async getAdminOverview() {
    return this.request('/analytics/admin/overview');
  }

  async getAdminStats() {
    return this.request('/analytics/admin/stats');
  }

  async getUserAnalytics() {
    return this.request('/analytics/users');
  }

  async getCourseAnalytics() {
    return this.request('/analytics/courses');
  }

  // Guardian APIs
  async getGuardianWards() {
    return this.request('/guardian/wards');
  }

  async getWardProgress(wardId) {
    return this.request(`/guardian/wards/${wardId}/progress`);
  }

  async getWardAttendance(wardId) {
    return this.request(`/guardian/wards/${wardId}/attendance`);
  }

  async getWardGrades(wardId) {
    return this.request(`/guardian/wards/${wardId}/grades`);
  }

  async getGuardianConversations(guardianId) {
    return this.request(`/api/communications/guardian/${guardianId}`);
  }

  async sendCommunicationMessage(communicationId, senderId, senderRole, content) {
    const params = new URLSearchParams({ senderId, senderRole, content });
    return this.request(`/api/communications/${communicationId}/message?${params.toString()}`, {
      method: 'POST'
    });
  }

  async linkWard(email) {
    return this.request('/guardian/link-ward', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Course APIs
  async getCourses() {
    return this.request('/courses/public', { requireAuth: false });
  }

  async getAllCoursesAdmin() {
    return this.request('/courses/admin'); // For Admins to see drafted courses
  }

  async getMyCourses() {
    return this.request('/courses/my-courses');
  }

  async getCourseById(id) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id, courseData) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async publishCourse(id) {
    return this.request(`/courses/${id}/publish`, {
      method: 'POST',
    });
  }

  async unpublishCourse(id) {
    return this.request(`/courses/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async addCourseMaterial(courseId, materialData) {
    return this.request(`/courses/${courseId}/materials`, {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async deleteCourseMaterial(courseId, materialId) {
    return this.request(`/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE',
    });
  }

  async enrollInCourse(id) {
    return this.request(`/courses/${id}/enroll`, {
      method: 'POST',
    });
  }

  async getEnrolledStudents(courseId) {
    return this.request(`/courses/${courseId}/students`);
  }

  async assignCourseToLearners(courseId, learnerEmails) {
    return this.request(`/courses/${courseId}/assign-learners`, {
      method: 'POST',
      body: JSON.stringify({ learnerEmails }),
    });
  }

  async getAssignedCourses() {
    return this.request('/courses/assigned-to-me');
  }

  // Course Request APIs
  async createCourseRequest(requestData) {
    return this.request('/course-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getMyCourseRequests() {
    return this.request('/course-requests/my-requests');
  }

  async getAllCourseRequests() {
    return this.request('/course-requests/all');
  }

  async getPendingCourseRequests() {
    return this.request('/course-requests/pending');
  }

  async respondToCourseRequest(requestId, status, adminResponse) {
    return this.request(`/course-requests/${requestId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminResponse }),
    });
  }

  // Exam APIs
  async getExamsByCourse(courseId) {
    return this.request(`/exams/course/${courseId}`);
  }

  async getExamById(id, includeAnswers = false) {
    return this.request(`/exams/${id}?includeAnswers=${includeAnswers}`);
  }

  async createExam(examData) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  async updateExam(id, examData) {
    return this.request(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  async deleteExam(id) {
    return this.request(`/exams/${id}`, {
      method: 'DELETE',
    });
  }

  async addQuestion(examId, questionData) {
    return this.request(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async submitExam(examId, answers) {
    return this.request(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  }

  async getExamResults(examId) {
    return this.request(`/exams/${examId}/results`);
  }

  async getMyExamResults() {
    return this.request('/exams/my-results');
  }

  async publishExam(id) {
    return this.request(`/exams/${id}/publish`, {
      method: 'POST',
    });
  }

  // Attendance APIs
  async getAttendanceRecords(userId) {
    return this.request(`/attendance/user/${userId}`);
  }

  async markAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async requestLeave(leaveData) {
    return this.request('/attendance/leave-request', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  // Audit APIs
  async getAuditLogs() {
    return this.request('/audit/logs');
  }

  // AI APIs
  async generateExamQuestions(courseId, topic, questionCount, difficulty) {
    const queryParams = new URLSearchParams({
      courseId,
      topic,
      questionCount,
      difficulty
    }).toString();
    return this.request(`/api/ai/generate-exam?${queryParams}`, {
      method: 'POST'
    });
  }

  async solveDoubt(doubt, courseId, topic) {
    const queryParams = new URLSearchParams({
      doubt,
      courseId,
      topic
    }).toString();
    return this.request(`/api/ai/solve-doubt?${queryParams}`, {
      method: 'POST'
    });
  }

  async chat(message) {
    const queryParams = new URLSearchParams({
      message
    }).toString();
    const url = `${API_BASE_URL}/api/ai/chat?${queryParams}`;
    const headers = {
      ...this.getHeaders(),
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.text();
  }

  async getSystemHealth() {
    return this.request('/health');
  }

  // Guardian APIs
  async getGuardianWards() {
    return this.request('/guardian/wards');
  }

  async getWardProgress(wardId) {
    return this.request(`/guardian/wards/${wardId}/progress`);
  }

  async linkWard(email) {
    return this.request('/guardian/link-ward', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
}

export default new ApiService();
