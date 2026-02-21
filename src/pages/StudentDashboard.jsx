import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
    Home, BookOpen, MessageSquare, Video, FileText, TrendingUp, Settings,
    LogOut, Menu, X, Clock, Award, Flame, Target, BarChart3, Calendar,
    ChevronRight, Play, CheckCircle2, Lock, GraduationCap, Mic, Sparkles, Send,
    User, Mail, Camera, Shield, Save, Loader2, CreditCard, History, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StudentChatHistory from './StudentChatHistory';

// --- Student Sections ---

const AIChatHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchUnifiedHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/students/ai-history');
            if (res.data.success) {
                setHistory(res.data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnifiedHistory();
    }, []);

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete this ${item.type === 'voice' ? 'voice' : 'chat'} record?`)) return;
        try {
            const url = item.type === 'voice'
                ? `/students/speaking-history/${item._id}`
                : `/ai-chat/conversations/${item._id}`;

            const res = await api.delete(url);
            if (res.data.success) {
                setHistory(prev => prev.filter(h => h._id !== item._id));
                if (selectedItem?._id === item._id) setSelectedItem(null);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete record.");
        }
    };

    const handleViewDetail = async (item) => {
        setSelectedItem(item);
        if (item.type === 'voice') return;
        
        setDetailLoading(true);
        try {
            const res = await api.get(`/ai-chat/conversations/${item._id}`);
            if (res.data.success) {
                setSelectedItem({ ...item, ...res.data.data });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 text-gray-500 uppercase font-black tracking-widest gap-4">
                <Loader2 className="animate-spin" size={48} />
                Loading AI Discussions...
            </div>
        );
    }

    if (selectedItem) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <button
                    onClick={() => setSelectedItem(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]"
                >
                    <ChevronRight className="rotate-180" size={16} /> Back to Discussions
                </button>

                <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden bg-black/40">
                    <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-indigo-600/10 to-transparent">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                                    {selectedItem.title}
                                </h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">
                                    {new Date(selectedItem.displayDate || selectedItem.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(selectedItem)}
                                className="p-3 bg-white/5 hover:bg-rose-500/20 text-gray-600 hover:text-rose-500 rounded-2xl transition-all border border-white/5 hover:border-rose-500/20"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {selectedItem.type === 'voice' && (
                        <div className="p-6 border-b border-white/5 grid grid-cols-3 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Diversity</div>
                                <div className="text-2xl font-black text-cyan-400">{(selectedItem.lexicalDiversity || 0).toFixed(1)}%</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Sophistication</div>
                                <div className="text-2xl font-black text-emerald-400">{(selectedItem.lexicalSophistication || 0).toFixed(0)}%</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Density</div>
                                <div className="text-2xl font-black text-amber-400">{(selectedItem.lexicalDensity || 0).toFixed(1)}%</div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                        {detailLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <Loader2 className="animate-spin" size={32} />
                                <div className="text-[10px] uppercase tracking-widest text-gray-500">Loading conversation...</div>
                            </div>
                        ) : (
                            <>
                                {selectedItem.type === 'voice' && selectedItem.conversationId?.messages?.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                            <MessageSquare size={12} />
                                            Phase 1: Interactive Scaffolding (Chat History)
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedItem.conversationId.messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                                                        msg.role === 'user'
                                                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100'
                                                            : 'bg-white/5 border border-white/5 text-gray-300'
                                                    }`}>
                                                        <div className="text-[9px] uppercase font-black mb-1.5 opacity-40 flex items-center gap-2">
                                                            {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                                                            {msg.role === 'user' ? 'Student' : 'AI Tutor'} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                                        </div>
                                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                                        {msg.audioUrl && (
                                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                                <audio controls className="w-full h-8">
                                                                    <source src={msg.audioUrl} type="audio/mpeg" />
                                                                </audio>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <hr className="border-white/5 my-8" />
                                    </div>
                                )}

                                {selectedItem.type === 'text' && selectedItem.messages?.length > 0 && (
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                            <MessageSquare size={12} />
                                            Phase 1: Interactive Scaffolding (Chat History)
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedItem.messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                                                        msg.role === 'user'
                                                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100'
                                                            : 'bg-white/5 border border-white/5 text-gray-300'
                                                    }`}>
                                                        <div className="text-[9px] uppercase font-black mb-1.5 opacity-40 flex items-center gap-2">
                                                            {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                                                            {msg.role === 'user' ? 'Student' : 'AI Tutor'} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                                        </div>
                                                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                                        {msg.audioUrl && (
                                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                                <audio controls className="w-full h-8">
                                                                    <source src={msg.audioUrl} type="audio/mpeg" />
                                                                </audio>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedItem.type === 'voice' && selectedItem.transcription && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 flex items-center gap-2">
                                            <Mic size={12} />
                                            Phase 2: Independent Performance (Final Transcript)
                                        </h4>
                                        <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                                            <div className="text-base leading-relaxed">
                                                {selectedItem.highlightedTranscript?.length > 0 ? (
                                                    <div>
                                                        {selectedItem.highlightedTranscript.map((w, i) => (
                                                            <span
                                                                key={i}
                                                                className={`inline-block mr-1 px-1 rounded ${
                                                                    w.type === 'academic' ? 'bg-indigo-500/20 text-indigo-400' :
                                                                    w.type === 'filler' || w.type === 'repetitive' ? 'bg-rose-500/20 text-rose-400' :
                                                                    w.type === 'advanced' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-gray-300'
                                                                }`}
                                                            >
                                                                {w.word}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="italic text-gray-400">"{selectedItem.transcription}"</div>
                                                )}
                                            </div>
                                        </div>

                                        {selectedItem.advancedWords?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {selectedItem.advancedWords.map((word, i) => (
                                                    <span key={i} className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-[10px] text-emerald-300 font-black uppercase tracking-widest border border-emerald-500/10">
                                                        {word}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedItem.type === 'voice' && (selectedItem.audioUrl || selectedItem.audioBase64) && (
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Play size={14} className="text-emerald-500" />
                                            Voice Recording
                                        </div>
                                        <audio controls className="w-full h-10 rounded-lg">
                                            <source src={selectedItem.audioBase64 ? `data:audio/webm;base64,${selectedItem.audioBase64}` : selectedItem.audioUrl} type="audio/webm" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">AI Discussions</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">All your conversations and voice sessions with AI</p>
                </div>

            </div>

            {history.length === 0 ? (
                <div className="glass-card p-20 text-center rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                    <MessageSquare size={64} className="mx-auto mb-6 text-gray-700" />
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">No Discussions Yet</h3>
                    <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">Start a conversation with AI to see your discussion history here.</p>
                    <NavLink to="/lexilearn" className="mt-8 inline-block px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-600/20">Start AI Session</NavLink>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.map((item) => (
                        <div key={item._id} className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:border-red-500/40 transition-all group bg-gradient-to-br from-white/5 to-transparent">
                            <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${
                                                item.type === 'voice'
                                                    ? 'bg-red-600/20 text-red-400 border-red-500/20'
                                                    : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                                {item.type === 'voice' ? <Mic size={28} /> : <MessageSquare size={28} />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-red-400 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">
                                                    {new Date(item.displayDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="p-3 bg-white/5 hover:bg-rose-500/20 text-gray-600 hover:text-rose-500 rounded-2xl transition-all border border-white/5 hover:border-rose-500/20"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {item.type === 'voice' && item.transcription && (
                                        <div className="bg-black/40 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/5 italic text-gray-400 text-sm leading-relaxed relative">
                                            <div className="absolute top-4 right-6 text-red-500/20 hidden md:block"><FileText size={32} /></div>
                                            "{item.transcription.substring(0, 150)}{item.transcription.length > 150 ? '...' : ''}"
                                        </div>
                                    )}

                                    {item.type === 'text' && item.messages && item.messages.length > 0 && (
                                        <div className="bg-black/40 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/5 text-gray-400 text-sm leading-relaxed">
                                            <div className="text-[8px] font-black uppercase tracking-widest mb-2 text-gray-600">Last Message:</div>
                                            {item.messages[item.messages.length - 1]?.content?.substring(0, 150)}{item.messages[item.messages.length - 1]?.content?.length > 150 ? '...' : ''}
                                        </div>
                                    )}

                                    {item.type === 'voice' && item.advancedWords && item.advancedWords.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.advancedWords.slice(0, 5).map((word, i) => (
                                                <span key={i} className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-[10px] text-emerald-300 font-black uppercase tracking-widest border border-emerald-500/10">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="lg:w-80 space-y-4">
                                    {item.type === 'voice' && (
                                        <>
                                            <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 text-center">
                                                <div className="text-4xl font-black text-emerald-400 tracking-tight leading-normal py-1">
                                                    {(item.lexicalSophistication || 0).toFixed(0)}%
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Sophistication</div>
                                            </div>
                                            <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex items-center justify-between">
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Unique Lexicon</div>
                                                <div className="font-black text-white uppercase text-xs">{item.uniqueWordCount || 0} Words</div>
                                            </div>
                                            <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex items-center justify-between">
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Diversity Index</div>
                                                <div className="font-black text-white uppercase text-xs">{(item.lexicalDiversity || 0).toFixed(1)}%</div>
                                            </div>
                                        </>
                                    )}
                                    {item.type === 'text' && (
                                        <div className="bg-white/5 rounded-[1.5rem] p-6 border border-white/5 flex items-center justify-between">
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Messages</div>
                                            <div className="font-black text-white uppercase text-xs">{item.messages?.length || 0} Total</div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleViewDetail(item)}
                                        className={`w-full py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all ${
                                            item.type === 'voice'
                                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30'
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30'
                                        }`}
                                    >
                                        {item.type === 'voice' ? <Mic size={18} /> : <MessageSquare size={18} />}
                                        View Full History
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MyAssignments = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/tasks');
                if (res.data.success) setTasks(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Module Objectives</h1>
                    <p className="text-gray-500 font-medium">Academic speaking tasks assigned by your faculty advisor.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full p-20 flex flex-col items-center gap-4 text-gray-500 uppercase font-black tracking-widest"><Loader2 className="animate-spin" size={48} /> Syncing Syllabus...</div>
                ) : tasks.length === 0 ? (
                    <div className="col-span-full text-center p-20 glass-card rounded-[3rem] border border-white/5">
                        <Target size={64} className="mx-auto mb-6 text-gray-800" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Active Missions</h2>
                        <p className="text-gray-500 font-medium">All assigned curriculum objectives have been met.</p>
                    </div>
                ) : tasks.map(task => (
                    <div key={task._id} className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 hover:border-red-500/30 transition-all flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent hover:scale-[1.02]">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full border border-red-500/10">
                                    {task.timePoint || 'Syllabus Task'}
                                </span>
                                <div className="text-gray-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} /> {task.timeLimit / 60}m limit
                                </div>
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight group-hover:text-red-500 transition-colors leading-tight">{task.title}</h3>
                            <p className="text-gray-500 text-sm font-medium mb-8 line-clamp-3 leading-relaxed">{task.prompt}</p>
                        </div>
                        <button
                            onClick={() => navigate('/lexilearn', { state: { topic: task.title } })}
                            className="w-full py-5 bg-red-600 hover:bg-red-700 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] text-white shadow-2xl shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                            <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform" />
                            Activate Simulation
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LearningHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/students/speaking-history');
                if (res.data.success) setHistory(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-700">
            <h1 className="text-4xl font-black uppercase tracking-tight">Learning History</h1>
            <p className="text-gray-500 font-medium">Complete record of your AI-analyzed academic sessions and linguistic scores.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full p-20 flex flex-col items-center gap-4 text-gray-500 uppercase font-black tracking-widest"><Loader2 className="animate-spin" size={48} /> Decoding Archives...</div>
                ) : history.length === 0 ? (
                    <div className="col-span-full text-center p-20 glass-card rounded-[3rem] border border-white/5">
                        <History size={64} className="mx-auto mb-6 text-gray-800" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Records Found</h2>
                        <p className="text-gray-500 font-medium">Your learning journey begins after your first AI simulation.</p>
                    </div>
                ) : history.map(item => (
                    <div key={item._id} className="glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all bg-gradient-to-br from-white/5 to-transparent hover:scale-[1.02] group">
                        <div className="p-6 md:p-8 border-b border-white/5 bg-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20"><Mic size={24} /></div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-emerald-400 leading-normal py-1">{(item.lexicalSophistication || 0).toFixed(0)}%</div>
                                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Sophistication</div>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-white truncate uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{item.taskId?.title || item.topic || 'General Practice'}</h3>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-gray-500">Lexical Density</span>
                                <span className="text-white">{(item.lexicalDensity || 0).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${item.lexicalDensity || 0}%` }}></div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-2">
                                <span className="text-gray-500">Diversity Index</span>
                                <span className="text-white">{(item.lexicalDiversity || 0).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${item.lexicalDiversity || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Identity = ({ currentUser }) => {
    const { updateUser } = useAuth();
    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || '',
        email: currentUser?.email || '',
        profilePicture: currentUser?.profilePicture || '',
        level: currentUser?.level || 'A1 Beginner'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            const res = await api.put('/students/profile', formData);
            if (res.data.success) {
                // Update global state via AuthContext
                updateUser(formData);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error(err);
            alert("Identification update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Profile Identity</h1>
                <p className="text-gray-500 font-medium">Managing your personal signature within the LinguistX ecosystem.</p>
            </div>

            <div className="glass-card p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent shadow-2xl space-y-8 md:space-y-12">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-indigo-600 rounded-[3rem] blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-black bg-white/5">
                            <img src={formData.profilePicture || `https://ui-avatars.com/api/?name=${formData.fullName}&size=200`} className="w-full h-full object-cover" />
                            <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={32} className="text-white" />
                            </button>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-black uppercase tracking-tight">{currentUser?.fullName}</div>
                        <div className="text-[10px] text-red-500 font-black uppercase tracking-[0.3em]">{currentUser?.role || 'STUDENT'} NODE</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Full Identity Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                            <input
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:border-red-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Communication Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                            <input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:border-red-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Avatar URL Path</label>
                        <div className="relative">
                            <Camera size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                            <input
                                value={formData.profilePicture}
                                onChange={e => setFormData({ ...formData, profilePicture: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:border-red-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-4">Linguistic Certification</label>
                        <div className="relative">
                            <Award size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" />
                            <select
                                value={formData.level}
                                onChange={e => setFormData({ ...formData, level: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-black uppercase tracking-widest focus:border-red-500/50 outline-none transition-all appearance-none"
                            >
                                <option>A1 Beginner</option>
                                <option>A2 Elementary</option>
                                <option>B1 Intermediate</option>
                                <option>B2 Upper Inter</option>
                                <option>C1 Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-white/5 pt-12">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all ${success ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_20px_40px_rgba(220,38,38,0.2)]'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
                        {loading ? 'Transmitting Data...' : success ? 'Identity Updated' : 'Record Identity Changes'}
                    </button>
                    <p className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Global platform synchronization is automatic upon save.</p>
                </div>
            </div>
        </div>
    );
};

const DashboardHome = ({ currentUser, dashboardData }) => {
    const studentProgress = dashboardData?.stats;
    const latestSubmission = dashboardData?.latestSubmission;

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-3 uppercase leading-none">Linguistic Core</h1>
                    <p className="text-gray-500 font-medium text-lg">Synchronizing your real-time English proficiency data.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 text-center bg-gradient-to-br from-orange-500/10 to-transparent hover:scale-105 transition-all group">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Current Streak</div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-500 flex items-center justify-center gap-3 leading-tight py-2">
                            <Flame size={32} fill="currentColor" className="group-hover:animate-bounce" /> {studentProgress?.currentStreak || 0}
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 text-center bg-gradient-to-br from-emerald-500/10 to-transparent hover:scale-105 transition-all group">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Validation Level</div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 flex items-center justify-center gap-2 uppercase leading-tight py-2">
                            <Award size={32} className="group-hover:rotate-12 transition-transform" /> {currentUser?.level?.split(' ')[0] || 'A1'} UNIT
                        </div>
                    </div>
                    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 text-center bg-gradient-to-br from-indigo-500/10 to-transparent hover:scale-105 transition-all group">
                        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Linguistic Density</div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-400 flex items-center justify-center gap-2 leading-tight py-2">
                            <TrendingUp size={32} className="group-hover:translate-y-[-4px] transition-transform" /> {(studentProgress?.avgLexicalDensity || 0).toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 text-indigo-500/10 group-hover:scale-110 transition-transform"><Mic size={120} /></div>
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-600/40">
                            <Mic size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Sonic Fluency</h2>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">AI Oral Analysis Suite</p>
                        </div>
                    </div>
                    {latestSubmission ? (
                        <p className="text-gray-400 mb-10 leading-relaxed font-medium text-lg relative z-10 transition-colors group-hover:text-gray-300">
                            Your latest session analyzed <span className="text-indigo-400 font-black">{latestSubmission.uniqueWordCount} unique lexemes</span>.
                            Averaging <span className="text-emerald-400 font-black">{(studentProgress?.avgLexicalDiversity || 0).toFixed(1)}%</span> diversity.
                            <br /><br />
                            <span className="text-white italic bg-indigo-500/10 px-4 py-2 rounded-xl inline-block border border-indigo-500/10">"{latestSubmission.advice || 'Keep practicing to refine your intonation patterns.'}"</span>
                        </p>
                    ) : (
                        <p className="text-gray-400 mb-10 leading-relaxed font-medium text-lg relative z-10">
                            No oral analysis records found. Initiate a <span className="text-indigo-400 font-black">LexiLearn Phase</span> session to calibrate your linguistic profile.
                        </p>
                    )}
                    <NavLink to="/lexilearn" className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] group/btn relative z-10">
                        Launch Cognitive Practice <ChevronRight size={20} className="group-hover/btn:translate-x-3 transition-transform" />
                    </NavLink>
                </div>

                <div className="glass-card p-10 rounded-[3.5rem] border border-white/5 bg-gradient-to-br from-red-600/10 via-transparent to-transparent hover:border-red-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 text-red-500/10 group-hover:scale-110 transition-transform"><Target size={120} /></div>
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="p-4 bg-red-600 rounded-[1.5rem] shadow-xl shadow-red-600/40">
                            <Target size={32} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Academic Load</h2>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Curriculum Progress Hub</p>
                        </div>
                    </div>
                    <p className="text-gray-400 mb-10 leading-relaxed font-medium text-lg relative z-10">
                        Integration with the <span className="text-red-500 font-black">{currentUser?.level || 'Syllabus'}</span> core is in progress.
                        You have <span className="text-white font-black">{studentProgress?.enrolledModulesCount || 0} modules</span> active in your pedagogical stack.
                    </p>
                    <NavLink to="/student-dashboard/assignments" className="flex items-center gap-3 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] group/btn relative z-10">
                        Access Syllabus <ChevronRight size={20} className="group-hover/btn:translate-x-3 transition-transform" />
                    </NavLink>
                </div>
            </div>

            <div className="glass-card p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tight">Active Certifications</h3>
                    <Award size={24} className="text-gray-700 hidden sm:block" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Lexical Pioneer', 'Fluency Master', '7-Day Streak', 'Vocab Architect'].map(award => (
                        <div key={award} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center flex flex-col items-center gap-3 group hover:bg-white/10 transition-colors">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Award size={24} /></div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{award}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};



// Main Student Dashboard Component
const StudentDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            try {
                const response = await api.get('/students/dashboard');
                if (response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [currentUser]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '', icon: Home, label: 'Core Node' },
        { path: 'ai-discussions', icon: MessageSquare, label: 'AI Discussions' },
        { path: 'chat-history', icon: MessageSquare, label: 'My Conversations' },
        { path: 'assignments', icon: Target, label: 'Curriculum' },
        { path: 'academy', icon: History, label: 'Learning History' },
        { path: 'settings', icon: Settings, label: 'Identity' }
    ];

    if (loading) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="font-black uppercase tracking-[0.4em] text-xs">Synchronizing Core...</div>
        </div>
    );

    const studentProgress = dashboardData?.stats;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-['Outfit','Inter',sans-serif]">
            {/* Sidebar */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-72 md:w-80 bg-black border-r border-white/5 
                transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 md:p-10 border-b border-white/5 mb-6 md:mb-10">
                    <NavLink to="/">
                        <div className="flex items-center gap-5 group cursor-pointer">
                            <div className="w-14 h-14 bg-white rounded-[1.25rem] flex items-center justify-center text-black shadow-2xl shadow-white/10 group-hover:rotate-12 transition-transform">
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <div className="font-black text-2xl tracking-tighter uppercase">LinguistX</div>
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] ml-1 group-hover:text-white transition-colors">Research Node</div>
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
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase">Public Home</span>
                    </NavLink>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={`/student-dashboard/${item.path}`}
                            end={item.path === ''}
                            className={({ isActive }) => `
                                flex items-center gap-5 px-8 py-5 rounded-2xl transition-all duration-500
                                ${isActive
                                    ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] font-black scale-[1.05] -mr-6'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={22} />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-5 px-8 py-5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all w-full border border-red-500/10 group"
                    >
                        <LogOut size={22} className="group-hover:-translate-x-2 transition-transform" />
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Deactivate</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar */}
                <div className="p-4 md:p-10 flex items-center justify-between sticky top-0 bg-black/50 backdrop-blur-3xl z-40 border-b border-white/5">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-3 bg-white/5 rounded-2xl transition-all active:scale-95"><Menu size={20} /></button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="text-right hidden sm:block">
                            <div className="font-black text-sm uppercase tracking-tight line-clamp-1">{currentUser?.fullName}</div>
                            <div className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">{currentUser?.level || 'A1 BEGINNER'} ACCESS</div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                            <img
                                src={currentUser?.profilePicture || `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=random`}
                                className="relative w-10 h-10 md:w-14 md:h-14 rounded-2xl border-2 border-black bg-white/5 shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
                    <Routes>
                        <Route path="/" element={<DashboardHome currentUser={currentUser} dashboardData={dashboardData} />} />
                        <Route path="ai-discussions" element={<AIChatHistory />} />
                        <Route path="chat-history" element={<StudentChatHistory />} />
                        <Route path="assignments" element={<MyAssignments />} />
                        <Route path="academy" element={<LearningHistory />} />
                        <Route path="settings" element={<Identity currentUser={currentUser} />} />
                        <Route path="*" element={<Navigate to="" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
