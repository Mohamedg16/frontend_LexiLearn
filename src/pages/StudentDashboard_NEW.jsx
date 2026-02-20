// NEW AIChatHistory Component - Replace the existing one
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

                                {selectedItem.type === 'voice' && selectedItem.audioUrl && (
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Play size={14} className="text-emerald-500" />
                                            Voice Recording
                                        </div>
                                        <audio controls className="w-full h-10 rounded-lg">
                                            <source src={selectedItem.audioUrl} type="audio/webm" />
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
