import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ResetPassword from './components/ResetPassword';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BlogsNew from './pages/BlogsNew';
import BlogView from './pages/BlogView';
import Projects from './pages/Projects';
import Enquiries from './pages/Enquiries';
import Feedback from './pages/Feedback';
import Users from './pages/Users';
import ProjectView from './pages/ProjectView';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show reset password if user is logged in but has firstLogin = true
  if (user && user.firstLogin) {
    return <ResetPassword />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="blogs" element={<BlogsNew />} />
        <Route path="blogs/:id" element={<BlogView />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectView />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="users" element={
          <ProtectedRoute requiredRoles={['superAdmin']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
        <Router>
          <AppContent />
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;