// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './styles/theme';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import Institutions from './pages/Institutions';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import StudentDashboard from './pages/StudentDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PostJob from './pages/PostJob';
import ViewApplicants from './pages/ViewApplicants';

// Institution Pages
import ManageFaculties from './pages/ManageFaculties';
import ManageCourses from './pages/ManageCourses';
import InstitutionApplications from './pages/InstitutionApplications';

// Admin Pages
import AdminUsers from './pages/AdminUsers';
import AdminInstitutions from './pages/AdminInstitutions';
import AdminCompanies from './pages/AdminCompanies';
import AdminReports from './pages/AdminReports';
import AddInstitution from './pages/AddInstitution';
import AddFaculty from './pages/AddFaculty';
import AddCourse from './pages/AddCourse';
import SystemSettings from './pages/SystemSettings';

// NEW PAGES - Add these imports
import About from './pages/About';
import Contact from './pages/Contact';
import Resources from './pages/Resources';
import FAQ from './pages/FAQ';
import Testimonials from './pages/Testimonials';
import Dashboard from './pages/Dashboard'; // This will be the main dashboard

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Dashboard />} /> {/* Changed from redirect to dashboard */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* NEW PUBLIC ROUTES */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/testimonials" element={<Testimonials />} />

              {/* Protected Routes - Using the new Dashboard as main entry */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Role-specific dashboards */}
              <Route path="/student-dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/institution-dashboard" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/company-dashboard" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Nested Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="institutions" element={<AdminInstitutions />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="add-institution" element={<AddInstitution />} />
                <Route path="add-faculty" element={<AddFaculty />} />
                <Route path="add-course" element={<AddCourse />} />
                <Route path="settings" element={<SystemSettings />} />
              </Route>

              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Student Routes */}
              <Route path="/institutions" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Institutions />
                </ProtectedRoute>
              } />

              <Route path="/jobs" element={
                <ProtectedRoute allowedRoles={['student', 'company']}>
                  <Jobs />
                </ProtectedRoute>
              } />

              <Route path="/applications" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Applications />
                </ProtectedRoute>
              } />

              {/* Company Routes */}
              <Route path="/company/jobs" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <PostJob />
                </ProtectedRoute>
              } />

              <Route path="/company/applicants" element={
                <ProtectedRoute allowedRoles={['company']}>
                  <ViewApplicants />
                </ProtectedRoute>
              } />

              {/* Institution Routes */}
              <Route path="/institution/faculties" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <ManageFaculties />
                </ProtectedRoute>
              } />

              <Route path="/institution/courses" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <ManageCourses />
                </ProtectedRoute>
              } />

              <Route path="/institution/applications" element={
                <ProtectedRoute allowedRoles={['institution']}>
                  <InstitutionApplications />
                </ProtectedRoute>
              } />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;