import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, ChevronRight, Activity, Percent, Layers, Mic, User, Sparkles, Download, Loader2, Play } from 'lucide-react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentChatHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        if (selectedSession) {
            fetchSessionDetail(selectedSession._id);
        }
    }, [selectedSession]);

    const fetchSessions = async () => {
        try {
            const res = await api.get('/students/speaking-history');
            if (res.data.success) {
                setSessions(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessionDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`/students/speaking-history/${id}`);
            if (res.data.success) {
                setSelectedDetail(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    const generatePDF = () => {
        if (!selectedDetail) return;
        try {
            const doc = new jsPDF();
            const topic = selectedDetail.topic || 'General Practice';
            const date = new Date(selectedDetail.createdAt).toLocaleString();

            doc.setFontSize(22);
            doc.setTextColor(63, 81, 181);
            doc.text('LexiLearn: Study Report', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Session Details:', 14, 45);
            doc.setFontSize(11);
            doc.text(`Topic: ${topic}`, 14, 52);
            doc.text(`Date: ${date}`, 14, 59);

            doc.setFontSize(14);
            doc.text('Linguistic Performance:', 14, 74);
            const stats = [
                ['Metric', 'Value'],
                ['Lexical Diversity', (selectedDetail.lexicalDiversity || 0).toFixed(1)],
                ['Lexical Sophistication', `${selectedDetail.lexicalSophistication || 0}%`],
                ['Lexical Density', `${selectedDetail.lexicalDensity || 0}%`]
            ];
            autoTable(doc, {
                startY: 79,
                head: [stats[0]],
                body: stats.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [245, 245, 250] }
            });

            doc.setFontSize(14);
            const finalY = doc.lastAutoTable?.finalY || 120;
            doc.text('Transcript:', 14, finalY + 15);

            let startY = finalY + 25;

            if (selectedDetail.conversationId?.messages?.length > 0) {
                selectedDetail.conversationId.messages.forEach((msg) => {
                    const role = msg.role === 'user' ? 'Student' : 'AI Tutor';
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(msg.role === 'user' ? 0 : 63, 81, 181);
                    doc.text(`${role}:`, 14, startY);

                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50);
                    const lines = doc.splitTextToSize(msg.content, 180);
                    doc.text(lines, 14, startY + 5);
                    startY += (lines.length * 5) + 10;

                    if (startY > 280) { doc.addPage(); startY = 20; }
                });
            }

            doc.save(`LexiLearn_Study_Report_${topic}.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Failed to generate PDF: " + error.message);
        }
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 text-gray-500 uppercase font-black tracking-widest gap-4">
                <Loader2 className="animate-spin" size={48} />
                Loading Conversations...
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">My Conversations</h1>
                <p className="text-gray-500 font-medium text-sm md:text-base">Review your AI-assisted speaking sessions and progress</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Session List */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5">
                        <div className="p-4 bg-white/5 border-b border-white/5 font-bold flex items-center gap-2">
                            <MessageSquare size={18} className="text-cyan-400" />
                            Recent Sessions
                        </div>
                        <div className="max-h-[600px] overflow-y-auto divide-y divide-white/5">
                            {sessions.length > 0 ? sessions.map(session => (
                                <button
                                    key={session._id}
                                    onClick={() => setSelectedSession(session)}
                                    className={`w-full p-4 text-left hover:bg-white/5 transition-all flex items-center justify-between group ${selectedSession?._id === session._id ? 'bg-cyan-600/20' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                            <Mic size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{session.topic || 'General Practice'}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-2">
                                                <Calendar size={12} />
                                                {new Date(session.createdAt).toLocaleDateString()}
                                                {session.duration && (
                                                    <>
                                                        <span>•</span>
                                                        {formatTime(session.duration)}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={`text-gray-500 transition-transform ${selectedSession?._id === session._id ? 'rotate-90 text-cyan-400' : 'group-hover:translate-x-1'}`} />
                                </button>
                            )) : (
                                <div className="p-8 text-center text-gray-400 italic">No sessions found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed View */}
                <div className="xl:col-span-2">
                    {selectedSession ? (
                        <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden sticky top-6">
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-cyan-600/10 to-transparent flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-xl uppercase tracking-tight">{selectedSession.topic || 'General Practice'}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedSession.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={generatePDF}
                                    disabled={!selectedDetail || detailLoading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedDetail || detailLoading
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20 active:scale-95'
                                        }`}
                                >
                                    <Download size={14} />
                                    {detailLoading ? 'Preparing...' : 'Download Study Report (PDF)'}
                                </button>
                            </div>

                            {/* Lexical Stats Header */}
                            <div className="p-6 border-b border-white/5 grid grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 text-cyan-500/10"><Activity size={40} /></div>
                                    <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Diversity</div>
                                    <div className="text-2xl font-black text-cyan-400">{(selectedSession.lexicalDiversity || 0).toFixed(1)}%</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 text-emerald-500/10"><Percent size={40} /></div>
                                    <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Sophistication</div>
                                    <div className="text-2xl font-black text-emerald-400">{(selectedSession.lexicalSophistication || 0).toFixed(0)}%</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 text-amber-500/10"><Layers size={40} /></div>
                                    <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Lexical Density</div>
                                    <div className="text-2xl font-black text-amber-400">{(selectedSession.lexicalDensity || 0).toFixed(1)}%</div>
                                </div>
                            </div>

                            {/* Visual Feedback & Transcript */}
                            <div className="p-6 space-y-6">
                                <div className="glass rounded-xl overflow-hidden border border-white/5">
                                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                        <h4 className="font-bold flex items-center gap-2 text-sm">
                                            <MessageSquare size={16} className="text-cyan-400" />
                                            Interactive Scaffolding Chat History
                                        </h4>
                                    </div>
                                    <div className="p-6 bg-black/40 text-gray-300 leading-loose text-sm max-h-[600px] overflow-y-auto font-medium space-y-8">
                                        {detailLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <Loader2 className="animate-spin" size={32} />
                                                <div className="text-[10px] uppercase tracking-widest text-gray-500">Loading conversation...</div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* AI Conversational Tutor Badge */}
                                                <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl">
                                                    <Sparkles size={18} className="text-indigo-400" />
                                                    <div className="text-center">
                                                        <div className="text-sm font-black uppercase tracking-wider text-white">AI Conversational Tutor</div>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Socratic Mode Active</div>
                                                    </div>
                                                    <Sparkles size={18} className="text-purple-400" />
                                                </div>

                                                {/* Phase 1: Interactive Scaffolding */}
                                                {selectedDetail?.conversationId?.messages && selectedDetail.conversationId.messages.length > 0 ? (
                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                                            <MessageSquare size={12} />
                                                            Phase 1: Interactive Scaffolding (Chat History)
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {selectedDetail.conversationId.messages.map((msg, idx) => (
                                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
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
                                                ) : (
                                                    <div className="text-center py-10 text-gray-500">
                                                        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                                        <p>No chat history available for this session</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Voice Recording */}
                                <div className="pt-6 border-t border-white/5">
                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Play size={14} />
                                        Voice Recording
                                    </div>
                                    {selectedSession.audioBase64 || selectedSession.audioUrl ? (
                                        <audio key={selectedSession._id} controls className="w-full rounded-lg">
                                            <source 
                                                src={selectedSession.audioBase64 
                                                    ? `data:audio/webm;base64,${selectedSession.audioBase64}` 
                                                    : selectedSession.audioUrl} 
                                                type="audio/webm" 
                                            />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        <div className="w-full h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 italic">
                                            No audio recording available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center glass-card rounded-[2rem] border-2 border-dashed border-white/10 text-gray-400">
                            <MessageSquare size={48} className="mb-4 opacity-20" />
                            <p>Select a session from the list to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentChatHistory;
