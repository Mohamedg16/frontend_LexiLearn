import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1a0033] via-[#2d0052] to-[#4a0080] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/auth-required" replace />;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const hasAccess = roles.includes(currentUser.role) || currentUser.role === 'admin';

        if (!hasAccess) {
            if (currentUser.role === 'student') {
                return <Navigate to="/student-dashboard" replace />;
            } else if (currentUser.role === 'teacher') {
                return <Navigate to="/teacher-dashboard" replace />;
            } else if (currentUser.role === 'admin') {
                return <Navigate to="/admin" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;
