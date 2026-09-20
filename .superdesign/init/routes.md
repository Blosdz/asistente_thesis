# Routes

Router: React Router 7 with `HashRouter`; configuration is in `src/AppRoutes.jsx`.

## Public

- `/` → `src/components/landing/LandingPage.tsx`
- `/login` → `src/pages/auth/LoginPage.jsx`
- `/signup` → `src/pages/auth/SignupPage.jsx`
- `/verify-email` → `src/pages/auth/VerifyEmailPage.jsx`
- `/reset-password` → `src/pages/auth/ResetPasswordPage.jsx`
- `/colmena/forms/:slug` → `src/pages/public/ColmenaPublicForm.jsx`

## Student (layout: `src/layouts/StudentLayout.jsx`)

- `/student/dashboard` → `src/pages/student/Dashboard.jsx`
- `/student/profile` → `src/pages/student/Profile.jsx`
- `/student/notifications` → `src/pages/notifications/NotificationCenter.jsx`
- `/student/documents` → `src/pages/student/AdditionalDocuments.jsx`
- `/student/my-thesis` → `src/pages/student/MyThesisWorkspace.jsx`
- `/student/citas` → `src/pages/student/Citas.jsx`
- `/student/asesorias` → `src/pages/student/Advisors.jsx`
- `/student/cursos` → `src/pages/student/Courses.jsx`
- `/student/planes` → `src/pages/PlanesPage.tsx`
- `/student/payments` → `src/pages/student/Payments.jsx`
- `/student/services` → `src/pages/student/Services.jsx`
- `/student/services/advisors` → `src/pages/student/AdvisorCatalog.jsx`
- `/student/services/book` → `src/pages/student/ScheduleSession.jsx`
- `/student/statistics` → `src/pages/student/DataStatistics.jsx`

## Advisor (layout: `src/layouts/AdvisorLayout.jsx`)

- `/advisor/dashboard`, `/advisor/profile`, `/advisor/students`, `/advisor/calendar`, `/advisor/thesis`, `/advisor/cursos`

## Admin (layout: `src/layouts/AdminLayout.jsx`)

- `/admin/dashboard`, `/admin/users`, `/admin/payments`, `/admin/notifications`

The full router source is `src/AppRoutes.jsx` and should be passed directly when route structure matters.
