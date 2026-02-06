import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp } = useAuth();

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect back to auth
            // navigate('/auth');
        }
    }, [location.state, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setStatus('error');
            setMessage('Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        setStatus('verifying');
        setMessage('Verifying your code...');

        try {
            const result = await verifyOtp(email || location.state?.email, otp);
            if (result.success) {
                setStatus('success');
                setMessage('Your account has been verified! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate('/student-dashboard'); // Redirect to dashboard since they are now logged in
                }, 3000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Invalid verification code.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-10 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="glass max-w-md w-full p-8 md:p-12 rounded-[2.5rem] border border-white/10 text-center shadow-2xl relative z-10">

                {status === 'success' ? (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="flex justify-center">
                            <div className="p-6 bg-emerald-500/20 rounded-full text-emerald-500 shadow-2xl shadow-emerald-500/20">
                                <CheckCircle size={80} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Verified!</h1>
                            <p className="text-gray-400 font-medium">{message}</p>
                        </div>
                        <p className="text-sm text-gray-500">Redirecting you to login...</p>
                        <Link
                            to="/auth"
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-900/40"
                        >
                            Go to Login <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="p-5 bg-indigo-500/20 rounded-3xl text-indigo-400">
                                <ShieldCheck size={48} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Verify Email</h1>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                We've sent a 6-digit verification code to <br />
                                <span className="text-indigo-400 font-bold">{email || 'your email'}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 6) setOtp(val);
                                            if (status === 'error') setStatus('idle');
                                        }}
                                        placeholder="000000"
                                        className={`w-full bg-white/5 border ${status === 'error' ? 'border-rose-500/50' : 'border-white/10'} rounded-2xl py-5 px-4 text-white text-center text-4xl tracking-[0.5em] font-black placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                                        autoFocus
                                    />
                                    {status === 'error' && (
                                        <div className="flex items-center justify-center gap-2 mt-3 text-rose-400 text-sm font-semibold animate-in slide-in-from-top-2 duration-300">
                                            <XCircle size={14} />
                                            <span>{message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-900/40 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale group"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={20} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Account
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="pt-4 flex flex-col gap-4">
                            <button
                                onClick={() => {/* Resend OTP logic could go here */ }}
                                className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Resend Code
                            </button>
                            <Link
                                to="/auth"
                                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-400 transition-colors"
                            >
                                Back to Registration
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyOtp;
