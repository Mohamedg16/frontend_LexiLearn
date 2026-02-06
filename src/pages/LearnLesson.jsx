import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle, FileText, Download, Clock, Loader2, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LearnLesson = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [lesson, setLesson] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                // 1. Fetch the main lesson data first
                const lessonRes = await api.get(`/lessons/${lessonId}`);
                if (lessonRes.data.success) {
                    const lessonData = lessonRes.data.data;
                    setLesson(lessonData);

                    // 2. Secondary data (only if student)
                    if (currentUser?.role === 'student' && lessonData.moduleId?._id) {
                        // Parallel fetch for stats and progress (non-critical)
                        try {
                            const [progressRes] = await Promise.all([
                                api.get(`/students/progress/${lessonData.moduleId._id}`)
                            ]);

                            if (progressRes.data.success) {
                                const lessonsCompleted = progressRes.data.data.lessonsCompleted || [];
                                setIsCompleted(lessonsCompleted.some(lc =>
                                    (lc.lessonId?._id || lc.lessonId) === lessonId
                                ));
                            }
                        } catch (secErr) {
                            console.log('Secondary data sync skipped (Expected for new accounts)');
                        }
                    }
                }
            } catch (err) {
                console.error('Core lesson fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) fetchLessonData();
    }, [lessonId, currentUser]);

    const markAsComplete = async () => {
        if (!currentUser || completing) return;
        setCompleting(true);

        try {
            const res = await api.post('/students/progress/lesson-complete', {
                lessonId: lessonId,
                timeSpent: 15 // Mock time spent or calculate it
            });

            if (res.data.success) {
                setIsCompleted(true);
            }
        } catch (err) {
            console.error('Failed to mark lesson complete:', err);
            alert("Error synchronizing academic progress.");
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6 font-['Outfit']">
                <Loader2 className="animate-spin text-red-600" size={64} />
                <div className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Academic Node...</div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center font-['Outfit']">
                <div className="text-center text-white glass-card p-16 rounded-[3rem] border border-white/10 max-w-lg">
                    <Shield size={64} className="mx-auto mb-8 text-red-600" />
                    <h1 className="text-3xl font-black mb-4 uppercase tracking-tight">Lesson Vector Not Found</h1>
                    <p className="text-gray-500 mb-10 font-medium">The requested educational payload does not exist in the active core.</p>
                    <button
                        onClick={() => navigate('/lessons')}
                        className="px-12 py-5 bg-red-600 hover:bg-red-700 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-600/20"
                    >
                        Return to Syllabus
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] pb-20">
            {/* Immersive Header */}
            <div className="relative h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-black/80 to-[#050505] z-10"></div>
                {lesson.thumbnailUrl || lesson.moduleId?.thumbnail ? (
                    <img
                        src={lesson.thumbnailUrl || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop`}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-600/20 to-indigo-900/20"></div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-10 z-20 max-w-7xl mx-auto w-full">
                    <button
                        onClick={() => navigate('/lessons')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 font-black uppercase tracking-[0.2em] text-[10px]"
                    >
                        <ArrowLeft size={16} />
                        Back to Syllabus
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest ">
                                    {lesson.moduleId?.title || 'English Core'}
                                </span>
                                {isCompleted && (
                                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-1 rounded-full border border-emerald-400/20 text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle size={14} /> Mastered
                                    </div>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">{lesson.title}</h1>
                        </div>
                        <div className="flex gap-4">
                            {lesson.resources?.some(r => r.type === 'pdf') && (
                                <button
                                    onClick={() => window.open(lesson.resources.find(r => r.type === 'pdf').url, '_blank')}
                                    className="glass-card px-6 py-4 rounded-2xl border border-red-500/30 bg-red-600/10 hover:bg-red-600/20 transition-all flex items-center gap-3"
                                >
                                    <FileText className="text-red-500" size={20} />
                                    <div className="text-left">
                                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Scientific Paper</div>
                                        <div className="text-sm font-black text-white">View PDF</div>
                                    </div>
                                </button>
                            )}
                            <div className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Duration</div>
                                <div className="text-xl font-black">~{lesson.duration || 15}M</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-10 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Video Layer */}
                        {lesson.videoUrl && (
                            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <PlayCircle className="text-red-600" size={24} />
                                        Cinematic Instruction
                                    </h3>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target: Language Flow</span>
                                </div>
                                <div className="aspect-video bg-black relative">
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

                        {/* Description Layer */}
                        {lesson.description && (
                            <div className="glass-card rounded-[3rem] p-12 border border-white/5 bg-gradient-to-br from-red-600/5 to-transparent relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                                    <Sparkles size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-6 w-full text-left">
                                        Mission Briefing
                                    </h3>
                                    <p className="text-xl md:text-2xl font-bold leading-relaxed text-white">
                                        {lesson.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Content Layer */}
                        <div className="glass-card rounded-[3rem] p-12 border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative">
                            <div className="absolute top-10 right-10 text-white/5"><FileText size={160} /></div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-10 pb-6 border-b border-white/5 flex items-center gap-3">
                                    <Sparkles className="text-red-600" size={24} />
                                    Educational Payload
                                </h3>
                                <div className="prose prose-invert max-w-none">
                                    <div className="space-y-8 text-gray-400 text-lg leading-relaxed font-medium">
                                        {lesson.content ? (
                                            lesson.content.split('\n').map((paragraph, index) => (
                                                paragraph.trim() && <p key={index}>{paragraph}</p>
                                            ))
                                        ) : (
                                            <p className="italic opacity-50 text-center py-20 text-sm uppercase tracking-widest font-black">
                                                No supplementary linguistic data found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: sidebar */}
                    <div className="space-y-8">
                        {/* Resources */}
                        <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-black/40">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                                <Download size={20} className="text-red-600" />
                                Research Assets
                            </h3>
                            <div className="space-y-4">
                                {lesson.resources && lesson.resources.length > 0 ? (
                                    lesson.resources.map((res, i) => (
                                        <a
                                            key={i}
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-red-600/10 text-red-600 rounded-xl">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm uppercase tracking-tight">{res.title}</div>
                                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{res.type} Format</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-700 group-hover:text-red-500 transition-colors" />
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-700 font-black uppercase tracking-widest text-[10px]">
                                        No assets registered.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Completion Card */}
                        <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-gradient-to-br from-emerald-600/10 to-transparent">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4">Milestone Validation</h3>
                            <p className="text-gray-500 text-sm font-medium mb-8">Synchronize your completion status with the central English Research Grid.</p>

                            {!currentUser ? (
                                <div className="space-y-4">
                                    <p className="text-gray-400 text-xs italic">Registration required for academic credit.</p>
                                    <button
                                        onClick={() => navigate('/auth')}
                                        className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        Establish Identity
                                    </button>
                                </div>
                            ) : !isCompleted ? (
                                <button
                                    onClick={markAsComplete}
                                    disabled={completing}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {completing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Validate Mastery
                                </button>
                            ) : (
                                <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3">
                                    <CheckCircle size={18} /> Objective Secured
                                </div>
                            )}
                        </div>

                        {/* AI Assistance Quick Link */}
                        <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-red-500">Sonic Support</h3>
                            <p className="text-gray-500 text-sm font-medium mb-8">Need oral practice for this module? Activate the AI Speaking Simulation.</p>
                            <button
                                onClick={() => navigate('/lexilearn')}
                                className="w-full py-5 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Mic size={18} /> Launch AI Interaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnLesson;