import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
    Home, Users, GraduationCap, BookOpen, DollarSign, BarChart3, Settings,
    LogOut, Menu, X, Search, Plus, Edit, Trash2, Eye, Download, Filter,
    TrendingUp, Clock, Award, AlertCircle, CheckCircle, XCircle, Shield,
    ChevronRight, Play, FileText, Link as LinkIcon, Image as ImageIcon, Video,
    Loader2, Activity, MessageSquare, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { exportToPDF } from '../utils/ExportPDF';


// --- Shared Components for Admin ---

const AdminModal = ({ title, children, onClose, onSave, loading, maxWidth = 'max-w-2xl' }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className={`glass-card w-full ${maxWidth} rounded-3xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]`}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="text-red-500" size={24} /> {title}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {children}
            </div>
            <div className="p-6 border-t border-white/10 bg-black/20 flex gap-4">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold uppercase tracking-widest text-xs">Cancel</button>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>
);

// --- Admin Section Components ---

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [health, setHealth] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, healthRes, logsRes] = await Promise.all([
                    api.get('/admin/statistics/overview'),
                    api.get('/admin/system/health'),
                    api.get('/admin/system/logs')
                ]);

                if (statsRes.data.success) setStats(statsRes.data.data);
                if (healthRes.data.success) setHealth(healthRes.data.data);
                if (logsRes.data.success) setLogs(logsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch admin data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-red-500" size={48} /></div>;
    if (!stats) return <div className="text-center p-12 text-gray-500 font-bold uppercase tracking-[0.2em] border-2 border-dashed border-white/10 rounded-3xl">System Overview Offline</div>;

    const summaryCards = [
        { label: 'English Students', value: stats.totalStudents, icon: Users, color: 'blue', trend: '+12%' },
        { label: 'Teaching Faculty', value: stats.totalTeachers, icon: GraduationCap, color: 'purple', trend: '+5%' },
        { label: 'Active Modules', value: stats.totalModules, icon: BookOpen, color: 'emerald', trend: '+3' },
        { label: 'Academic Lessons', value: stats.totalLessons, icon: AlertCircle, color: 'rose', trend: '+10' },
        { label: 'Real-time Users', value: stats.activeToday, icon: TrendingUp, color: 'cyan', trend: `LIVE` }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 md:gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Command Center</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Global intelligence and platform analytics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center gap-2">
                        <Download size={14} /> Intelligence Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {summaryCards.map((card, index) => (
                    <div key={index} className="glass-card p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent hover:border-white/20 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-3 md:p-4 bg-${card.color}-500/20 rounded-[1.25rem] text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} md:size={28} />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">{card.trend}</span>
                        </div>
                        <div className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 tracking-tight leading-tight py-1">{card.value}</div>
                        <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Content Preview & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Health */}
                {health && (
                    <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 text-white/5 opacity-20 hidden md:block"><Activity size={120} /></div>
                        <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <Activity className="text-indigo-400" size={24} /> System Kernel
                        </h3>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Database Nodes</div>
                                <div className="text-lg md:text-xl font-bold leading-normal py-1">{health.counts.submissions} <span className="text-[9px] md:text-[10px] text-indigo-400 font-black">LOGS</span></div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Compute Uptime</div>
                                <div className="text-lg md:text-xl font-bold leading-normal py-1">{(health.uptime / 3600).toFixed(1)}h</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Memory</div>
                                <div className="text-lg md:text-xl font-bold leading-normal py-1">{(health.memoryUsage.rss / 1024 / 1024).toFixed(0)}MB</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Node</div>
                                <div className="text-base md:text-lg font-bold">{health.nodeVersion}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                        <FileText className="text-red-400" size={24} /> Activity Logs
                    </h3>
                    <div className="space-y-3">
                        {logs.length > 0 ? logs.slice(0, 5).map((log, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 group border-l-2 border-l-red-500">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[8px] md:text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">{log.method}</span>
                                        <span className="text-xs font-bold text-gray-300 truncate max-w-[100px] md:max-w-[150px]">{log.endpoint}</span>
                                    </div>
                                    <div className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                        {log.userId?.fullName || 'SYSTEM'} • {new Date(log.createdAt).toLocaleTimeString()}
                                    </div>
                                </div>
                                <span className={`text-[9px] md:text-[10px] font-black ${log.status < 400 ? 'text-emerald-400' : 'text-rose-500'}`}>{log.status}</span>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-[10px] font-black uppercase text-gray-600 border border-dashed border-white/10 rounded-3xl">No logs discovered</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Users Management Component
const UsersManagement = ({ globalSearch, setGlobalSearch }) => {
    const [filters, setFilters] = useState({ role: 'all', status: 'all' });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // User Control States
    const [selectedUser, setSelectedUser] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (globalSearch) queryParams.append('search', globalSearch);
            if (filters.role !== 'all') queryParams.append('role', filters.role);

            const response = await api.get(`/admin/users?${queryParams.toString()}`);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [globalSearch, filters]);

    const handleDeleteUser = async (userId, name) => {
        if (!window.confirm(`SECURE PROTOCOL: Confirm permanent removal of ${name} and all associated research data?`)) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            alert('Security breach during deletion sequence.');
        }
    };

    const handleUpdateRole = async () => {
        setUpdating(true);
        try {
            await api.put(`/admin/users/${selectedUser._id}`, { role: newRole });
            setIsRoleModalOpen(false);
            fetchUsers();
        } catch (error) {
            alert('Classification update failed.');
        } finally {
            setUpdating(false);
        }
    };

    const handleResetPassword = async () => {
        setUpdating(true);
        try {
            await api.post(`/admin/users/${selectedUser._id}/reset-password`, { password: newPassword });
            setIsPasswordModalOpen(false);
            setNewPassword('');
            alert('Authentication credentials successfully reset.');
        } catch (error) {
            alert('Credential reset failure.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Entity Directory</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Managing global profiles across the English ecosystem.</p>
                </div>
                <div className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                    {users.length} Nodes Indexed
                </div>
            </div>

            <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row gap-4 border border-white/5 shadow-2xl">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search by Email, ID, or Entity Name..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all font-medium"
                    />
                </div>
                <select
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-sm font-bold uppercase tracking-wider text-gray-400"
                >
                    <option value="all">Global Access</option>
                    <option value="student">Students</option>
                    <option value="teacher">Faculty</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
                <div className="min-w-[800px] md:min-w-full">
                    <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="text-left p-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Identity</th>
                                <th className="text-left p-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Classification</th>
                                <th className="text-left p-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Enrollment Date</th>
                                <th className="text-left p-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operational Status</th>
                                <th className="text-right p-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-red-500 mb-4" size={32} /> Synchronizing Directory...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500 font-black uppercase tracking-widest">No matching profiles found</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg" />
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{user.fullName}</div>
                                                    <div className="text-[10px] text-gray-500 font-bold">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <button
                                                onClick={() => { setSelectedUser(user); setNewRole(user.role); setIsRoleModalOpen(true); }}
                                                className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all
                                                ${user.role === 'student' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                                        user.role === 'teacher' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                {user.role}
                                            </button>
                                        </td>
                                        <td className="p-6 text-[10px] font-black text-gray-500 uppercase">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 animate-pulse'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {user.isActive ? 'Optimal' : 'Suspended'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-2 text-gray-500">
                                                <button
                                                    title="Reset Keyphrase"
                                                    onClick={() => { setSelectedUser(user); setIsPasswordModalOpen(true); }}
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:text-cyan-400"
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    title="Delete Entity"
                                                    onClick={() => handleDeleteUser(user._id, user.fullName)}
                                                    className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all border border-red-500/10"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Update Modal */}
            {isRoleModalOpen && (
                <AdminModal title="Update Classification" onClose={() => setIsRoleModalOpen(false)} onSave={handleUpdateRole} loading={updating}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 font-medium">Select a new operational role for <span className="text-white font-bold">{selectedUser.fullName}</span>.</p>
                        <div className="grid grid-cols-3 gap-4">
                            {['student', 'teacher', 'admin'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setNewRole(role)}
                                    className={`py-6 rounded-2xl border transition-all uppercase font-black text-[10px] tracking-widest
                                        ${newRole === role ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}
                                    `}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </AdminModal>
            )}

            {/* Password Reset Modal */}
            {isPasswordModalOpen && (
                <AdminModal title="Credential Reset" onClose={() => setIsPasswordModalOpen(false)} onSave={handleResetPassword} loading={updating}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 font-medium">Define new authentication keyphrase for <span className="text-white font-bold">{selectedUser.fullName}</span>.</p>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="INITIALIZE NEW KEYPHRASE..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all uppercase tracking-widest"
                        />
                        <div className="p-4 bg-red-600/10 rounded-2xl border border-red-500/20 flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0" size={18} />
                            <p className="text-[10px] font-bold text-red-400 leading-relaxed uppercase tracking-wider">Warning: This action will immediately terminate all active sessions for this node.</p>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

// Students Management Component
const StudentsManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/students');
            if (response.data.success) {
                setStudents(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleDeleteStudent = async (student) => {
        if (!window.confirm(`SECURE PROTOCOL: Confirm permanent removal of ${student.userId?.fullName} from the research database?`)) return;
        try {
            await api.delete(`/admin/users/${student.userId?._id}`);
            setStudents(prev => prev.filter(s => s._id !== student._id));
        } catch (error) {
            console.error(error);
            alert("Security breach or system failure during deletion.");
        }
    };

    const handleViewStudent = async (studentId) => {
        try {
            const res = await api.get(`/admin/users/${studentId}`);
            if (res.data.success) {
                setSelectedStudent(res.data.data);
                setViewingStudent(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updatePaymentStatus = async (studentId, status) => {
        try {
            const res = await api.patch(`/admin/students/${studentId}/payment-status`, { status });
            if (res.data.success) {
                setStudents(prev => prev.map(s => s._id === studentId ? { ...s, monthlyPaymentStatus: status, lastPaymentDate: new Date() } : s));
            }
        } catch (error) {
            console.error(error);
            alert("Payment validation failed.");
        }
    };

    const handleExportFinancialPDF = () => {
        const headers = ['Student Name', 'Academic Load', 'Payment Status', 'Last Validated'];
        const data = students.map(s => [
            s.userId?.fullName || 'N/A',
            `${s.totalLessonsCompleted || 0} Lessons Completed`,
            s.monthlyPaymentStatus === 'paid' ? 'AUTHENTICATED' : 'DUES UNPAID',
            s.lastPaymentDate ? new Date(s.lastPaymentDate).toLocaleDateString() : 'NO HISTORY'
        ]);

        exportToPDF({
            title: 'Financial Vault - Student Ledger',
            headers,
            data,
            fileName: 'Financial_Report.pdf',
            statusColumnIndex: 2
        });
    };

    return (

        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Financial Validation</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Monitoring monthly dues and English subscription lifecycle.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportFinancialPDF}
                        className="w-full md:w-auto px-6 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                    >
                        <Download size={14} /> Export PDF
                    </button>
                    <button className="w-full md:w-auto px-6 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all shadow-xl shadow-emerald-600/20">
                        Bulk Validation
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black/40 overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px] md:min-w-full">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Auditor</th>
                            <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Academic Load</th>
                            <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Subscription</th>
                            <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Records</th>
                            <th className="text-right p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500 mb-4" size={48} /> Accessing Financial Vault...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="5" className="p-32 text-center font-black uppercase text-gray-500 tracking-widest">No student transactions discovered</td></tr>
                        ) : students.map(student => (
                            <tr key={student._id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center font-black text-red-500 border border-red-500/20 text-xl shadow-lg">
                                            {student.userId?.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-white text-lg uppercase group-hover:text-red-500 transition-colors tracking-tight">{student.userId?.fullName}</div>
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{student.level} Specialist</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{student.totalLessonsCompleted} Lessons Completed</div>
                                        <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${Math.min(100, student.totalLessonsCompleted * 5)}%` }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${student.monthlyPaymentStatus === 'paid'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                        }`}>
                                        {student.monthlyPaymentStatus === 'paid' ? 'Authenticated' : 'Dues Unpaid'}
                                    </span>
                                </td>
                                <td className="p-8">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Validated</div>
                                    <div className="font-bold text-xs text-white">{student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'NO HISTORY'}</div>
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleViewStudent(student.userId?._id)}
                                            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-gray-400 hover:text-white"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => updatePaymentStatus(student._id, 'paid')}
                                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${student.monthlyPaymentStatus === 'paid' ? 'bg-emerald-600/10 text-emerald-600 cursor-default border border-emerald-600/20 opacity-30 shadow-none' : 'bg-emerald-600 text-white hover:scale-[1.05] shadow-lg shadow-emerald-600/20'}`}
                                            disabled={student.monthlyPaymentStatus === 'paid'}
                                        >
                                            Validate
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student)}
                                            className="p-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl border border-red-500/10 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* View Student Modal */}
            {viewingStudent && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-2xl rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl bg-[#0a0a0a]">
                        <div className="p-12 border-b border-white/5 flex justify-between items-start">
                            <div className="flex gap-6">
                                <img src={selectedStudent.user?.profilePicture || `https://ui-avatars.com/api/?name=${selectedStudent.user?.fullName}&background=random`} className="w-24 h-24 rounded-[2rem] border-4 border-white/5" />
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">{selectedStudent.user?.fullName}</h2>
                                    <p className="text-red-500 font-black uppercase tracking-widest text-xs mt-1">Research Auditor • Level {selectedStudent.roleData?.level || 'N/A'}</p>
                                    <div className="flex gap-2 mt-4">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">{selectedStudent.user?._id}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewingStudent(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-12 grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Vector ID</div>
                                    <div className="font-bold text-white">{selectedStudent.user?.email}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Academic Enlistment</div>
                                    <div className="font-bold text-white">{new Date(selectedStudent.user?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Subscription Lifecycle</div>
                                    <div className={`font-black uppercase tracking-widest text-xs ${selectedStudent.roleData?.monthlyPaymentStatus === 'paid' ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {selectedStudent.roleData?.monthlyPaymentStatus === 'paid' ? 'AUTHENTICATED' : 'ACTION REQUIRED: UNPAID'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Module Saturation</div>
                                    <div className="font-bold text-white">{selectedStudent.roleData?.enrolledModules?.length || 0} Critical Nodes Assigned</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-12 bg-white/[0.02] border-t border-white/5 flex gap-4">
                            <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Download Audit Report</button>
                            <button onClick={() => setViewingStudent(false)} className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Close Dossier</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Teachers Management Component
const TeachersManagement = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMode, setModalMode] = useState(null); // 'add' | 'edit'
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', hourlyRate: 25 });
    const [submitting, setSubmitting] = useState(false);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/teachers');
            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleToggleStatus = async (teacher) => {
        const action = teacher.userId?.isActive ? 'suspend' : 'activate';
        try {
            await api.patch(`/admin/users/${teacher.userId?._id}/${action}`);
            fetchTeachers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTeacher = async (teacher) => {
        if (!window.confirm(`PERMANENT DELETION: Are you sure you want to remove ${teacher.userId?.fullName} from the faculty grid?`)) return;
        try {
            await api.delete(`/admin/users/${teacher.userId?._id}`);
            setTeachers(prev => prev.filter(t => t._id !== teacher._id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'add') {
                await api.post('/admin/teachers', formData);
            } else {
                await api.put(`/admin/users/${selectedTeacher.userId?._id}`, {
                    fullName: formData.fullName,
                    email: formData.email,
                    isActive: selectedTeacher.userId?.isActive,
                    hourlyRate: formData.hourlyRate
                });
            }
            fetchTeachers();
            setModalMode(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Faculty operation failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExportFacultyPDF = () => {
        const headers = ['Faculty Specialist', 'Email', 'Assigned Modules', 'Status'];
        const data = teachers.map(t => [
            t.userId?.fullName || 'N/A',
            t.userId?.email || 'N/A',
            `${t.assignedModules?.length || 0} Modules Assigned`,
            t.userId?.isActive ? 'ACTIVE' : 'OFFLINE'
        ]);

        exportToPDF({
            title: 'Faculty Hub - Academic Roster',
            headers,
            data,
            fileName: 'Faculty_Directory.pdf',
            statusColumnIndex: 3
        });
    };

    return (

        <div className="space-y-8 animate-in slide-in-from-left-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Faculty Hub</h1>
                    <p className="text-gray-500 font-medium">Overseeing academic specialists in the English research grid.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={handleExportFacultyPDF}
                        className="w-full md:w-auto px-6 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/20"
                    >
                        <Download size={14} /> Export PDF
                    </button>
                    <button
                        onClick={() => { setModalMode('add'); setFormData({ fullName: '', email: '', password: '', hourlyRate: 25 }); }}
                        className="px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-purple-600/20"
                    >
                        Onboard Specialist
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black/40">
                <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="text-left p-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Specialist</th>
                            <th className="text-left p-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Load</th>
                            <th className="text-left p-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Operational</th>
                            <th className="text-right p-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan="4" className="p-32 text-center"><Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={48} /> Accessing Faculty Records...</td></tr>
                        ) : teachers.length === 0 ? (
                            <tr><td colSpan="4" className="p-32 text-center font-black uppercase text-gray-500 tracking-widest">No faculty specialists discovered</td></tr>
                        ) : teachers.map(teacher => (
                            <tr key={teacher._id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-5">
                                        <img src={teacher.userId?.profilePicture || `https://ui-avatars.com/api/?name=${teacher.userId?.fullName}&background=random`} className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-lg" />
                                        <div>
                                            <div className="font-black text-white text-lg uppercase group-hover:text-purple-500 transition-colors tracking-tight">{teacher.userId?.fullName}</div>
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{teacher.userId?.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{teacher.assignedModules?.length || 0} Modules Assigned</div>
                                </td>
                                <td className="p-8">
                                    <button
                                        onClick={() => handleToggleStatus(teacher)}
                                        className="flex items-center gap-2 group/status"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${teacher.userId?.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 animate-pulse'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${teacher.userId?.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {teacher.userId?.isActive ? 'ACTIVE' : 'OFFLINE'}
                                        </span>
                                    </button>
                                </td>
                                <td className="p-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setModalMode('edit');
                                                setSelectedTeacher(teacher);
                                                setFormData({ fullName: teacher.userId?.fullName, email: teacher.userId?.email, hourlyRate: teacher.hourlyRate || 25 });
                                            }}
                                            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-gray-400 hover:text-white"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTeacher(teacher)}
                                            className="p-4 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl border border-red-500/10 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Teacher Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="glass-card w-full max-w-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 bg-[#0a0a0a]">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{modalMode === 'add' ? 'Onboard Specialist' : 'Refactor Credentials'}</h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Faculty Registration Protocol</p>
                            </div>
                            <button onClick={() => setModalMode(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Identity</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Dr. Specialist Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Vector Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="faculty@research.grid"
                                />
                            </div>
                            {modalMode === 'add' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Initial Keyphrase (Optional)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        placeholder="Defaults to Faculty2024!"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Research Rate ($/hr)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.hourlyRate}
                                    onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all shadow-xl shadow-purple-600/20 active:scale-95 mt-4"
                            >
                                {submitting ? 'Authenticating...' : modalMode === 'add' ? 'Activate Faculty Node' : 'Synchronize Updates'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Content Management Controller
const ContentManagement = () => {

    const [lessons, setLessons] = useState([]);
    const [videos, setVideos] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('lessons');
    const [modalMode, setModalMode] = useState(null); // 'add-module' | 'edit-module' | 'add-lesson' | 'edit-lesson' | 'add-video' | 'edit-video' | 'add-resource'
    const [selectedItem, setSelectedItem] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadingFile, setUploadingFile] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vidRes, resRes, lessonRes] = await Promise.all([
                api.get('/admin/videos'),
                api.get('/admin/resources'),
                api.get('/lessons')
            ]);
            if (vidRes.data.success) setVideos(vidRes.data.data);
            if (resRes.data.success) setResources(resRes.data.data);
            if (lessonRes.data.success) setLessons(lessonRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const handleOpenAddLesson = () => {
        setFormData({ title: '', description: '', content: '', duration: 15, isPublished: true });
        setModalMode('add-lesson');
    };

    const handleSaveLesson = async () => {
        setActionLoading(true);
        try {
            const payload = { ...formData };

            let lessonId;
            if (modalMode === 'add-lesson') {
                const res = await api.post('/admin/lessons', payload);
                lessonId = res.data.data?._id;
            } else {
                await api.put(`/admin/lessons/${selectedItem._id}`, payload);
                lessonId = selectedItem._id;
            }

            if (uploadFile) {
                setUploadingFile(true);
                const fileData = new FormData();
                fileData.append('file', uploadFile);
                const uploadRes = await api.post('/upload', fileData);

                if (uploadRes.data.success) {
                    await api.post('/admin/resources', {
                        title: `${payload.title || formData.title} - Technical Payload`,
                        type: 'pdf',
                        url: uploadRes.data.data.url,
                        lessonId: lessonId
                    });
                }
            }

            fetchData();
            setModalMode(null);
            setUploadFile(null);
        } catch (error) {
            console.error('Lesson Save Error:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message;
            alert(`Linguistic node synchronization failed: ${errorMsg}`);
        } finally {
            setActionLoading(false);
            setUploadingFile(false);
        }
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Erase this educational node permanently?')) return;
        try {
            await api.delete(`/admin/lessons/${id}`);
            setLessons(prev => prev.filter(l => l._id !== id));
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenAddVideo = () => {
        setFormData({ title: '', description: '', youtubeUrl: '', category: 'General', views: 0 });
        setModalMode('add-video');
    };

    const handleOpenEditVideo = (vid) => {
        setFormData({ ...vid });
        setModalMode('edit-video');
        setSelectedItem(vid);
    };

    const handleSaveVideo = async () => {
        setActionLoading(true);
        try {
            if (modalMode === 'add-video') {
                await api.post('/admin/videos', formData);
            } else {
                await api.put(`/admin/videos/${selectedItem._id}`, formData);
            }
            fetchData();
            setModalMode(null);
        } catch (error) {
            console.error(error);
            alert('Video operation failed.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteVideo = async (id) => {
        if (!window.confirm('Delete this video asset?')) return;
        try {
            await api.delete(`/admin/videos/${id}`);
            setVideos(prev => prev.filter(v => v._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenAddResource = (lesson = null) => {
        setFormData({ title: '', type: 'pdf', url: '', lessonId: lesson?._id || '', description: '', category: 'General' });
        setUploadFile(null);
        setModalMode('add-resource');
        setSelectedItem(null);
    };

    const handleOpenEditResource = (res) => {
        setFormData({
            title: res.title,
            type: res.type,
            url: res.url,
            lessonId: res.lessonId?._id || res.lessonId || '',
            description: res.description || '',
            category: res.category || 'General'
        });
        setSelectedItem(res);
        setUploadFile(null);
        setModalMode('edit-resource');
    };

    const handleSaveResource = async () => {
        setActionLoading(true);
        try {
            let finalFormData = { ...formData };

            if (uploadFile) {
                setUploadingFile(true);
                const uploadData = new FormData();
                uploadData.append('file', uploadFile);

                const uploadRes = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data.success) {
                    finalFormData.url = uploadRes.data.data.url;
                }
            }

            if (modalMode === 'add-resource') {
                await api.post('/admin/resources', finalFormData);
            } else {
                await api.put(`/admin/resources/${selectedItem._id}`, finalFormData);
            }
            fetchData();
            setModalMode(null);
            setUploadFile(null);
        } catch (error) {
            console.error(error);
            alert('Resource operation failed.');
        } finally {
            setActionLoading(false);
            setUploadingFile(false);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm('Purge this resource from curriculum?')) return;
        try {
            await api.delete(`/admin/resources/${id}`);
            setResources(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Curriculum Architect</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Building and refining English pedagogical structures.</p>
                </div>
                <div className="flex gap-2 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`px-6 md:px-8 py-3 rounded-[1.25rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'videos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'text-gray-500 hover:text-white'}`}
                    >
                        Video Assets
                    </button>
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={`px-6 md:px-8 py-3 rounded-[1.25rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'lessons' ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'text-gray-500 hover:text-white'}`}
                    >
                        Lessons
                    </button>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`px-6 md:px-8 py-3 rounded-[1.25rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'resources' ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'text-gray-500 hover:text-white'}`}
                    >
                        Resource Library
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 text-gray-500 uppercase font-black tracking-widest gap-4">
                    <Loader2 className="animate-spin" size={48} />
                    Decoding Curriculum...
                </div>
            ) : activeTab === 'videos' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <button
                        onClick={handleOpenAddVideo}
                        className="glass-card p-10 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 text-gray-500 hover:border-red-500/50 hover:text-red-400 transition-all group min-h-[320px] bg-gradient-to-br from-white/5 to-transparent hover:scale-[1.02]"
                    >
                        <div className="p-6 rounded-full bg-white/5 group-hover:bg-red-600/10 transition-colors">
                            <Plus size={32} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Deploy New Asset</span>
                    </button>
                    {videos.map(vid => {
                        const videoId = vid.youtubeUrl.includes('=') ? vid.youtubeUrl.split('=')[1].split('&')[0] : vid.youtubeUrl.split('/').pop();
                        const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                        return (
                            <div key={vid._id} className="glass-card rounded-[3rem] overflow-hidden group hover:scale-[1.02] transition-all relative bg-black/40">
                                {/* Dynamic Background */}
                                <div
                                    className="absolute inset-0 opacity-10 blur-[80px] pointer-events-none group-hover:opacity-20 transition-opacity duration-700"
                                    style={{
                                        backgroundImage: `url(${thumbUrl})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />
                                <div className="aspect-video relative overflow-hidden z-10">
                                    <img
                                        src={thumbUrl}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="p-4 rounded-full bg-red-600 text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase text-gray-400 tracking-widest">{vid.category}</div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenEditVideo(vid)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"><Edit size={14} /></button>
                                            <button onClick={() => handleDeleteVideo(vid._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-red-500 transition-colors">{vid.title}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : activeTab === 'lessons' ? (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Lesson Registry</div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', description: '', isPublished: true });
                                setModalMode('add-lesson');
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Add New Lesson
                        </button>
                    </div>

                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black/40 overflow-x-auto no-scrollbar">
                        <table className="w-full min-w-[800px] md:min-w-full">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Lesson Architecture</th>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Description Flow</th>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Payload Metadata</th>
                                    <th className="text-right p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {lessons.length === 0 ? (
                                    <tr><td colSpan="4" className="p-32 text-center font-black uppercase text-gray-500 tracking-widest">No syllabus nodes discovered</td></tr>
                                ) : lessons.map(lesson => (
                                    <tr key={lesson._id} className="hover:bg-white/[0.02] transition-colors group text-sm">
                                        <td className="p-6 md:p-8">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-6 h-6 md:w-8 md:h-8 shrink-0 rounded-lg bg-red-600/10 flex items-center justify-center font-black text-[9px] md:text-xs text-red-500 border border-red-500/20">
                                                    {lesson.order || 1}
                                                </div>
                                                <div className="font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors text-xs md:text-sm break-words max-w-[150px] md:max-w-none">{lesson.title}</div>
                                            </div>
                                        </td>
                                        <td className="p-6 md:p-8">
                                            <p className="text-gray-500 line-clamp-1 max-w-[150px] md:max-w-xs">{lesson.description}</p>
                                        </td>
                                        <td className="p-6 md:p-8">
                                            <div className="flex gap-2">
                                                {lesson.videoUrl && <Play size={14} className="text-red-500" />}
                                                {lesson.resources?.length > 0 && <FileText size={14} className="text-emerald-500" />}
                                                <span className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase whitespace-nowrap">{lesson.resources?.length || 0} Files</span>
                                            </div>
                                        </td>
                                        <td className="p-6 md:p-8 text-right">
                                            <div className="flex justify-end gap-2 md:gap-3">
                                                <button
                                                    onClick={() => {
                                                        setFormData({ ...lesson });
                                                        setSelectedItem(lesson);
                                                        setModalMode('edit-lesson');
                                                    }}
                                                    className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                                                >
                                                    <Edit size={14} md:size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenAddResource(lesson)}
                                                    className="p-2 md:p-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl border border-emerald-500/10 transition-all font-bold"
                                                >
                                                    <Plus size={14} md:size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson._id)}
                                                    className="p-2 md:p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl border border-red-500/10 transition-all"
                                                >
                                                    <Trash2 size={14} md:size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'resources' ? (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Resource Library</div>
                        <button
                            onClick={() => {
                                setFormData({ title: '', type: 'link', url: '', description: '', category: 'General' });
                                setUploadFile(null);
                                setModalMode('add-resource');
                                setSelectedItem(null);
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Add New Resource
                        </button>
                    </div>
                    <div className="glass-card rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black/40 overflow-x-auto no-scrollbar">
                        <table className="w-full min-w-[800px] md:min-w-full">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Asset Title</th>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Format</th>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Origin Lesson</th>
                                    <th className="text-left p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Retrieval Data</th>
                                    <th className="text-right p-6 md:p-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {resources.length === 0 ? (
                                    <tr><td colSpan="5" className="p-32 text-center font-black uppercase text-gray-500 tracking-widest">No pedagogical assets registered</td></tr>
                                ) : resources.map(res => (
                                    <tr key={res._id} className="hover:bg-white/[0.02] transition-colors group text-sm">
                                        <td className="p-8 font-black uppercase tracking-tight group-hover:text-red-500 transition-colors">{res.title}</td>
                                        <td className="p-8">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{res.type}</span>
                                        </td>
                                        <td className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">{res.lessonId?.title || 'GLOBAL ASSET'}</td>
                                        <td className="p-8 font-mono text-[10px] text-gray-600">{res.url?.substring(0, 30)}...</td>
                                        <td className="p-8 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenEditResource(res)}
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResource(res._id)}
                                                    className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl border border-red-500/10 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {/* Modals */}
            {modalMode && modalMode.includes('lesson') && (
                <AdminModal
                    title={modalMode === 'add-lesson' ? 'Create New Lesson' : 'Edit Lesson'}
                    onClose={() => setModalMode(null)}
                    onSave={handleSaveLesson}
                    loading={actionLoading}
                    maxWidth="max-w-xl"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Title</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-32 text-sm font-medium"
                            />
                        </div>
                    </div>
                </AdminModal>
            )}

            {modalMode && modalMode.includes('video') && (
                <AdminModal
                    title={modalMode === 'add-video' ? 'Architect New Video Asset' : 'Reconfigure Video Asset'}
                    onClose={() => setModalMode(null)}
                    onSave={handleSaveVideo}
                    loading={actionLoading}
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Broadcast Title</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-red-500/50 outline-none font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Linguistic Category</label>
                                <input
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-red-500/50 outline-none font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Asset URL (YouTube ID)</label>
                                <input
                                    value={formData.youtubeUrl}
                                    onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    placeholder="e.g. dQw4w9WgXcQ"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-red-500/50 outline-none font-mono text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Objective Summary</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:border-red-500/50 outline-none h-32 text-sm font-medium"
                            />
                        </div>
                    </div>
                </AdminModal>
            )}

            {(modalMode === 'add-resource' || modalMode === 'edit-resource') && (
                <AdminModal
                    title={modalMode === 'add-resource' ? 'Add New Resource' : 'Update Resource'}
                    onClose={() => setModalMode(null)}
                    onSave={handleSaveResource}
                    loading={actionLoading}
                    maxWidth="max-w-xl"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Resource Title</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Link (URL)</label>
                            <div className="relative">
                                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" />
                                <input
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 font-mono text-xs"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                </AdminModal>
            )}
        </div>
    );
};

const Statistics = () => (
    <div className="glass-card p-16 rounded-[4rem] text-center border border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent animate-pulse">
        <BarChart3 size={64} className="mx-auto text-indigo-500 mb-8" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Deep Data Lab</h1>
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Linguistic trend synchronization in progress...</p>
    </div>
);

const AdminSettings = () => (
    <div className="glass-card p-16 rounded-[4rem] text-center border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
        <Settings size={64} className="mx-auto text-red-500 mb-8" />
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Global Matrix</h1>
        <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Architectural core settings protected.</p>
    </div>
);

// Messages Management Component
const MessagesManagement = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, read, unread

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { isRead: filter === 'read' } : {};
            const res = await api.get('/admin/messages', { params });
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await api.delete(`/admin/messages/${id}`);
            setMessages(messages.filter(msg => msg._id !== id));
        } catch (error) {
            console.error('Failed to delete message:', error);
            alert('Failed to delete message');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/admin/messages/${id}/read`);
            setMessages(messages.map(msg =>
                msg._id === id ? { ...msg, isRead: true } : msg
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Contact Messages</h1>
                    <p className="text-gray-500 font-medium">Manage incoming messages from the contact form.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto p-1 bg-white/5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap ${filter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        All ({messages.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap ${filter === 'unread'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-4 md:px-6 py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all whitespace-nowrap ${filter === 'read'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        Read
                    </button>
                </div>
            </div>

            {messages.length === 0 ? (
                <div className="glass-card p-20 rounded-[3rem] text-center border border-white/5">
                    <MessageSquare size={64} className="mx-auto text-gray-700 mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2">No Messages</h3>
                    <p className="text-gray-500 font-medium">No contact messages found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`glass-card p-8 rounded-[2.5rem] border transition-all hover:border-purple-500/30 ${msg.isRead ? 'border-white/5 bg-white/[0.02]' : 'border-purple-500/20 bg-purple-500/5'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${msg.isRead ? 'bg-white/5' : 'bg-purple-500/20'
                                            }`}>
                                            <Mail size={24} className={msg.isRead ? 'text-gray-400' : 'text-purple-400'} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black tracking-tight">{msg.name}</h3>
                                            <a
                                                href={`mailto:${msg.email}`}
                                                className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium flex items-center gap-2"
                                            >
                                                <Mail size={14} />
                                                {msg.email}
                                            </a>
                                        </div>
                                        {!msg.isRead && (
                                            <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className="pl-20">
                                        <p className="text-gray-300 leading-relaxed">{msg.message}</p>
                                    </div>

                                    {/* Footer */}
                                    <div className="pl-20 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                        <div className="flex gap-3">
                                            {!msg.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(msg._id)}
                                                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={14} />
                                                    Mark as Read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PaymentsManagement = () => (
    <div className="space-y-8 animate-in delay-150 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-10 rounded-[3rem] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={120} />
                </div>
                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Monthly Ecosystem Flow</div>
                <div className="text-6xl font-black tracking-tighter mb-6">$12,480</div>
                <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle size={16} /> Validation Rate: 98.4%
                </div>
            </div>
            <div className="glass-card p-10 rounded-[3rem] border border-red-500/10 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award size={120} />
                </div>
                <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Prime Subscriptions</div>
                <div className="text-6xl font-black tracking-tighter mb-6">42 ACTIVE</div>
                <div className="flex items-center gap-2 text-red-400 font-black text-[10px] uppercase tracking-widest">
                    <AlertCircle size={16} /> Projected: $14,000
                </div>
            </div>
        </div>
    </div>
);

// Main Admin Dashboard Component
const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleGlobalSearch = (e) => {
        const val = e.target.value;
        setGlobalSearch(val);
        if (window.location.pathname !== '/admin/users') {
            navigate('/admin/users');
        }
    };

    const navItems = [
        { path: '', icon: Home, label: 'Central Core' },
        { path: 'users', icon: Users, label: 'Profile Directory' },
        { path: 'students', icon: GraduationCap, label: 'Financial Vault' },
        { path: 'teachers', icon: Shield, label: 'Faculty Hub' },
        { path: 'content', icon: BookOpen, label: 'Curriculum Ops' },
        { path: 'messages', icon: MessageSquare, label: 'Messages' },
        { path: 'settings', icon: Settings, label: 'System Kernel' }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-['Outfit','Inter',sans-serif]">
            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-80 bg-black border-r border-white/5 
                transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-10 border-b border-white/5 mb-10">
                    <NavLink to="/">
                        <div className="flex items-center gap-5 group cursor-pointer">
                            <div className="w-14 h-14 bg-red-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-red-600/40 border border-white/10 group-hover:rotate-12 transition-transform">
                                <Shield size={32} />
                            </div>
                            <div>
                                <div className="font-black text-2xl tracking-tighter">ADMINX</div>
                                <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em] ml-1 group-hover:text-white transition-colors">Command</div>
                            </div>
                        </div>
                    </NavLink>
                </div>

                <nav className="p-8 space-y-3">
                    <NavLink
                        to="/"
                        className="flex items-center gap-5 px-8 py-5 rounded-2xl transition-all duration-500 text-gray-500 hover:text-white hover:bg-white/5"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Home size={22} />
                        <span className="text-xs font-black tracking-[0.2em] uppercase">Public Home</span>
                    </NavLink>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={`/admin/${item.path}`}
                            end={item.path === ''}
                            className={({ isActive }) => `
                                flex items-center gap-5 px-8 py-5 rounded-2xl transition-all duration-500
                                ${isActive
                                    ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black scale-[1.05] -mr-4'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={22} />
                            <span className="text-xs font-black tracking-[0.2em] uppercase">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-5 px-8 py-5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all w-full border border-red-500/10 group overflow-hidden relative"
                    >
                        <LogOut size={22} className="relative z-10 group-hover:-translate-x-2 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] relative z-10">Deactivate</span>
                        <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <div className="p-10 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-3xl sticky top-0 z-40">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-3 bg-white/5 rounded-2xl"><Menu size={24} /></button>
                    <div className="flex-1 px-8 hidden md:block">
                        <div className="relative max-w-lg group">
                            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                value={globalSearch}
                                onChange={handleGlobalSearch}
                                placeholder="ACCESS PLATFORM RECORDS..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-red-500/30 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right hidden md:block">
                            <div className="font-black text-sm uppercase tracking-tight">{currentUser?.fullName}</div>
                            <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">Super-Privileged Node</div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                            <img
                                src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=random`}
                                className="relative w-14 h-14 rounded-2xl border-2 border-black bg-white/5"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-10 overflow-y-auto max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<DashboardOverview />} />
                        <Route path="/users" element={<UsersManagement globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />} />
                        <Route path="/students" element={<StudentsManagement />} />
                        <Route path="/teachers" element={<TeachersManagement />} />
                        <Route path="/content" element={<ContentManagement />} />
                        <Route path="/messages" element={<MessagesManagement />} />
                        <Route path="/payments" element={<PaymentsManagement />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/settings" element={<AdminSettings />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
