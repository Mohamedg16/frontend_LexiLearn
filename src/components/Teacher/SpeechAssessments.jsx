import React, { useState, useEffect } from 'react';
import { Search, Mic, Calendar, User, BarChart2, FileText, ChevronRight, Activity, Percent, Layers, MessageSquare, Download, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


const SpeechAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);

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

    useEffect(() => {
        if (selectedAssessment) {
            fetchAssessmentDetail(selectedAssessment._id);
        }
    }, [selectedAssessment]);

    const fetchAssessmentDetail = async (id) => {
        setDetailLoading(true);
        try {
            const response = await api.get(`/teachers/assessments/${id}`);
            if (response.data.success) {
                setSelectedDetail(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch assessment detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const generateCandidatePDF = () => {
        if (!selectedDetail) return;
        console.log("Downloading PDF...");
        try {
            const doc = new jsPDF();
            const studentName = selectedDetail.studentId?.userId?.fullName || 'Unknown';
            const studentEmail = selectedDetail.studentId?.userId?.email || 'N/A';
            const topic = selectedDetail.topic || 'General Practice';
            const date = new Date(selectedDetail.createdAt).toLocaleString();

            // Header (Clean/White Background)
            doc.setFontSize(22);
            doc.setTextColor(63, 81, 181); // Indigo
            doc.text('LexiLearn: Candidate Performance Report', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            // Candidate Profile
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('1. Candidate Profile:', 14, 45);
            doc.setFontSize(11);
            doc.text(`Name: ${studentName}`, 14, 52);
            doc.text(`Email: ${studentEmail}`, 14, 59);
            doc.text(`Session Topic: ${topic}`, 14, 66);
            doc.text(`Date of Submission: ${date}`, 14, 73);

            // Lexical Stats
            doc.setFontSize(14);
            doc.text('2. Linguistic Performance Metrics:', 14, 88);
            const stats = [
                ['Metric', 'Value'],
                ['Lexical Diversity', (selectedDetail.lexicalDiversity || 0).toFixed(1)],
                ['Lexical Sophistication', `${selectedDetail.lexicalSophistication || 0}%`],
                ['Lexical Density', `${selectedDetail.lexicalDensity || 0}%`],
                ['Word Count', selectedDetail.wordCount || 0]
            ];
            autoTable(doc, {
                startY: 93,
                head: [stats[0]],
                body: stats.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [245, 245, 250] }
            });

            // Transcript with Color Coding
            doc.setFontSize(14);
            doc.setTextColor(0);
            const finalY = doc.lastAutoTable?.finalY || 150;
            doc.text('3. Full Annotated Transcript:', 14, finalY + 15);

            // If we have messages, we list them. If only highlightedTranscript (voice phase), we show it colored.
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
            } else if (selectedDetail.highlightedTranscript?.length > 0) {
                // Draw colored words manually for the transcript
                doc.setFontSize(10);
                let currentX = 14;
                const maxX = 190;

                selectedDetail.highlightedTranscript.forEach((item) => {
                    let color = [50, 50, 50]; // Default
                    if (item.type === 'academic') color = [63, 81, 181]; // Indigo
                    else if (item.type === 'filler' || item.type === 'repetitive') color = [225, 29, 72]; // Rose/Red
                    else if (item.type === 'advanced') color = [16, 185, 129]; // Emerald/Green

                    doc.setTextColor(color[0], color[1], color[2]);
                    const wordWidth = doc.getTextWidth(item.word + ' ');

                    if (currentX + wordWidth > maxX) {
                        currentX = 14;
                        startY += 6;
                        if (startY > 280) { doc.addPage(); startY = 20; }
                    }

                    doc.text(item.word, currentX, startY);
                    currentX += wordWidth;
                });
            }

            doc.save(`${studentName}_LexiLearn_Analysis.pdf`);
        } catch (error) {
            console.error("PDF Export Error:", error);
            alert("Failed to generate PDF: " + error.message);
        }
    };

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
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Submitted On</div>
                                    <div className="font-mono text-sm mb-2">{new Date(selectedAssessment.createdAt).toLocaleString()}</div>
                                    <button
                                        onClick={generateCandidatePDF}
                                        disabled={!selectedDetail || detailLoading}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg ${!selectedDetail || detailLoading
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
                                            }`}
                                    >
                                        <Download size={14} />
                                        {detailLoading ? 'Preparing PDF...' : 'Download Chat PDF'}
                                    </button>
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
                                    <div className="p-6 bg-black/40 text-gray-300 leading-loose text-sm max-h-[600px] overflow-y-auto font-medium space-y-8">
                                        {detailLoading ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <div className="text-[10px] uppercase tracking-widest text-gray-500">Retrieving Full History...</div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Phase 1: Scaffolding Chat History */}
                                                {selectedDetail?.conversationId?.messages && selectedDetail.conversationId.messages.length > 0 && (
                                                    <div className="space-y-6">
                                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400 mb-2 flex items-center gap-2">
                                                            <MessageSquare size={12} />
                                                            Phase 1: Interactive Scaffolding (Chat History)
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {selectedDetail.conversationId.messages.map((msg, idx) => (
                                                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                                    <div className={`max-w-[90%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-100' : 'bg-white/5 border border-white/5 text-gray-300'}`}>
                                                                        <div className="text-[9px] uppercase font-black mb-1.5 opacity-40 flex items-center gap-2">
                                                                            {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                                                                            {msg.role === 'user' ? 'Student' : 'AI Tutor'} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Scaffolding'}
                                                                        </div>
                                                                        <div className="text-sm leading-relaxed">{msg.content}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {selectedDetail.conversationId.finalReport && (
                                                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-4">
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Scaffolding Final Evaluation</div>
                                                                <div className="text-xs text-gray-400 whitespace-pre-wrap">{selectedDetail.conversationId.finalReport}</div>
                                                            </div>
                                                        )}
                                                        <hr className="border-white/5 my-8" />
                                                    </div>
                                                )}

                                                {/* Phase 2: Independent Performance Transcript */}
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 mb-2 flex items-center gap-2">
                                                        <Mic size={12} />
                                                        Phase 2: Independent Performance (Final Transcript)
                                                    </h4>
                                                    <div className="text-base md:text-lg leading-relaxed">
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Audio Playback */}
                                <div className="pt-6 border-t border-white/5">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Mic size={14} className={(selectedAssessment.audioBase64 || selectedAssessment.audioUrl) ? "text-emerald-500" : "text-gray-600"} />
                                        {(selectedAssessment.audioBase64 || selectedAssessment.audioUrl) ? "Voice Stream Active" : "Voice Stream Unavailable"}
                                    </div>
                                    {(selectedAssessment.audioBase64 || selectedAssessment.audioUrl) ? (
                                        <audio 
                                            key={selectedAssessment._id}
                                            controls 
                                            className="w-full h-10 rounded-lg custom-audio"
                                        >
                                            <source
                                                src={selectedAssessment.audioBase64 
                                                    ? `data:audio/webm;base64,${selectedAssessment.audioBase64}` 
                                                    : selectedAssessment.audioUrl}
                                                type="audio/webm"
                                            />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        <div className="w-full h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-500 italic">
                                            No audio recording available for this session.
                                        </div>
                                    )}
                                </div>
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
