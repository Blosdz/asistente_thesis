# Key page dependency trees

## `/student/my-thesis`

Entry: `src/pages/student/MyThesisWorkspace.jsx`

- `src/layouts/StudentLayout.jsx`
  - `src/components/navigation/AnimatedTopNav.jsx`
  - `src/components/notifications/NotificationsBell.jsx`
  - `src/components/notifications/UnreadNotificationsPopup.jsx`
- `src/pages/student/MyThesisWorkspace.jsx`
  - `src/components/ui/button.jsx`
  - `src/components/ui/card.jsx`
  - `src/components/student/workspace/AccessManagementModal.jsx`
    - `src/components/ui/modal.jsx`
  - `src/components/student/workspace/SuggestionsThreadModal.jsx`
    - `src/components/ui/modal.jsx`
  - `src/components/student/workspace/WorkspaceAiFlow.jsx`
    - `src/components/student/workspace/WorkspaceAiFlow.css`
    - `src/components/student/workspace/RelatedDocumentsPanel.jsx`
    - `src/components/student/workspace/AcademicAIChatPanel.jsx`
  - `src/components/student/workspace/ThesisCoverUploadPanel.jsx`
  - `src/components/student/workspace/ThesisManualEditorPanel.jsx`
  - `src/components/student/workspace/ThesisReferencesPanel.jsx`
  - `src/components/student/workspace/PaymentGatewayModal.jsx`
  - `src/components/student/workspace/QuotationModal.jsx`

For the access-modal target, the minimal complete context is the access modal, shared modal, workspace call site/render branch, theme tokens, and reference screenshot.

## `/student/dashboard`

Entry: `src/pages/student/Dashboard.jsx`

- `src/layouts/StudentLayout.jsx`
- `src/components/student/dashboard/HeroSection.jsx`
- `src/components/student/dashboard/MetricsGrid.jsx`
- `src/components/student/dashboard/ThesisProgressCard.jsx`
- `src/components/student/dashboard/MeetingsCalendar.jsx`
- `src/components/student/dashboard/QuickActions.jsx`
- `src/components/student/dashboard/AdvisorSuggestions.jsx`
- `src/components/student/dashboard/PaymentsCard.jsx`
- `src/components/student/dashboard/StudentProfileCard.jsx`

## `/student/documents`

Entry: `src/pages/student/AdditionalDocuments.jsx`

- `src/layouts/StudentLayout.jsx`
- `src/components/ui/button.jsx`
- `src/components/ui/card.jsx`
- `src/components/ui/modal.jsx`

## `/student/asesorias`

Entry: `src/pages/student/Advisors.jsx`

- `src/layouts/StudentLayout.jsx`
- `src/components/student/advisors/MyAdvisorsSection.jsx`
- `src/components/student/advisors/AdvisorCatalogSection.jsx`
- `src/components/student/advisors/AdvisorScheduleSection.jsx`
- `src/components/student/advisors/AdvisorCoursesExplorer.jsx`

## `/student/profile`

Entry: `src/pages/student/Profile.jsx`

- `src/layouts/StudentLayout.jsx`
- `src/components/ui/button.jsx`
- `src/components/ui/input.jsx`

## `/advisor/dashboard`

Entry: `src/pages/advisor/Dashboard.jsx`

- `src/layouts/AdvisorLayout.jsx`
- `src/components/advisor/ReservationsPanel.jsx`

## `/admin/dashboard`

Entry: `src/pages/admin/Dashboard.jsx`

- `src/layouts/AdminLayout.jsx`
- `src/components/ui/card.jsx`

## `/login`

Entry: `src/pages/auth/LoginPage.jsx`

- `src/pages/auth/AuthLayout.jsx`
- `src/components/ui/button.jsx`
- `src/components/ui/input.jsx`

## `/`

Entry: `src/components/landing/LandingPage.tsx`

- `src/components/landing/LandingNavbar.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/ProductModulesSection.tsx`
- `src/components/landing/AdvisorsSection.tsx`
- `src/components/landing/PlansSection.tsx`
- `src/components/landing/LandingFooter.tsx`
