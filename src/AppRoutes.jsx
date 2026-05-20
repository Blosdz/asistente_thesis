import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSkeleton from './components/ui/LoadingSkeleton';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const LeadChatLauncher = lazy(() => import('./components/landing/LeadChatLauncher'));
const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const Dashboard = lazy(() => import('./pages/student/Dashboard'));
const PlanesPage = lazy(() => import('./pages/PlanesPage'));
const AdditionalDocuments = lazy(() => import('./pages/student/AdditionalDocuments'));
const MyThesisWorkspace = lazy(() => import('./pages/student/MyThesisWorkspace'));
const DataStatistics = lazy(() => import('./pages/student/DataStatistics'));
const Citas = lazy(() => import('./pages/student/Citas'));
const Services = lazy(() => import('./pages/student/Services'));
const Payments = lazy(() => import('./pages/student/Payments'));
const StudentCourses = lazy(() => import('./pages/student/Courses'));
const AdvisorCatalog = lazy(() => import('./pages/student/AdvisorCatalog'));
const ScheduleSession = lazy(() => import('./pages/student/ScheduleSession'));
const Profile = lazy(() => import('./pages/student/Profile'));
const NotificationCenter = lazy(() => import('./pages/notifications/NotificationCenter'));
const AdvisorLayout = lazy(() => import('./layouts/AdvisorLayout'));
const AdvisorProfile = lazy(() => import('./pages/advisor/Profile'));
const AdvisorStudents = lazy(() => import('./pages/advisor/Students'));
const AdvisorReservations = lazy(() => import('./pages/advisor/Reservations'));
const AdvisorCalendar = lazy(() => import('./pages/advisor/Calendar'));
const AdvisorThesisReview = lazy(() => import('./pages/advisor/ThesisReview'));
const AdvisorStudentDetail = lazy(() => import('./pages/advisor/StudentDetail'));
const AdvisorCourses = lazy(() => import('./pages/advisor/Courses'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const Advisors = lazy(() => import('./pages/student/Advisors'));

const LandingExperience = () => (
  <>
    <LandingPage />
    <Suspense fallback={null}>
      <LeadChatLauncher />
    </Suspense>
  </>
);

const getFallbackVariant = () => {
  const hashPath = window.location.hash.replace(/^#/, '').split('?')[0] || '/';

  if (hashPath === '/') {
    return 'landing';
  }

  if (['/login', '/signup', '/reset-password'].includes(hashPath)) {
    return 'auth';
  }

  return 'app';
};

const RouteFallback = () => <LoadingSkeleton variant={getFallbackVariant()} />;

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { isAuthenticated } = await import('./services/authService');
        const isAuth = await isAuthenticated();
        if (isMounted) {
          setAuth(isAuth);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setAuth(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSkeleton variant="app" />;
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
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="documents" element={<AdditionalDocuments />} />
          <Route path="my-thesis" element={<MyThesisWorkspace />} />
          <Route path="citas" element={<Citas />} />
          {/* mostramos aqu ilas asesorias */}
          <Route path="asesorias" element={<Advisors />} />
          <Route path="cursos" element={<StudentCourses />} />
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
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="students" element={<AdvisorStudents />} />
          <Route path="reservations" element={<AdvisorReservations />} />
          <Route path="students/:studentId" element={<AdvisorStudentDetail />} />
          <Route path="calendar" element={<AdvisorCalendar />} />
          <Route path="thesis" element={<AdvisorThesisReview />} />
          <Route path="cursos" element={<AdvisorCourses />} />
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
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        <Route path="/" element={<LandingExperience />} />
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
