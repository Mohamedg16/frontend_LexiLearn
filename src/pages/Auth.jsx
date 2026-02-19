import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, GraduationCap, BookOpen, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, forgotPassword, resetPassword, isAuthenticated, currentUser } = useAuth();

    const [authMode, setAuthMode] = useState('login'); // login, signup, forgot, reset
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        subject: '',
        agreeToTerms: false,
        otp: '',
        newPassword: ''
    });

    // Pre-select role from location state
    useEffect(() => {
        if (location.state?.preSelectedRole) {
            setFormData(prev => ({ ...prev, role: location.state.preSelectedRole }));
            setAuthMode('signup');
        }
    }, [location.state]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            let redirectPath = '/';
            if (currentUser.role === 'student') redirectPath = '/student-dashboard';
            else if (currentUser.role === 'teacher') redirectPath = '/teacher-dashboard';
            else if (currentUser.role === 'admin') redirectPath = '/admin';

            navigate(redirectPath, { replace: true });
        }
    }, [isAuthenticated, currentUser, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const validateForm = () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

        if (authMode === 'signup') {
            if (!formData.name.trim()) return setError('Full name is required'), false;
            if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
            if (!passwordRegex.test(formData.password)) {
                return setError('Password must be 8+ chars, 1 uppercase, 1 number, 1 special char'), false;
            }
            if (!formData.agreeToTerms) return setError('Please agree to terms'), false;
        }

        if (authMode === 'reset') {
            if (formData.otp.length !== 6) return setError('Invalid OTP code'), false;
            if (!passwordRegex.test(formData.newPassword)) {
                return setError('New password must meet security requirements'), false;
            }
        }

        if (!formData.email.includes('@')) return setError('Invalid email address'), false;
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;
        setLoading(true);

        try {
            if (authMode === 'login') {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    setSuccess('Login successful! Redirecting...');
                } else setError(result.error);
            }
            else if (authMode === 'signup') {
                const result = await signup(formData);
                if (result.success) {
                    setSuccess('Registration successful! Redirecting to your dashboard...');
                    // Note: Redirect will be handled by AuthContext useEffect
                } else setError(result.error);
            }
            else if (authMode === 'forgot') {
                const result = await forgotPassword(formData.email);
                if (result.success) {
                    setSuccess('OTP sent to your email.');
                    setAuthMode('reset');
                } else setError(result.error);
            }
            else if (authMode === 'reset') {
                const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
                if (result.success) {
                    setSuccess('Password reset successful! You can now log in.');
                    setTimeout(() => setAuthMode('login'), 3000);
                } else setError(result.error);
            }
        } catch (err) {
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = (mode) => {
        setAuthMode(mode);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-10 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="glass w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-black/50">

                {/* Left Side - Visual/Info */}
                <div className={`
                    w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between relative transition-all duration-500 ease-in-out
                    ${authMode === 'login' ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40' : 'bg-gradient-to-br from-purple-600/40 to-indigo-600/40'}
                `}>
                    <div className="absolute inset-0 bg-noise opacity-10"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">
                            {authMode === 'login' && 'Welcome Back!'}
                            {authMode === 'signup' && 'Join Us Today'}
                            {authMode === 'forgot' && 'Reset Password'}
                            {authMode === 'reset' && 'Secure Your Account'}
                        </h2>
                        <p className="text-white/80 leading-relaxed text-lg">
                            {authMode === 'login' && 'Unlock your potential with our advanced AI learning tools.'}
                            {authMode === 'signup' && 'Start your journey with the best AI-powered education platform.'}
                            {authMode === 'forgot' && 'Don\'t worry, we\'ll help you get back into your account.'}
                            {authMode === 'reset' && 'Enter the 6-digit code we sent to your email.'}
                        </p>
                    </div>

                    <div className="space-y-6 my-10 relative z-10">
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-indigo-400">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <BookOpen size={24} className="text-indigo-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Personalized Learning</h4>
                                <p className="text-xs text-gray-300">Tailored content just for you</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-purple-400">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <GraduationCap size={24} className="text-purple-300" />
                            </div>
                            <div>
                                <h4 className="font-semibold">AI Integration</h4>
                                <p className="text-xs text-gray-300">Smart tools to boost your skills</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left relative z-10">
                        <p className="text-sm text-gray-300 mb-2">
                            {authMode === 'login' ? "Don't have an account?" : "Ready to sign in?"}
                        </p>
                        <button
                            onClick={() => toggleMode(authMode === 'login' ? 'signup' : 'login')}
                            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-2 rounded-full transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-indigo-500/20 font-medium"
                        >
                            {authMode === 'login' ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 bg-black/20 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                        {authMode === 'login' && 'Sign In'}
                        {authMode === 'signup' && 'Create Account'}
                        {authMode === 'forgot' && 'Forgot Password'}
                        {authMode === 'reset' && 'Reset Password'}
                    </h3>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-300">
                            <AlertCircle size={18} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-300">
                            <ArrowRight size={18} />
                            <span className="text-sm">{success}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {authMode === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">I am a...</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${formData.role === 'student'
                                                ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/20'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <GraduationCap size={24} className={`mx-auto mb-2 ${formData.role === 'student' ? 'text-cyan-400' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${formData.role === 'student' ? 'text-cyan-300' : 'text-gray-300'}`}>Student</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${formData.role === 'teacher'
                                                ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <BookOpen size={24} className={`mx-auto mb-2 ${formData.role === 'teacher' ? 'text-purple-400' : 'text-gray-400'}`} />
                                            <span className={`text-sm font-medium ${formData.role === 'teacher' ? 'text-purple-300' : 'text-gray-300'}`}>Teacher</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {(authMode === 'login' || authMode === 'signup') && (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {authMode === 'signup' && (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {authMode === 'reset' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">6-Digit OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        maxLength="6"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center text-2xl tracking-[1em] font-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                        placeholder="000000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-300 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {authMode === 'signup' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                                />
                                <label htmlFor="terms" className="text-xs text-gray-300">
                                    I agree to the <a href="#" className="text-purple-400 hover:text-purple-300">Terms & Conditions</a>
                                </label>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {authMode === 'login' && 'Sign In'}
                                    {authMode === 'signup' && 'Create Account'}
                                    {authMode === 'forgot' && 'Send OTP Code'}
                                    {authMode === 'reset' && 'Reset Password'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center space-y-2">
                        {authMode === 'login' && (
                            <button
                                onClick={() => toggleMode('forgot')}
                                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        )}
                        {(authMode === 'forgot' || authMode === 'reset') && (
                            <button
                                onClick={() => toggleMode('login')}
                                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                            >
                                ← Back to Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Auth;
