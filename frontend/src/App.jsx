import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPatientPage from './pages/auth/RegisterPatientPage';
import RegisterNursePage from './pages/auth/RegisterNursePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Patient Pages
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import PatientBookPage from './pages/patient/PatientBookPage';
import PatientBookDetailPage from './pages/patient/PatientBookDetailPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import PatientIndemnityPage from './pages/patient/PatientIndemnityPage';
import PatientConsultationPage from './pages/patient/PatientConsultationPage';
// Health Records
import PatientRecordsPage from './pages/patient/PatientRecordsPage';
import PatientRecordUploadPage from './pages/patient/PatientRecordUploadPage';
import PatientRecordDetailPage from './pages/patient/PatientRecordDetailPage';
import PatientTrendsPage from './pages/patient/PatientTrendsPage';
// Meal Plans
import PatientMealPlansPage from './pages/patient/PatientMealPlansPage';
import PatientMealPlanDetailPage from './pages/patient/PatientMealPlanDetailPage';
import PatientMyMealPlanPage from './pages/patient/PatientMyMealPlanPage';
import PatientGroceryListPage from './pages/patient/PatientGroceryListPage';
// Education
import PatientEducationPage from './pages/patient/PatientEducationPage';
import PatientEducationDetailPage from './pages/patient/PatientEducationDetailPage';
import PatientEducationFeaturedPage from './pages/patient/PatientEducationFeaturedPage';
import PatientEducationQuizPage from './pages/patient/PatientEducationQuizPage';
import PatientEducationProgressPage from './pages/patient/PatientEducationProgressPage';
// AI
import PatientAIPage from './pages/patient/PatientAIPage';

// Nurse Pages
import NurseDashboardPage from './pages/nurse/NurseDashboardPage';
import NurseAvailabilityPage from './pages/nurse/NurseAvailabilityPage';
import NurseAppointmentsPage from './pages/nurse/NurseAppointmentsPage';
import NurseProfilePage from './pages/nurse/NurseProfilePage';
import NurseIndemnityPage from './pages/nurse/NurseIndemnityPage';
import NurseConsultationPage from './pages/nurse/NurseConsultationPage';
// Health Records
import NursePatientRecordsPage from './pages/nurse/NursePatientRecordsPage';
import NurseRecordUploadPage from './pages/nurse/NurseRecordUploadPage';
// Meal Plans
import NurseMealPlansPage from './pages/nurse/NurseMealPlansPage';
import NurseMealPlanAssignPage from './pages/nurse/NurseMealPlanAssignPage';
// Education
import NurseEducationPage from './pages/nurse/NurseEducationPage';
import NurseEducationCreatePage from './pages/nurse/NurseEducationCreatePage';
// AI
import NurseAIConversationsPage from './pages/nurse/NurseAIConversationsPage';
import NurseAIConversationDetailPage from './pages/nurse/NurseAIConversationDetailPage';

// Shared Pages
import VerifyPhonePage from './pages/shared/VerifyPhonePage';
import IndemnityFormPage from './pages/shared/IndemnityFormPage';
import PaymentPage from './pages/shared/PaymentPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidney-green"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'nurse' ? '/nurse/dashboard' : '/patient/dashboard'} replace />;
  }

  // Check indemnity status for non-auth pages
  if (user?.role === 'patient' && !user?.indemnity_signed) {
    return <Navigate to="/patient/indemnity" replace />;
  }
  if (user?.role === 'nurse' && !user?.indemnity_signed) {
    return <Navigate to="/nurse/indemnity" replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidney-green"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'nurse' ? '/nurse/dashboard' : '/patient/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2E7D32',
              color: '#fff',
            },
            success: {
              style: {
                background: '#4CAF50',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#D32F2F',
                color: '#fff',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register/patient" element={<PublicRoute><RegisterPatientPage /></PublicRoute>} />
          <Route path="/register/nurse" element={<PublicRoute><RegisterNursePage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/verify-phone" element={<VerifyPhonePage />} />
          <Route path="/indemnity-form" element={<IndemnityFormPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/book" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientBookPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/book/:nurseId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientBookDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/patient/indemnity" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientIndemnityPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/consultation/:bookingId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientConsultationPage />
            </ProtectedRoute>
          } />

          {/* Patient Health Records Routes */}
          <Route path="/patient/records" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/records/upload" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientRecordUploadPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/records/:recordId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientRecordDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/records/trends" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientTrendsPage />
            </ProtectedRoute>
          } />

          {/* Patient Meal Plans Routes */}
          <Route path="/patient/meal-plans" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientMealPlansPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/meal-plans/my" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientMyMealPlanPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/meal-plans/:planId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientMealPlanDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/meal-plans/:planId/grocery-list" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientGroceryListPage />
            </ProtectedRoute>
          } />

          {/* Patient Education Routes */}
          <Route path="/patient/education" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientEducationPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/education/featured" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientEducationFeaturedPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/education/:contentId" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientEducationDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/education/:contentId/quiz" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientEducationQuizPage />
            </ProtectedRoute>
          } />
          <Route path="/patient/education/progress" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientEducationProgressPage />
            </ProtectedRoute>
          } />

          {/* Patient AI Route */}
          <Route path="/patient/ai" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientAIPage />
            </ProtectedRoute>
          } />

          {/* Nurse Routes */}
          <Route path="/nurse/dashboard" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/availability" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseAvailabilityPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/appointments" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/profile" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/indemnity" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseIndemnityPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/consultation/:bookingId" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseConsultationPage />
            </ProtectedRoute>
          } />

          {/* Nurse Health Records Routes */}
          <Route path="/nurse/patients/:patientId/records" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NursePatientRecordsPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients/:patientId/records/upload" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseRecordUploadPage />
            </ProtectedRoute>
          } />

          {/* Nurse Meal Plans Routes */}
          <Route path="/nurse/meal-plans" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseMealPlansPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/meal-plans/:planId/assign" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseMealPlanAssignPage />
            </ProtectedRoute>
          } />

          {/* Nurse Education Routes */}
          <Route path="/nurse/education" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseEducationPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/education/create" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseEducationCreatePage />
            </ProtectedRoute>
          } />

          {/* Nurse AI Routes */}
          <Route path="/nurse/ai/conversations" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseAIConversationsPage />
            </ProtectedRoute>
          } />
          <Route path="/nurse/ai/conversations/:conversationId" element={
            <ProtectedRoute allowedRoles={['nurse']}>
              <NurseAIConversationDetailPage />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
