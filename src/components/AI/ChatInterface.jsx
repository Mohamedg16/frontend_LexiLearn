import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue;
        const newUserMessage = {
            role: 'user',
            content: userText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await api.post('/ai-chat/send', {
                message: userText,
                conversationId
            });

            if (res.data.success) {
                const { response, conversationId: nextId } = res.data.data;
                setConversationId(nextId);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response,
                    timestamp: new Date().toISOString()
                }]);
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

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Chat Header */}
            <div className="bg-[#000428]/60 backdrop-blur-md p-4 border-b border-white/10 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    <Bot className="text-white" size={24} />
                </div>
                <div>
                    <h3 className="text-white font-bold">AI Study Assistant</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-gray-300">Online</span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/20">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="p-4 bg-indigo-600/20 rounded-full text-indigo-400">
                            <Bot size={48} />
                        </div>
                        <h4 className="text-xl font-bold text-white uppercase tracking-tight">Academic Uplink Active</h4>
                        <p className="text-gray-400 text-sm max-w-xs font-medium">Initialize your session by asking any questions about your curriculum or English concepts.</p>
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
                            <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
                            <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full pl-6 pr-14 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-400 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
