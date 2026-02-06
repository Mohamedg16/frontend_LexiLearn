import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Lessons from './pages/Lessons';

import LearnLesson from './pages/LearnLesson';
import Videos from './pages/Videos';
import Resources from './pages/Resources';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LexiLearn from './pages/LexiLearn';
import LessonDetails from './pages/LessonDetails';
import AnalysisReflection from './pages/AnalysisReflection';
import AuthRequired from './pages/AuthRequired';


import VerifyOtp from './pages/VerifyEmail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route path="lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
          <Route path="videos" element={<ProtectedRoute><Videos /></ProtectedRoute>} />
          <Route path="resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="lexilearn" element={<ProtectedRoute><LexiLearn /></ProtectedRoute>} />
          <Route path="analysis" element={<ProtectedRoute><AnalysisReflection /></ProtectedRoute>} />

        </Route>

        <Route path="/auth" element={<MainLayout />}>
          <Route index element={<Auth />} />
        </Route>

        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/auth-required" element={<AuthRequired />} />

        {/* Lesson Details Route */}
        <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonDetails /></ProtectedRoute>} />

        {/* Lesson Learning Route */}
        <Route path="/learn/:lessonId" element={<LearnLesson />} />

        {/* Protected Routes - Student Dashboard */}
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Teacher Dashboard */}
        <Route
          path="/teacher-dashboard/*"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
