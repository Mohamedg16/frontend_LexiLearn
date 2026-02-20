import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2 } from 'lucide-react';
import api from '../../services/api';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                // Optionally auto-send:
                // handleSendMessage(null, transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isRecording) return; // Don't do STT if recording vocal
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    // Voice Message (Vocal) Logic using AssemblyAI on Backend
    const startRecording = async () => {
        if (isListening) recognitionRef.current.stop();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await handleSendVocal(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Could not access microphone for recording.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleSendVocal = async (blob) => {
        setIsTyping(true);
        const formData = new FormData();
        formData.append('audio', blob, 'vocal.webm');
        if (conversationId) formData.append('conversationId', conversationId);

        try {
            const res = await api.post('/ai-chat/send-vocal', formData);
            if (res.data.success) {
                const { audioBase64, userText, conversationId: nextId } = res.data.data;
                setConversationId(nextId);

                // Add user "text" found by Whisper
                setMessages(prev => [...prev, {
                    role: 'user',
                    content: userText || "🎤 Voice Message",
                    timestamp: new Date().toISOString()
                }]);

                // Add AI response placeholder (Text is hidden as per rules)
                const assistantMsg = {
                    role: 'assistant',
                    content: "🎤 Voice Response",
                    timestamp: new Date().toISOString(),
                    audio: audioBase64 // Store audio if needed later
                };
                setMessages(prev => [...prev, assistantMsg]);

                // Play Audio Automatically
                if (audioBase64) {
                    const audio = new Audio(audioBase64);
                    audio.play().catch(e => console.error("Audio playback failed", e));
                }
            }
        } catch (err) {
            console.error('Vocal Error:', err);
        } finally {
            setIsTyping(false);
        }
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        // Clean text for more natural speech
        const cleanText = text
            .replace(/---/g, '')
            .replace(/📝 Correction:/g, 'Correction.')
            .replace(/\*/g, '')
            .replace(/#/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || inputValue;

        if (!textToSend.trim() || isTyping) return;

        const newUserMessage = {
            role: 'user',
            content: textToSend,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await api.post('/ai-chat/send', {
                message: textToSend,
                conversationId
            });

            if (res.data.success) {
                const { response, conversationId: nextId } = res.data.data;
                setConversationId(nextId);
                const assistantMsg = {
                    role: 'assistant',
                    content: response,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, assistantMsg]);

                // No audio feedback for text messages as per rules
            }
        } catch (err) {
            console.error('Study Assistant Error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Apologies, the academic uplink is currently unstable. Please check your connectivity.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Helper to render message content with correction block styling
    const renderMessageContent = (content) => {
        if (content.includes('---') && content.includes('Correction:')) {
            const parts = content.split('---');
            return (
                <div className="space-y-3">
                    {parts.map((part, i) => {
                        if (part.includes('Correction:')) {
                            return (
                                <div key={i} className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200 text-sm italic">
                                    {part.trim()}
                                </div>
                            );
                        }
                        return <p key={i} className="leading-relaxed text-sm md:text-base">{part.trim()}</p>;
                    })}
                </div>
            );
        }
        return <p className="leading-relaxed text-sm md:text-base">{content}</p>;
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Chat Header */}
            <div className="bg-[#000428]/60 backdrop-blur-md p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Bot className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Empathetic Language Tutor</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-gray-300">Active Listener</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => window.speechSynthesis.cancel()} className="p-2 text-gray-400 hover:text-white transition-colors" title="Stop Audio">
                        <Volume2 size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="p-4 bg-indigo-600/20 rounded-full text-indigo-400">
                            <Bot size={48} />
                        </div>
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">Supportive Uplink Active</h4>
                        <p className="text-gray-400 text-sm max-w-xs font-medium">Hello! I'm your peer tutor. Feel free to talk or type. I'm here to help you practice your English!</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                            {msg.role === 'assistant' ? <Sparkles size={16} className="text-white" /> : <User size={16} className="text-white" />}
                        </div>

                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                            }`}>
                            {renderMessageContent(msg.content)}
                            <div className={`text-[10px] mt-2 opacity-60 flex items-center justify-between ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.role === 'assistant' && (
                                    <button
                                        onClick={() => {
                                            if (msg.audio) {
                                                new Audio(msg.audio).play();
                                            } else {
                                                speakText(msg.content);
                                            }
                                        }}
                                        className="ml-2 hover:text-white"
                                        title={msg.audio ? "Replay Voice" : "Read Aloud"}
                                    >
                                        <Volume2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-indigo-600 flex-shrink-0">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center h-12">
                            <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.span
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                                className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#000428]/60 backdrop-blur-md border-t border-white/10">
                <form onSubmit={handleSendMessage} className="relative flex gap-2">
                    <div className="relative flex-1">
                        {isRecording ? (
                            <div className="w-full py-4 px-6 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-red-400">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Recording Vocal...</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={stopRecording}
                                    className="bg-red-500 text-white px-4 py-1 rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                                >
                                    STOP & SEND
                                </button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={isListening ? "Listening..." : "Talk or type to your tutor..."}
                                    className={`w-full pl-6 pr-24 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-400 outline-none transition-all ${isListening ? 'ring-2 ring-indigo-500 animate-pulse' : ''}`}
                                />
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        title="Dictation (STT)"
                                        className={`p-2 rounded-lg transition-all ${isListening ? 'text-indigo-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <Sparkles size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        title="Send Voice Message (Vocal)"
                                        className="p-2 text-gray-400 hover:text-red-400 transition-all"
                                    >
                                        <Mic size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
