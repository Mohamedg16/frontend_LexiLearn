import React, { useState, useEffect } from 'react';
import { Search, Mic, Calendar, User, BarChart2, FileText, ChevronRight, Activity, Percent, Layers, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const SpeechAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const response = await api.get('/teachers/assessments');
                if (response.data.success) {
                    setAssessments(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch assessments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, []);

    const filteredAssessments = assessments.filter(ass =>
        ass.studentId?.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ass.transcription?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="text-center py-12">Loading assessments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Speech Assessments</h1>
                    <p className="text-gray-400">Review and analyze student voice recordings</p>
                </div>
            </div>

            <div className="flex gap-4 mb-2">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by student name or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* List of Assessments */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                        <div className="p-4 bg-white/5 border-b border-white/10 font-bold flex items-center gap-2">
                            <Mic size={18} className="text-purple-400" />
                            Recent Submissions
                        </div>
                        <div className="max-h-[600px] overflow-y-auto divide-y divide-white/5">
                            {filteredAssessments.length > 0 ? filteredAssessments.map(ass => (
                                <button
                                    key={ass._id}
                                    onClick={() => setSelectedAssessment(ass)}
                                    className={`w-full p-4 text-left hover:bg-white/5 transition-all flex items-center justify-between group ${selectedAssessment?._id === ass._id ? 'bg-purple-600/20' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                                            {ass.studentId?.userId?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{ass.studentId?.userId?.fullName || 'Unknown Student'}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                <Calendar size={12} />
                                                {new Date(ass.createdAt).toLocaleDateString()}
                                                <span>•</span>
                                                {ass.duration ? formatTime(ass.duration) : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={`text-gray-500 transition-transform ${selectedAssessment?._id === ass._id ? 'rotate-90 text-purple-400' : 'group-hover:translate-x-1'}`} />
                                </button>
                            )) : (
                                <div className="p-8 text-center text-gray-400 italic">No assessments found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed View */}
                <div className="xl:col-span-2">
                    {selectedAssessment ? (
                        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden sticky top-6">
                            <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{selectedAssessment.studentId?.userId?.fullName}</h3>
                                        <p className="text-xs text-gray-400">{selectedAssessment.studentId?.userId?.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Submitted On</div>
                                    <div className="font-mono text-sm">{new Date(selectedAssessment.createdAt).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Lexical Analytics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 text-cyan-500/10"><Activity size={40} /></div>
                                        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Diversity</div>
                                        <div className="text-2xl font-bold text-cyan-400">{selectedAssessment.lexicalDiversity?.toFixed(1) || '0.0'}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 text-purple-500/10"><Percent size={40} /></div>
                                        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Sophistication</div>
                                        <div className="text-2xl font-bold text-purple-400">{selectedAssessment.lexicalSophistication || 0}%</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-2 text-amber-500/10"><Layers size={40} /></div>
                                        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Density</div>
                                        <div className="text-2xl font-bold text-amber-400">{selectedAssessment.lexicalDensity || 0}%</div>
                                    </div>
                                </div>

                                {/* Visual Feedback (Highlighted Transcript) */}
                                <div className="glass rounded-xl overflow-hidden border border-white/5">
                                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <h4 className="font-bold flex items-center gap-2 text-sm">
                                            <MessageSquare size={16} className="text-indigo-400" />
                                            Visual Feedback & Transcript
                                        </h4>
                                        <div className="flex gap-4 text-[10px]">
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> Academic</span>
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> Repetitive</span>
                                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Advanced</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-black/40 text-gray-300 leading-loose text-sm max-h-[300px] overflow-y-auto font-medium">
                                        {selectedAssessment.highlightedTranscript && selectedAssessment.highlightedTranscript.length > 0 ? (
                                            <div>
                                                {selectedAssessment.highlightedTranscript.map((w, i) => (
                                                    <span
                                                        key={i}
                                                        className={`inline-block mr-1 px-1 rounded transition-colors ${w.type === 'academic' ? 'bg-indigo-500/20 text-indigo-400 cursor-help' :
                                                                w.type === 'filler' ? 'bg-rose-500/20 text-rose-400 cursor-help' :
                                                                    w.type === 'advanced' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : ''
                                                            }`}
                                                        title={w.type !== 'normal' ? w.type.toUpperCase() : ''}
                                                    >
                                                        {w.word}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="italic text-gray-400">
                                                "{selectedAssessment.transcription}"
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Audio Playback */}
                                {selectedAssessment.audioUrl && (
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Mic size={14} className="text-emerald-500" /> Voice Stream Active
                                        </div>
                                        <audio controls className="w-full h-10 rounded-lg custom-audio">
                                            <source src={selectedAssessment.audioUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center glass-card rounded-2xl border-2 border-dashed border-white/10 text-gray-400">
                            <Mic size={48} className="mb-4 opacity-20" />
                            <p>Select a submission from the list to view feedback and research numbers</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpeechAssessments;
