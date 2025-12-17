import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Header from "./components/shared/Header";
import Home from "./pages/shared/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/shared/NotFound";
import Footer from "./components/shared/Footer";
import AdminLogin from "./pages/auth/AdminLogin";
import CreateCourse from "./pages/courses/CreateCourse";
import Courses from "./pages/courses/Courses";
import Course from "./pages/courses/CourseDetail";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import EditCourse from "./pages/courses/EditCourse";
import Sidebar from "./components/shared/Sidebar";
import { useAuth } from "./store/auth";
import AdminPendingCourses from "./pages/admin/AdminPendingCourses";
import AdminDeniedCourses from "./pages/admin/AdminDeniedCourses";
import AdminUsers from "./pages/admin/AdminUsers";

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const hideSidebarRoutes = ["/login", "/signup", "/adminlogin"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {user && !hideSidebar && <Sidebar />}

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/adminlogin" element={<AdminLogin />} />

            {/* STUDENT */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* TEACHER */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/courses"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherCourses />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses/pending"
              element={
                <ProtectedRoute role="admin">
                  <AdminPendingCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses/denied"
              element={
                <ProtectedRoute role="admin">
                  <AdminDeniedCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute role="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* COURSES – STUDENT (teacher + admin vẫn OK nếu ProtectedRoute cho phép) */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute role="student">
                  <Courses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute role="student">
                  <Course />
                </ProtectedRoute>
              }
            />

            {/* CREATE / EDIT – TEACHER */}
            <Route
              path="/courses/new"
              element={
                <ProtectedRoute role="teacher">
                  <CreateCourse />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/:id/edit"
              element={
                <ProtectedRoute role="teacher">
                  <EditCourse />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
