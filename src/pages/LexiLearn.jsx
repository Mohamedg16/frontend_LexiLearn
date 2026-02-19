import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
    Mic, Send, StopCircle, BarChart3, Clock,
    BookOpen, Sparkles, AlertCircle, CheckCircle2,
    ChevronRight, Brain, Languages, Lightbulb,
    History, MessageSquare, Trash2, Volume2, PlayCircle
} from 'lucide-react';
import api from '../services/api';

// --- Phase 1: Interactive Scaffolding ---
const InteractiveScaffolding = ({ onComplete, topic, onWordsSuggested }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(300);
    const [vocabBank, setVocabBank] = useState([
        { tier1: 'big', tier2: 'monumental', tier3: 'colossal' },
        { tier1: 'small', tier2: 'diminutive', tier3: 'minuscule' },
        { tier1: 'happy', tier2: 'ecstatic', tier3: 'jubilant' },
        { tier1: 'bad', tier2: 'adverse', tier3: 'deleterious' }
    ]);
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    onComplete(messages);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const playBackendAudio = (url) => {
        if (!url) return;
        const fullUrl = url.startsWith('http') ? url : `${api.defaults.baseURL.replace('/api', '')}${url}`;
        console.log("🔊 Playing AI Voice:", fullUrl);
        const audio = new Audio(fullUrl);
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = (e) => {
            console.error("Audio Load Error:", e);
            setIsSpeaking(false);
        };
        audio.play().catch(e => {
            console.error("Playback Blocked/Failed:", e);
            setIsSpeaking(false);
        });
    };

    const handleSend = async (overrideMsg = null) => {
        const textToSend = overrideMsg || input;
        if (!textToSend.trim() || loading) return;

        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        if (!overrideMsg) setInput('');
        setLoading(true);

        try {
            setError(null);
            const res = await api.post('/lexilearn/tutor', {
                message: textToSend,
                topic,
                history: messages
            });
            if (res.data.success) {
                const aiResponse = res.data.data.response;
                setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
                // Removed speakText(aiResponse) as per requirements: text mode = text only

                const words = aiResponse.match(/\b\w{6,}\b/g) || [];
                onWordsSuggested(words.filter(w => w.length > 7));
            }
        } catch (err) {
            setError(err.response?.data?.message || "Tutor connection lost.");
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = e => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                if (audioChunksRef.current.length === 0) {
                    setError("No audio data captured. Please speak again.");
                    setLoading(false);
                } else {
                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await handleSendVocal(blob);
                }
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error("Mic Error:", err);
            setError("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendVocal = async (blob) => {
        if (!blob || blob.size < 100) {
            setError("Voice recording too short.");
            setLoading(false);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('audio', blob, 'vocal.webm');
        formData.append('topic', topic);
        formData.append('history', JSON.stringify(messages));

        try {
            const res = await api.post('/lexilearn/tutor-vocal', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const { userText, response, audioUrl } = res.data.data;
                setMessages(prev => [
                    ...prev,
                    { role: 'user', content: userText, isVoice: true },
                    { role: 'assistant', content: response, isVoice: true }
                ]);

                if (audioUrl) {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        if (newMsgs.length > 0) {
                            newMsgs[newMsgs.length - 1].audioUrl = audioUrl;
                        }
                        return newMsgs;
                    });
                    playBackendAudio(audioUrl);
                }
            }
        } catch (err) {
            console.error("Vocal API Error:", err);
            setError(err.response?.data?.message || "Voice processing failed. Please try typing.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] lg:h-[calc(100vh-250px)] animate-slide-up">
            <div className="flex-1 bg-[#0a0a0c]/60 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col relative border border-white/5 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a2e]/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Brain className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">AI Conversational Tutor</h3>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    {isSpeaking ? 'AI is speaking...' : 'Socratic Mode Active'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-indigo-500/10 text-indigo-200'}`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <Sparkles size={48} className="text-indigo-400 animate-pulse" />
                            <p className="max-w-xs text-sm">Talk or type to your AI tutor. I'll help you organize thoughts and correct any mistakes!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20 shadow-lg' : 'bg-[#161625] text-gray-200 border border-white/10 rounded-tl-none'}`}>
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        {msg.isVoice && msg.role === 'user' && (
                                            <div className="flex items-center gap-1 mt-2 text-[10px] opacity-60">
                                                <Mic size={10} />
                                                <span>Voice Message</span>
                                            </div>
                                        )}
                                    </div>
                                    {msg.audioUrl && (
                                        <button
                                            onClick={() => playBackendAudio(msg.audioUrl)}
                                            className="mt-1 p-1 hover:bg-white/10 rounded-lg transition-colors text-indigo-400"
                                            title="Replay Audio"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 p-4 rounded-2xl flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
                    {isRecording ? (
                        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(n => <div key={n} className="w-1 bg-red-400 rounded-full animate-grow" style={{ animationDelay: `${n * 0.1}s` }} />)}
                                </div>
                                <span className="text-red-400 font-bold text-sm uppercase">Recording Voice...</span>
                            </div>
                            <button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-red-500/40">
                                Stop & Send
                            </button>
                        </div>
                    ) : (
                        <div className="relative flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Message your tutor..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 transition-all text-white placeholder-gray-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={startRecording}
                                    title="Speak to AI"
                                    className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white p-4 rounded-2xl transition-all border border-white/10"
                                >
                                    <Mic size={24} />
                                </button>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/30"
                                >
                                    <Send size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                    {error && <p className="mt-2 text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
                </div>

                <button
                    onClick={() => onComplete(messages)}
                    className="absolute top-6 right-32 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/30 transition-all flex items-center gap-2"
                >
                    I'm Ready <ChevronRight size={16} />
                </button>
            </div>

            {/* Vocabulary Bank */}
            <div className="w-full lg:w-80 glass rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Languages size={20} />
                    <h4 className="font-bold uppercase tracking-wider text-sm">Lexical Assets</h4>
                </div>
                <div className="space-y-3">
                    {vocabBank.map((item, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 hover:border-indigo-500/50 transition-all group cursor-default">
                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                                <span>Basic</span>
                                <span className="text-indigo-400">Advanced</span>
                            </div>
                            <div className="flex justify-between items-center font-bold">
                                <span className="text-gray-400 text-sm">{item.tier1}</span>
                                <ChevronRight size={12} className="text-gray-600" />
                                <span className="text-white group-hover:text-amber-400 transition-colors">{item.tier3}</span>
                            </div>
                        </div>
                    ))}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                        <Lightbulb className="text-amber-400 shrink-0" size={18} />
                        <p className="text-[10px] text-amber-200/80 leading-relaxed">
                            Tip: I'll correct your grammar in real-time. Don't be afraid to make mistakes!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Phase 2: Independent Performance ---
const IndependentPerformance = ({ onComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [audioBlob, setAudioBlob] = useState(null);
    const [stream, setStream] = useState(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        let timer;
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isRecording) {
            stopRecording();
        }
        return () => clearInterval(timer);
    }, [isRecording, timeLeft]);

    const startRecording = async () => {
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(micStream);

            // Check supported mime types
            const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
            mediaRecorderRef.current = new MediaRecorder(micStream, { mimeType });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error('Mic Error:', err);
            alert("Microphone access denied or error occurred.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
    };

    const handleAnalyze = () => {
        if (audioBlob) {
            onComplete(audioBlob, 120 - timeLeft);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] gap-8 md:gap-12 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4 px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-[0.2em]">Independent Performance</h2>
                <div className="flex justify-center">
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                </div>
                <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto italic">Note: All scaffolding and aids have been removed. Rely on your memory and practice.</p>
            </div>

            <div className="relative">
                {/* Visualizer Effect */}
                {isRecording && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                        {[1.5, 2.5, 3.5, 4.5, 3.5, 2.5, 1.5].map((h, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [10, 40 * h, 10], opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                className="w-2 bg-indigo-500 rounded-full"
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-40 h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-700 shadow-2xl relative z-10 ${isRecording ? 'bg-red-500 shadow-red-500/40 ring-8 ring-red-500/20' : 'bg-white shadow-white/10 hover:scale-105 active:scale-95'}`}
                >
                    {isRecording ? (
                        <>
                            <StopCircle size={48} className="text-white" />
                            <span className="text-white font-black text-[10px] tracking-widest uppercase">Terminate</span>
                        </>
                    ) : (
                        <>
                            <Mic size={48} className="text-indigo-600" />
                            <span className="text-indigo-600 font-black text-[10px] tracking-widest uppercase">Initialize</span>
                        </>
                    )}
                </button>
            </div>

            <div className="text-6xl font-mono font-black text-white tracking-widest bg-white/5 px-10 py-4 rounded-3xl border border-white/5">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>

            {!isRecording && audioBlob && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-4"
                >
                    <Sparkles size={18} />
                    Run Neural Analysis
                </motion.button>
            )}
        </div>
    );
};

// --- Phase 3: Analytics & Reflection ---
const AnalyticsReflection = ({ analysis, transcription, audioUrl, suggestedWords = [] }) => {
    // analysis shape: { mtldScore, lexicalSophistication, lexicalDensity, advancedWords, repetitiveWords, advice, highlightedTranscript }

    const MetricGauge = ({ label, value, color, unit = "%" }) => (
        <div className="glass p-6 rounded-3xl flex flex-col items-center text-center gap-3 relative overflow-visible group">
            <div className={`absolute top-0 left-0 w-full h-1 ${color}`}></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            <div className="text-4xl font-black text-white overflow-visible whitespace-nowrap">{value}{unit}</div>
            <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );

    // Filter used Tier 3 words from Phase 1
    const usedTier3Words = transcription.toLowerCase().split(/\W+/).filter(word =>
        suggestedWords.some(s => s.toLowerCase() === word)
    );

    // Check for insufficient data
    if (analysis.status === "insufficient_data") {
        return (
            <div className="text-center py-20 glass rounded-[3rem] animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400 mb-6">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Insufficient Speech Data</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                    We couldn't analyze your speech. Please try to speak for at least 30 seconds to provide enough data for a reliable linguistic analysis.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/30"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <MetricGauge label="Lexical Diversity" value={analysis.mtldScore?.toFixed(1) || 0} color="bg-cyan-400" unit="" />
                <MetricGauge label="Sophistication" value={analysis.lexicalSophistication || 0} color="bg-purple-400" />
                <MetricGauge label="Density Index" value={analysis.lexicalDensity || 0} color="bg-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Transcript */}
                <div className="lg:col-span-2 glass rounded-3xl overflow-hidden flex flex-col min-h-[400px] md:min-h-[500px]">
                    <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-bold flex items-center gap-2 text-sm md:text-base"><MessageSquare size={20} className="text-indigo-400" /> Interactive Transcript</h3>
                            {audioUrl && (
                                <div className="flex items-center gap-3">
                                    <Mic size={14} className="text-emerald-500 animate-pulse" />
                                    <audio controls crossOrigin="anonymous" className="h-8 max-w-[200px] md:max-w-xs custom-audio-mini opacity-60 hover:opacity-100 transition-opacity">
                                        <source
                                            src={audioUrl.startsWith('http') ? audioUrl : `${api.defaults.baseURL.replace('/api', '')}${audioUrl}`}
                                            type="audio/webm"
                                        />
                                    </audio>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] md:text-xs">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Used Tier 3</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Academic</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400"></div> Repetitive</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-visible p-6 md:p-8 leading-loose text-base md:text-lg text-gray-300">
                        {analysis.highlightedTranscript ? analysis.highlightedTranscript.map((w, i) => {
                            const isTier3 = usedTier3Words.includes(w.word.toLowerCase());
                            return (
                                <span
                                    key={i}
                                    className={`inline-block mr-1.5 px-1 rounded transition-colors ${isTier3 ? 'bg-emerald-500 text-white font-bold' :
                                        w.type === 'academic' ? 'bg-indigo-500/20 text-indigo-400 cursor-help' :
                                            w.type === 'filler' ? 'bg-rose-500/20 text-rose-400 cursor-help' : ''
                                        }`}
                                    title={isTier3 ? 'Phase 1 Tier 3 Word!' : w.type === 'academic' ? 'Academic Word (AWL)' : w.type === 'filler' ? 'Repetitive Word' : ''}
                                >
                                    {w.word}
                                </span>
                            );
                        }) : transcription.split(/\s+/).map((word, i) => {
                            const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                            const isTier3 = usedTier3Words.includes(cleanWord);
                            return (
                                <span
                                    key={i}
                                    className={`inline-block mr-1.5 px-1 rounded transition-colors ${isTier3 ? 'bg-emerald-500 text-white font-bold' : ''}`}
                                    title={isTier3 ? 'Phase 1 Tier 3 Word!' : ''}
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard / Sidebar */}
                <div className="space-y-6">
                    {/* Tier 3 Success */}
                    {usedTier3Words.length > 0 && (
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-3xl p-6 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <CheckCircle2 size={20} />
                                <span>Tier 3 Mastery</span>
                            </div>
                            <p className="text-sm text-emerald-100/90">
                                Excellent! You successfully integrated these words from your scaffolding session:
                                <span className="font-bold"> {usedTier3Words.join(', ')}</span>
                            </p>
                        </div>
                    )}

                    {/* Actionable Advice */}
                    <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold">
                            <Lightbulb size={20} />
                            <span>Lexical Advice</span>
                        </div>
                        <p className="text-indigo-100/90 leading-relaxed italic">
                            "{analysis.advice || "Great job! Try to vary your vocabulary more in the next session."}"
                        </p>
                    </div>

                    {/* Sophisticated Words */}
                    <div className="glass rounded-3xl p-6 space-y-4 flex-1">
                        <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400">Academic Vocabulary Matches</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.advancedWords?.map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm font-medium">
                                    {word}
                                </span>
                            ))}
                            {(!analysis.advancedWords || analysis.advancedWords.length === 0) && (
                                <p className="text-xs text-gray-500 italic">No AWL matches detected.</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 md:py-4 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        New Session <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const LexiLearn = () => {
    const location = useLocation();
    const [phase, setPhase] = useState(1);
    const [topic, setTopic] = useState(location.state?.topic || 'Global Warming');
    const [tempTopic, setTempTopic] = useState('');
    const [isTopicSet, setIsTopicSet] = useState(!!location.state?.topic);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [suggestedTier3Words, setSuggestedTier3Words] = useState([]);
    const [loading, setLoading] = useState(false);

    const handlePhase1Complete = (messages) => {
        setChatHistory([]); // WIPE for anti-cheat
        setPhase(2);
    };

    const handlePhase2Complete = async (blob, duration) => {
        setLoading(true);
        setPhase(3);
        try {
            const formData = new FormData();
            formData.append('audio', blob, 'recording.webm');
            formData.append('suggestedWords', JSON.stringify(suggestedTier3Words));

            // 1. Transcribe & Auto-Analyze (Internal Backend Trigger)
            const res = await api.post('/lexilearn/transcribe', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const { text, audioUrl, autoAnalysis } = res.data.data;
                setTranscription(text);
                setAudioUrl(audioUrl);

                if (autoAnalysis) {
                    setAnalysisResults(autoAnalysis);
                    // Automatic Save
                    await api.post('/lexilearn/save-session', {
                        topic,
                        transcript: text,
                        metrics: autoAnalysis,
                        audioUrl: audioUrl
                    });
                } else {
                    // Fallback to manual analysis call if auto-analysis missing
                    const analyzeRes = await api.post('/lexilearn/analyze', {
                        transcription: text,
                        duration,
                        audioUrl
                    });
                    if (analyzeRes.data.success) {
                        const results = analyzeRes.data.data.analysis;
                        setAnalysisResults(results);
                        // Automatic Save
                        await api.post('/lexilearn/save-session', {
                            topic,
                            transcript: text,
                            metrics: results,
                            audioUrl: audioUrl
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Phase 2 Pipeline Error:', err);
            const msg = err.response?.data?.message || "Analysis pipeline failed.";
            alert(msg); // Provide visible feedback for 401/429
        } finally {
            setLoading(false);
        }
    };

    if (!isTopicSet) {
        return (
            <div className="min-h-screen pt-32 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-10 rounded-[3rem] w-full max-w-lg text-center space-y-8"
                >
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40">
                        <Sparkles className="text-white" size={40} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white">LexiLearn</h1>
                        <p className="text-gray-400">Enter a topic to start your three-stage acquisition session.</p>
                    </div>
                    <div className="space-y-3 px-4">
                        <input
                            type="text"
                            value={tempTopic}
                            onChange={(e) => setTempTopic(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && tempTopic && (setTopic(tempTopic), setIsTopicSet(true))}
                            placeholder="e.g., Artificial Intelligence, Climate Change"
                            className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 md:px-6 py-4 md:py-5 outline-none focus:border-indigo-500 transition-all text-center text-lg md:text-xl font-medium"
                        />
                        <button
                            onClick={() => {
                                if (tempTopic) {
                                    setTopic(tempTopic);
                                    setIsTopicSet(true);
                                }
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 md:py-5 rounded-2xl font-bold text-lg md:text-xl transition-all shadow-xl shadow-indigo-500/30 active:scale-95"
                        >
                            Start Session
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 pb-12 relative overflow-hidden">
            {/* Background Decor matching Home Page Hero */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                <div className="absolute top-20 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob" />
                <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Progress Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
                    <div className="flex items-center gap-3 md:gap-6 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center gap-2 shrink-0">
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all text-xs md:text-base ${phase === num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/20' :
                                    phase > num ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-500'
                                    }`}>
                                    {phase > num ? <CheckCircle2 size={18} md:size={24} /> : num}
                                </div>
                                <span className={`text-[10px] md:text-sm font-bold ${phase === num ? 'text-white' : 'text-gray-500'}`}>
                                    {num === 1 ? 'Scaffolding' : num === 2 ? 'Independence' : 'Analytics'}
                                </span>
                                {num < 3 && <div className="hidden sm:block w-8 md:w-12 h-1 bg-white/5 rounded-full mx-1 md:mx-2"></div>}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] md:text-xs font-bold text-gray-400">
                            Topic: <span className="text-white">{topic}</span>
                        </div>
                        <button onClick={() => window.location.reload()} className="text-gray-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Phase Content */}
                <AnimatePresence mode="wait">
                    {phase === 1 && (
                        <InteractiveScaffolding
                            key="p1"
                            topic={topic}
                            onComplete={handlePhase1Complete}
                            onWordsSuggested={(words) => setSuggestedTier3Words(prev => [...new Set([...prev, ...words])])}
                        />
                    )}
                    {phase === 2 && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Anti-Cheat: Scaffolding hidden during recording */}
                            <div className="glass p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/10 bg-indigo-600/5 text-center space-y-4">
                                <div className="p-3 bg-indigo-500/20 rounded-2xl w-fit mx-auto">
                                    <Brain className="text-indigo-400" size={32} />
                                </div>
                                <h4 className="text-lg md:text-xl font-bold text-white">Focus & Recall</h4>
                                <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                                    Remember the academic synonyms suggested in Phase 1.
                                    Speak naturally and use them to boost your score.
                                </p>
                            </div>

                            <IndependentPerformance
                                key="p2"
                                onComplete={handlePhase2Complete}
                            />
                        </div>
                    )}
                    {
                        phase === 3 && (
                            loading ? (
                                <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                                    <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <div className="text-center">
                                        <p className="text-indigo-400 font-black uppercase tracking-widest text-sm animate-pulse">Linguistic Bridge Active</p>
                                        <p className="text-gray-500 text-xs mt-2 font-medium">Decoding Whisper stream & performing lexical complexity analysis...</p>
                                    </div>
                                </div>
                            ) : (
                                analysisResults ? (
                                    <AnalyticsReflection
                                        key="p3"
                                        analysis={analysisResults}
                                        transcription={transcription}
                                        audioUrl={audioUrl}
                                        suggestedWords={suggestedTier3Words}
                                    />
                                ) : (
                                    <div className="text-center py-20 glass rounded-[3rem] animate-in fade-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-6">
                                            <AlertCircle size={40} />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Analysis Failed</h3>
                                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                                            We couldn't generate your linguistic report. This might be due to a short recording or an API timeout.
                                        </p>
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => setPhase(2)}
                                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-all"
                                            >
                                                Retry Recording
                                            </button>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
                                            >
                                                Restart Session
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )
                    }
                </AnimatePresence >
            </div >
        </div >
    );
};

export default LexiLearn;
