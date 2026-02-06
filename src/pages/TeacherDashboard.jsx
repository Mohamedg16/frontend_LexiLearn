import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
    Home, Users, BarChart3, BookOpen, MessageSquare, Settings,
    LogOut, Menu, X, Search, Filter, Download, TrendingUp, Clock,
    Award, Target, Eye, ChevronRight, Calendar, Activity,
    FileText, Video, Plus, Trash2, Edit, Upload, Image as ImageIcon,
    Link as LinkIcon, ChevronDown, ChevronUp, PlayCircle, CheckCircle, Mic, Sparkles, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SpeechAssessments from '../components/Teacher/SpeechAssessments';
import SpeakingTasksManager from '../components/Teacher/SpeakingTasksManager';
import AIConversationsLog from '../components/Teacher/AIConversationsLog';

// Dashboard Home Component
const TeacherDashboardHome = ({ stats }) => {
    const dashboardStats = [
        { label: 'Assigned Students', value: stats?.studentsCount || 0, icon: Users, color: 'indigo' },
        { label: 'Speaking Sessions', value: stats?.speakingSessionsCount || 0, icon: Mic, color: 'rose' },
        { label: 'Active Cohort', value: stats?.activeCohortCount || 0, icon: TrendingUp, color: 'emerald' },
        { label: 'Active Tasks', value: stats?.activeTasksCount || 0, icon: Target, color: 'amber' }
    ];

    const colorMap = {
        indigo: 'bg-indigo-500/20 text-indigo-400',
        rose: 'bg-rose-500/20 text-rose-400',
        emerald: 'bg-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/20 text-amber-400'
    };

    if (!stats) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">Faculty Overview</h1>
                    <p className="text-gray-400 font-medium">Monitoring linguistic data and student proficiency.</p>
                </div>
                <div className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20 flex items-center gap-2">
                    <Sparkles size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Academic Year 2024</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                    <div key={index} className="glass-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${colorMap[stat.color]}`}>
                                <stat.icon size={24} />
                            </div>
                            <TrendingUp size={16} className="text-emerald-500" />
                        </div>
                        <div className="text-3xl font-black mb-1 leading-normal py-1 overflow-visible">{stat.value}</div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-purple-600/10 to-transparent">
                    <h3 className="text-xl font-bold mb-6">Research Quick Access</h3>
                    <div className="grid grid-cols-2 gap-4">

                        <NavLink to="/teacher-dashboard/speech-assessments" className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                            <Mic size={24} className="text-rose-400 mb-2" />
                            <div className="font-bold text-sm">Speech Data</div>
                        </NavLink>
                    </div>
                </div>

                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-emerald-600/10 to-transparent">
                    <h3 className="text-xl font-bold mb-6">Analytic Insights</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Linguistic diversity across your assigned modules has increased by <span className="text-emerald-400 font-bold">12%</span> this month. Review the latest speech assessments for A2 students.
                    </p>
                    <NavLink to="/teacher-dashboard/analytics" className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
                        View Research Analytics <ChevronRight size={14} />
                    </NavLink>
                </div>
            </div>
        </div>
    );
};



