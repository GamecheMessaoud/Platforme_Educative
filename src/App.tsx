import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ParentDashboard from './pages/dashboards/ParentDashboard';
import CoursesBrowser from './pages/CoursesBrowser';
import ScratchCoursePage from './pages/ScratchCourse';
import StorePage from './pages/Store';
import LabViewer from './pages/LabViewer';
import LabsDirectory from './pages/dashboards/LabsDirectory';
import CommunityPage from './pages/Community';
import Achievements from './pages/dashboards/Achievements';
import Leaderboard from './pages/dashboards/Leaderboard';
import AiAssistant from './pages/dashboards/AiAssistant';
import StudentSubmissions from './pages/dashboards/StudentSubmissions';
import CourseViewer from './pages/CourseViewer';
import CourseInfo from './pages/CourseInfo';
import CheckoutPage from './pages/Checkout';
import PublicProfile from './pages/PublicProfile';
import CodyDrawer from './components/shared/CodyDrawer';
import Confetti from './components/shared/Confetti';


function App() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handleConfetti = () => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    };
    window.addEventListener('show-confetti', handleConfetti);
    return () => window.removeEventListener('show-confetti', handleConfetti);
  }, []);

  console.log("App component is rendering.");
  return (
    <ThemeProvider>
      <BrowserRouter basename="/Platforme_Educative/">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/courses" element={<CoursesBrowser />} />
          <Route path="/labs" element={<LabsDirectory />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/scratch-course" element={<ScratchCoursePage />} />
          <Route path="/course-viewer/:id" element={<CourseViewer />} />
          <Route path="/course-info/:id" element={<CourseInfo />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/lab/:id" element={<LabViewer />} />
          <Route path="/submissions" element={<StudentSubmissions />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CodyDrawer />
        {showConfetti && <Confetti />}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
