import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import StudentLayout from './layouts/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import PlanesPage from './pages/PlanesPage';
import AdditionalDocuments from './pages/student/AdditionalDocuments';
import MyThesisWorkspace from './pages/student/MyThesisWorkspace';
import Citas from './pages/student/Citas';
import Services from './pages/student/Services';
import Payments from './pages/student/Payments';
import AdvisorCatalog from './pages/student/AdvisorCatalog';
import ScheduleSession from './pages/student/ScheduleSession';
import Profile from './pages/student/Profile';
import AdvisorLayout from './layouts/AdvisorLayout';
import AdvisorProfile from './pages/advisor/Profile';
import AdvisorStudents from './pages/advisor/Students';
import AdvisorCalendar from './pages/advisor/Calendar';
import AdvisorThesisReview from './pages/advisor/ThesisReview';
import AdvisorStudentDetail from './pages/advisor/StudentDetail';
import AdminDashboard from './pages/admin/Dashboard';
import { isAuthenticated } from './services/authService';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await isAuthenticated();
        setAuth(isAuth);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="documents" element={<AdditionalDocuments />} />
        <Route path="my-thesis" element={<MyThesisWorkspace />} />
        <Route path="citas" element={<Citas />} />
        <Route path="planes" element={<PlanesPage />} />
        <Route path="payments" element={<Payments />} />
        <Route path="services" element={<Services />} />
        <Route path="services/advisors" element={<AdvisorCatalog />} />
        <Route path="services/book" element={<ScheduleSession />} />
        <Route
          path="statistics"
          element={<Navigate to="/student/dashboard" replace />}
        />
      </Route>

      <Route
        path="/advisor/*"
        element={
          <ProtectedRoute>
            <AdvisorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="students" replace />} />
        <Route path="profile" element={<AdvisorProfile />} />
        <Route path="students" element={<AdvisorStudents />} />
        <Route path="students/:studentId" element={<AdvisorStudentDetail />} />
        <Route path="calendar" element={<AdvisorCalendar />} />
        <Route path="thesis" element={<AdvisorThesisReview />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
