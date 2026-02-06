import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleContactClick = (e) => {
        e.preventDefault();
        setIsOpen(false);
        if (location.pathname === '/') {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/', { state: { scrollToContact: true } });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const getDashboardPath = () => {
        if (!currentUser) return '/auth';
        switch (currentUser.role) {
            case 'student': return '/student-dashboard';
            case 'teacher': return '/teacher-dashboard';
            case 'admin': return '/admin';
            default: return '/auth';
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'LexiLearn', path: '/lexilearn' },
        { name: 'Lessons', path: '/lessons' },
        { name: 'Resources', path: '/resources' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#000428]/80 backdrop-blur-md shadow-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all">
                        <Rocket size={24} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        LexiLearn
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`font-medium transition-colors relative group ${location.pathname === link.path ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-500 transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                                }`} />
                        </Link>
                    ))}
                    <a
                        href="#contact"
                        onClick={handleContactClick}
                        className="text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                        Contact
                    </a>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to={getDashboardPath()}
                                className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2 group"
                            >
                                <User size={16} />
                                Dashboard / Profile
                                {currentUser?.role === 'student' && currentUser?.level && (
                                    <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500 text-[8px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                        {currentUser.level.split(' ')[0]}
                                    </span>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 font-medium hover:bg-red-600/30 transition-all flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/auth" className="px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white font-medium hover:bg-white/20 transition-all transform hover:scale-105 active:scale-95 shadow-lg backdrop-blur-md flex items-center gap-2">
                            <User size={18} />
                            Login/Signup
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#000d33] border-b border-white/10 overflow-hidden backdrop-blur-xl"
                    >
                        <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-lg font-medium transition-colors ${location.pathname === link.path ? 'text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <a
                                href="#contact"
                                onClick={handleContactClick}
                                className="text-lg font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Contact
                            </a>
                            {isAuthenticated ? (
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    <Link
                                        to={getDashboardPath()}
                                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md flex items-center justify-center gap-2 group"
                                    >
                                        <User size={18} />
                                        Dashboard / Profile
                                        {currentUser?.role === 'student' && currentUser?.level && (
                                            <span className="ml-2 px-2 py-0.5 rounded-md bg-white text-indigo-600 text-[8px] font-black uppercase tracking-widest shadow-lg group-hover:scale-110 transition-transform">
                                                {currentUser.level.split(' ')[0]}
                                            </span>
                                        )}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="px-5 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/auth" className="w-full max-w-xs px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md flex items-center justify-center gap-2">
                                    <User size={18} />
                                    Login/Signup
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav >
    );
};

export default Navbar;