// Analytics Suite Component
const AnalyticsSuite = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/teachers/analytics');
                if (res.data.success) setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="text-center p-20 flex flex-col items-center justify-center gap-6 text-gray-500 uppercase font-black tracking-[0.3em] min-h-[400px]">
            <Activity className="animate-pulse text-indigo-500" size={64} />
            <div className="space-y-2">
                <div>Synthesizing Linguistic Data Hub...</div>
                <div className="text-[8px] text-gray-700">Verifying Cohort Telemetry</div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Research Analytics</h1>
                    <p className="text-gray-500 font-medium">Aggregate linguistic proficiency data across all student nodes.</p>
                </div>
                <div className="bg-indigo-600/10 text-indigo-400 px-6 py-3 rounded-2xl border border-indigo-500/10 flex items-center gap-2">
                    <Activity size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Telemetry</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Mean Sophistication</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight py-2">{data?.overview?.avgSophistication}%</div>
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <TrendingUp size={14} /> +2.4% vs last cycle
                        </div>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-rose-500/5 group-hover:scale-110 transition-transform"><Sparkles size={120} /></div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Mean Density</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight py-2">{data?.overview?.avgDensity}%</div>
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Density Saturation</div>
                    </div>
                </div>
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:scale-110 transition-transform"><CheckCircle size={120} /></div>
                    <div className="relative z-10">
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Lexical Diversity</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 leading-tight py-2">{data?.overview?.avgDiversity}%</div>
                        <div className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} /> {data?.overview?.activeCohortCount} Active Student Nodes
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 bg-black/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-white/5"><BarChart3 size={160} /></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-12 uppercase tracking-tight flex items-center gap-3">
                        <Activity className="text-indigo-400" size={24} />
                        Linguistic Pulse: Interaction Frequency
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-6 px-4">
                        {data?.interactionFrequency?.length > 0 ? (
                            data.interactionFrequency.map((day, i) => {
                                const maxCount = Math.max(...data.interactionFrequency.map(d => d.count), 1);
                                const height = (day.count / maxCount) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-6 group">
                                        <div className="w-full relative flex-1 flex flex-col justify-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-2xl group-hover:from-emerald-500 group-hover:to-emerald-400 transition-all relative shadow-2xl shadow-indigo-600/20 animate-in slide-in-from-bottom duration-1000"
                                                style={{
                                                    height: `${height}%`,
                                                    minHeight: '8px',
                                                    transitionDelay: `${i * 100}ms`
                                                }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                                                    <div className="bg-white text-black px-4 py-2 rounded-xl shadow-2xl flex flex-col items-center min-w-[80px]">
                                                        <span className="text-[14px] font-black">{day.count}</span>
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Sessions</span>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{day.day}</span>
                                            <div className={`w-1 h-1 rounded-full ${day.count > 0 ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <Activity size={48} className="text-indigo-500/20" />
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Awaiting Linguistic Pulse</div>
                                    <div className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">Active nodes listening for student engagement</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
            <div className="space-y-3">
                <div className="h-10 w-64 bg-white/5 rounded-xl"></div>
                <div className="h-4 w-96 bg-white/5 rounded-lg"></div>
            </div>
            <div className="h-10 w-40 bg-white/5 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card p-6 rounded-[2rem] border border-white/5 h-40 bg-white/5"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 h-64 bg-white/5"></div>
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 h-64 bg-white/5"></div>
        </div>
    </div>
);

// Faculty Settings Component
const FacultySettings = ({ currentUser }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black uppercase tracking-tighter">Faculty Configuration</h1>
                <p className="text-gray-500 font-medium">Verifying and updating your academic presence within FacultyX.</p>
            </div>

            <div className="glass-card p-16 rounded-[4rem] border border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent flex flex-col items-center text-center shadow-2xl">
                <div className="relative group mb-12">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-rose-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative w-40 h-40 rounded-[3rem] overflow-hidden border-4 border-black bg-white/5">
                        <img src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=random`} className="w-full h-full object-cover" />
                    </div>
                </div>

                <h2 className="text-3xl font-black uppercase mb-2 tracking-tight">{currentUser?.fullName}</h2>
                <div className="flex items-center gap-3 mb-12">
                    <Shield size={16} className="text-emerald-400" />
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Credentials Active & Verified</p>
                </div>

                <div className="w-full space-y-6">
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Faculty Vector ID</div>
                            <div className="font-bold text-gray-200">{currentUser?.email}</div>
                        </div>
                        <Edit size={20} className="text-gray-700 group-hover:text-white transition-colors cursor-pointer" />
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Linguistic Authority</div>
                            <div className="font-bold text-gray-200">Senior Academic Lead</div>
                        </div>
                        <Award size={24} className="text-indigo-500" />
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Access Protocol</div>
                            <div className="font-bold text-gray-200">X-Level Encryption</div>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    </div>
                </div>

                <div className="w-full pt-12 mt-12 border-t border-white/5">
                    <button className="w-full py-6 bg-white text-black hover:bg-gray-200 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] transition-all shadow-xl shadow-white/5 active:scale-95">
                        Synchronize Signature Updates
                    </button>
                    <p className="mt-6 text-[10px] text-gray-600 font-black uppercase tracking-widest">Manual updates require biometric re-validation.</p>
                </div>
            </div>
        </div>
    );
};

// Main Teacher Dashboard Component
const TeacherDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            try {
                // Single optimized call for all initial data
                const res = await api.get('/teachers/init');
                if (res.data.success && isMounted) {
                    setDashboardData(res.data.data);
                    setStats(res.data.data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch teacher init data:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '', icon: Home, label: 'Overview' },
        { path: 'speaking-tasks', icon: BookOpen, label: 'Manage Tasks' },
        { path: 'speech-assessments', icon: Mic, label: 'Speech Data' },
        { path: 'ai-logs', icon: MessageSquare, label: 'AI Logs' },

        { path: 'analytics', icon: BarChart3, label: 'Analytic Insights' },
        { path: 'settings', icon: Settings, label: 'Faculty Settings' }
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
            <Activity className="animate-spin text-indigo-600" size={64} />
            <div className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Research Hub...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-['Outfit','Inter',sans-serif]">
            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-white/5 
                transform transition-all duration-500 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 border-b border-white/5 mb-8">
                    <NavLink to="/">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-lg shadow-white/10 group-hover:rotate-12 transition-transform">
                                <Shield size={28} />
                            </div>
                            <div>
                                <div className="font-black text-xl tracking-tighter uppercase">FacultyX</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">Academic Control</div>
                            </div>
                        </div>
                    </NavLink>
                </div>

                <nav className="p-6 space-y-3">
                    <NavLink
                        to="/"
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-gray-500 hover:text-white hover:bg-white/5"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Home size={20} />
                        <span className="text-sm font-bold tracking-wide uppercase">Public Home</span>
                    </NavLink>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={`/teacher-dashboard/${item.path}`}
                            end={item.path === ''}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300
                                ${isActive
                                    ? 'bg-white text-black shadow-2xl shadow-white/10 font-black scale-[1.02]'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }
                            `}
                            onClick={() => {
                                setSidebarOpen(false);
                            }}
                        >
                            <item.icon size={20} />
                            <span className="text-sm font-bold tracking-wide uppercase">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all w-full border border-red-500/10 group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-sm uppercase tracking-widest">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen max-w-7xl mx-auto">
                {/* Top Bar */}
                <div className="p-8 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-white"><Menu size={24} /></button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                            <div className="font-black text-sm uppercase">{currentUser?.fullName || currentUser?.name}</div>
                            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">English Faculty</div>
                        </div>
                        <img
                            src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.fullName || currentUser?.name}&background=random`}
                            className="w-12 h-12 rounded-2xl border-2 border-white/10 bg-white/5"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 pt-0 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<TeacherDashboardHome stats={stats} />} />

                        <Route path="/analytics" element={<AnalyticsSuite />} />
                        <Route path="/speaking-tasks" element={<SpeakingTasksManager />} />
                        <Route path="/speech-assessments" element={<SpeechAssessments />} />
                        <Route path="/ai-logs" element={<AIConversationsLog />} />
                        <Route path="/settings" element={<FacultySettings currentUser={currentUser} />} />
                        <Route path="*" element={<Navigate to="/teacher-dashboard" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
