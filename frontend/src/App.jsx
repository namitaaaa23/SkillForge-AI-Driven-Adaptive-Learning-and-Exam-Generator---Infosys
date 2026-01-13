import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GuardianProvider } from "./context/GuardianContext";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import LearnerLogin from "./pages/LearnerLogin";
import GuardianLogin from "./pages/GuardianLogin";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnerContent from "./pages/LearnerContent";
import AdminDashboard from "./pages/AdminDashboard";
import GuardianDashboard from "./pages/GuardianDashboard";
import Profile from "./pages/Profile";
import AiExamGenerator from "./pages/AiExamGenerator";
import Exam from "./pages/Exam";
import AdminCourses from "./pages/AdminCourses";
import AdminUsers from "./pages/AdminUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import GuardianAttendance from "./pages/GuardianAttendance";
import GuardianMessages from "./pages/GuardianMessages";
import LearnerProgress from "./pages/LearnerProgress";
import GuardianProgressAnalytics from "./pages/GuardianProgressAnalytics";
import StudentLearningContent from "./pages/StudentLearningContent";
import StudentRankingDashboard from "./pages/StudentRankingDashboard";
import GuardianProgressPortal from "./pages/GuardianProgressPortal";
import AdminLearningContentManager from "./pages/AdminLearningContentManager";
import LearnerProfile from "./pages/LearnerProfile";
import GuardianProfile from "./pages/GuardianProfile";
import AdminProfile from "./pages/AdminProfile";
import AdminCourseRequests from "./pages/AdminCourseRequests";
import AdminMessages from "./pages/AdminMessages";

export default function App() {
  return (
    <BrowserRouter>
      <GuardianProvider>
        <Routes>
          <Route path="/" element={<Home />} />



          <Route path="/learner-login" element={<LearnerLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/guardian-login" element={<GuardianLogin />} />

          <Route path="/learner-dashboard" element={<LearnerDashboard />} />
          <Route path="/learner-content" element={<LearnerContent />} />
          <Route path="/learner-content" element={<LearnerContent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/learner-profile" element={<LearnerProfile />} />
          <Route path="/guardian-profile" element={<GuardianProfile />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route path="/ai-exam-generator" element={<AiExamGenerator />} />
          <Route path="/exam/:id" element={<Exam />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/guardian-dashboard" element={<GuardianDashboard />} />

          {/* New Functional Pages */}
          <Route path="/admin-courses" element={<AdminCourses />} />
          <Route path="/admin-users" element={<AdminUsers />} />
          <Route path="/admin-analytics" element={<AdminAnalytics />} />
          <Route path="/guardian-attendance" element={<GuardianAttendance />} />
          <Route path="/guardian-messages" element={<GuardianMessages />} />
          <Route path="/guardian-progress-analytics" element={<GuardianProgressAnalytics />} />
          <Route path="/learner-progress" element={<LearnerProgress />} />

          {/* New AI & Learning Features */}
          <Route path="/student-learning" element={<StudentLearningContent />} />
          <Route path="/student-ranking" element={<StudentRankingDashboard />} />
          <Route path="/guardian-progress-portal" element={<GuardianProgressPortal />} />
          <Route path="/admin-learning-content" element={<AdminLearningContentManager />} />
          <Route path="/admin-course-requests" element={<AdminCourseRequests />} />
          <Route path="/admin-messages" element={<AdminMessages />} />

        </Routes>
      </GuardianProvider>
    </BrowserRouter>
  );
}
