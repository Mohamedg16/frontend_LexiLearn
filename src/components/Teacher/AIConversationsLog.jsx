import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, MessageSquare, User, Calendar, X, Eye, ChevronRight, Mic } from 'lucide-react';
import dayjs from 'dayjs';

const AIConversationsLog = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/ai-chat/all-conversations');
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.studentId?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openModal = (conv) => setSelectedConversation(conv);
    const closeModal = () => setSelectedConversation(null);

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-center flex-col animate-pulse">
            <MessageSquare size={48} className="text-indigo-500 mb-4" />
            <div className="text-sm font-black uppercase tracking-widest text-gray-500">Loading AI Logs...</div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">AI Interaction Logs</h1>
                    <p className="text-gray-400 font-medium">Review student discussions with the AI Tutor.</p>
                </div>
            </div>

            {/* Search */}
            <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/5 flex items-center gap-4">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by student name or topic..."
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="glass-card rounded-[2rem] border border-white/5 overflow-hidden bg-black/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Student</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Topic</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Messages</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-gray-400 font-black">Last Active</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-gray-400 font-black text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredConversations.length > 0 ? (
                                filteredConversations.map((conv) => (
                                    <tr key={conv._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-200">{conv.student?.userId?.name || conv.student?.userId?.fullName || 'Unknown Student'}</div>
                                                    <div className="text-xs text-gray-500">{conv.student?.userId?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                {conv.type === 'voice' ? <Mic size={14} className="text-emerald-500" /> : <MessageSquare size={14} className="text-indigo-500" />}
                                                <span className="font-medium text-gray-300">{conv.title || 'Untitled Session'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <MessageSquare size={14} />
                                                <span className="font-bold text-sm">{conv.messages?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm text-gray-400 font-mono">
                                            {dayjs(conv.updatedAt).format('MMM D, HH:mm')}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button
                                                onClick={() => openModal(conv)}
                                                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-all border border-white/5 hover:border-indigo-500/20"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 font-medium">
                                        No conversations found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {selectedConversation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] w-full max-w-3xl rounded-[2rem] border border-white/10 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-[2rem]">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                    {selectedConversation.type === 'voice' ? <Mic size={20} className="text-emerald-400" /> : <MessageSquare size={20} className="text-indigo-400" />}
                                    {selectedConversation.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <User size={14} />
                                    <span>{selectedConversation.student?.userId?.name || selectedConversation.student?.userId?.fullName}</span>
                                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                    <Calendar size={14} />
                                    <span>{dayjs(selectedConversation.date).format('MMMM D, YYYY')}</span>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {selectedConversation.type === 'chat' ? (
                                selectedConversation.details.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`
                                                max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                                                ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                                }
                                            `}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">
                                                {msg.role === 'user' ? 'Student' : 'AI Tutor'}
                                            </div>
                                            <div className="whitespace-pre-wrap">{msg.content}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                            <Mic size={14} /> Audio Recording
                                        </h4>
                                        {selectedConversation.details.audioUrl ? (
                                            <audio controls className="w-full h-12 custom-audio rounded-xl">
                                                <source
                                                    src={selectedConversation.details.audioUrl.startsWith('http')
                                                        ? selectedConversation.details.audioUrl
                                                        : `${api.defaults.baseURL.replace('/api', '')}${selectedConversation.details.audioUrl}`}
                                                    type="audio/webm"
                                                />
                                                Your browser does not support audio playback.
                                            </audio>
                                        ) : (
                                            <div className="text-center text-gray-500 text-sm py-4">No audio file available</div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Transcription</h4>
                                        <div className="text-gray-300 leading-relaxed font-serif text-lg">
                                            "{selectedConversation.details.transcription}"
                                        </div>
                                    </div>

                                    {selectedConversation.details.advice && (
                                        <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4">AI Tutor Feedback</h4>
                                            <div className="text-gray-300 leading-relaxed text-sm">
                                                {selectedConversation.details.advice}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIConversationsLog;
