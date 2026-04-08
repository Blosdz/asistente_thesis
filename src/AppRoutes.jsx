import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isAuthenticated } from './services/authService';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const Dashboard = lazy(() => import('./pages/student/Dashboard'));
const PlanesPage = lazy(() => import('./pages/PlanesPage'));
const AdditionalDocuments = lazy(() => import('./pages/student/AdditionalDocuments'));
const MyThesisWorkspace = lazy(() => import('./pages/student/MyThesisWorkspace'));
const DataStatistics = lazy(() => import('./pages/student/DataStatistics'));
const Citas = lazy(() => import('./pages/student/Citas'));
const Services = lazy(() => import('./pages/student/Services'));
const Payments = lazy(() => import('./pages/student/Payments'));
const AdvisorCatalog = lazy(() => import('./pages/student/AdvisorCatalog'));
const ScheduleSession = lazy(() => import('./pages/student/ScheduleSession'));
const Profile = lazy(() => import('./pages/student/Profile'));
const AdvisorLayout = lazy(() => import('./layouts/AdvisorLayout'));
const AdvisorProfile = lazy(() => import('./pages/advisor/Profile'));
const AdvisorStudents = lazy(() => import('./pages/advisor/Students'));
const AdvisorReservations = lazy(() => import('./pages/advisor/Reservations'));
const AdvisorCalendar = lazy(() => import('./pages/advisor/Calendar'));
const AdvisorThesisReview = lazy(() => import('./pages/advisor/ThesisReview'));
const AdvisorStudentDetail = lazy(() => import('./pages/advisor/StudentDetail'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const Advisors = lazy(() => import('./pages/student/Advisors'));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center text-sm font-medium text-slate-500">
    Cargando experiencia...
  </div>
);

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
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
          {/* mostramos aqu ilas asesorias */}
          <Route path="asesorias" element={<Advisors />} />
          <Route path="planes" element={<PlanesPage />} />
          <Route path="payments" element={<Payments />} />
          <Route path="services" element={<Services />} />
          <Route path="services/advisors" element={<AdvisorCatalog />} />
          <Route path="services/book" element={<ScheduleSession />} />
          <Route path="statistics" element={<DataStatistics />} />
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
          <Route path="reservations" element={<AdvisorReservations />} />
          <Route path="students/:studentId" element={<AdvisorStudentDetail />} />
          <Route path="calendar" element={<AdvisorCalendar />} />
          <Route path="thesis" element={<AdvisorThesisReview />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
