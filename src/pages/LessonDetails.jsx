import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight, Home, BookOpen, PlayCircle,
    FileText, Download, Clock, Loader2,
    CheckCircle2, ArrowLeft, Video, Sparkles
} from 'lucide-react';
import api from '../services/api';

const LessonDetails = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [relatedLessons, setRelatedLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLessonData = async () => {
            setLoading(true);
            try {
                // 1. Fetch current lesson
                const res = await api.get(`/lessons/${lessonId}`);
                if (res.data.success) {
                    const lessonData = res.data.data;
                    setLesson(lessonData);

                    // 2. Fetch related lessons (same module)
                    if (lessonData.moduleId?._id) {
                        const relatedRes = await api.get(`/modules/${lessonData.moduleId._id}/lessons`);
                        if (relatedRes.data.success) {
                            setRelatedLessons(relatedRes.data.data.filter(l => l._id !== lessonId));
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch lesson details:', err);
                setError('Failed to synchronize lesson node. Please verify your connection.');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) fetchLessonData();
    }, [lessonId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
                <Loader2 className="animate-spin text-emerald-500" size={64} />
                <div className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Academic Stream...</div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/5 text-center max-w-lg">
                    <h2 className="text-2xl font-black text-white uppercase mb-4">Node Disconnected</h2>
                    <p className="text-gray-500 mb-8 font-medium">{error || 'The requested lesson payload is unavailable.'}</p>
                    <button onClick={() => navigate('/lessons')} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Return to Inventory</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-6 font-['Outfit']">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-12 bg-white/5 w-fit px-6 py-3 rounded-2xl border border-white/5">
                    <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><Home size={14} /> Home</Link>
                    <ChevronRight size={14} className="opacity-20" />
                    <Link to="/lessons" className="hover:text-emerald-400 transition-colors">Lessons</Link>
                    <ChevronRight size={14} className="opacity-20" />
                    <span className="text-white">{lesson.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Video Layer */}
                        {lesson.videoUrl && (
                            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/5 bg-black relative">
                                <div className="aspect-video">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${lesson.videoUrl.includes('=') ? lesson.videoUrl.split('=')[1] : lesson.videoUrl.split('/').pop()}`}
                                        title={lesson.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="px-5 py-1.5 bg-emerald-600/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                    {lesson.moduleId?.title || 'Academic Unit'}
                                </span>
                                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <Clock size={16} /> {lesson.duration || 15}M Required
                                </div>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">{lesson.title}</h1>
                            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl italic border-l-4 border-emerald-600 pl-8 py-4 bg-white/5 rounded-r-[2rem]">
                                {lesson.description}
                            </p>
                        </div>

                        {/* Lesson Markdown/HTML Content */}
                        <div className="glass-card rounded-[3rem] p-12 border border-white/5 bg-gradient-to-br from-white/5 to-transparent leading-loose text-lg text-gray-300 font-medium space-y-8">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4 mb-8">
                                <FileText className="text-emerald-500" size={28} />
                                Educational Payload
                            </h3>
                            {lesson.content ? (
                                lesson.content.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)
                            ) : (
                                <div className="text-center py-20 opacity-30 uppercase font-black text-xs tracking-widest italic">Supplementary data stream pending.</div>
                            )}
                        </div>

                        {/* Resources Grid */}
                        {lesson.resources && lesson.resources.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {lesson.resources.map((res, i) => (
                                    <div key={i} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm uppercase tracking-tight">{res.title}</h4>
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{res.type} Archive</span>
                                            </div>
                                        </div>
                                        <button onClick={() => window.open(res.url, '_blank')} className="p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: In this Module */}
                    <aside className="space-y-8">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-emerald-600/10 to-transparent sticky top-32">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                                <BookOpen className="text-emerald-500" size={20} />
                                Module Grid
                            </h3>
                            <div className="space-y-4">
                                {relatedLessons.length > 0 ? (
                                    relatedLessons.map((l) => (
                                        <Link
                                            key={l._id}
                                            to={`/lessons/${l._id}`}
                                            className="block p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-gray-600 group-hover:text-emerald-500 transition-colors">
                                                    {l.videoUrl ? <Video size={18} /> : <PlayCircle size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-400 group-hover:text-white transition-colors line-clamp-1">{l.title}</h4>
                                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{l.duration}m Duration</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-[10px] font-black text-gray-700 uppercase tracking-widest">Single Unit Node.</div>
                                )}
                            </div>

                            <button onClick={() => navigate('/lessons')} className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all">
                                <ArrowLeft size={16} /> Back to Catalog
                            </button>
                        </div>

                        {/* AI Support Prompt */}
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-indigo-600/10 to-transparent">
                            <h4 className="text-indigo-400 font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                <Sparkles size={18} /> Neural Assist
                            </h4>
                            <p className="text-xs text-gray-500 font-medium mb-6">Need practice for this module? Activate the AI Speaking Simulation for real-time oral feedback.</p>
                            <button onClick={() => navigate('/lexilearn')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all shadow-xl shadow-indigo-600/20">
                                Launch Simulation
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default LessonDetails;
