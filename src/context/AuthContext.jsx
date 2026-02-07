import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setCurrentUser(response.data.data);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { user, accessToken } = response.data.data;
                localStorage.setItem('token', accessToken);
                setCurrentUser(user);
                setIsAuthenticated(true);
                return { success: true, user };
            }
            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Invalid email or password'
            };
        }
    };

    const signup = async (userData) => {
        try {
            const payload = {
                fullName: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'student',
                subject: userData.subject,
                ...(userData.role === 'student' ? { level: 'A1 Beginner' } : {}),
                ...(userData.role === 'teacher' ? { hourlyRate: 0 } : {})
            };

            const response = await api.post('/auth/register', payload);

            if (response.data.success) {
                // Return success but don't authenticate yet
                return { success: true, message: 'Please verify your email.' };
            }
            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('❌ Signup error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword });
            return { success: response.data.success, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to reset password'
            };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            if (response.data.success) {
                const { user, accessToken } = response.data.data;
                localStorage.setItem('token', accessToken);
                setCurrentUser(user);
                setIsAuthenticated(true);
                return { success: true, message: response.data.message };
            }
            return { success: false, error: 'Verification failed' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Verification failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error (ignoring):', error);
        } finally {
            localStorage.removeItem('token');
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (updates) => {
        setCurrentUser(prev => ({ ...prev, ...updates }));
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        signup,
        forgotPassword,
        resetPassword,
        verifyOtp,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
