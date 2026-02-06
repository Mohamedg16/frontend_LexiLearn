import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, Book, Mic, Send, MessageSquare, Sparkles,
    CheckCircle, AlertCircle, Play, RotateCcw, BarChart2
} from 'lucide-react';
import api from '../../services/api';

const SpeakingPractice = () => {
    const [step, setStep] = useState('list'); // list, intro, planning, recording, feedback
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [planningTool, setPlanningTool] = useState('coach'); // coach, role-play
    const [planningTimeSpent, setPlanningTimeSpent] = useState(0);
    const [history, setHistory] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTalkingToAi, setIsTalkingToAi] = useState(false);

    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const planningTimerRef = useRef(null);

    useEffect(() => {
        fetchTasks();
        return () => {
            clearInterval(timerRef.current);
            clearInterval(planningTimerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const fetchTasks = async () => {
        try {
            // Tasks are viewable by all authenticated users
            const tasksRes = await api.get('/tasks');
            if (tasksRes.data.success) setTasks(tasksRes.data.data);

            // History is student-specific
            if (localStorage.getItem('token')) { // Basic check, but role is better if available
                try {
                    const historyRes = await api.get('/speaking/history');
                    if (historyRes.data.success) setHistory(historyRes.data.data);
                } catch (histErr) {
                    console.log('Skipping speaking history (Expected for non-student roles)');
                }
            }
        } catch (err) {
            console.error('Failed to fetch speaking tasks:', err);
        }
    };

    const startPlanning = async (task) => {
        setSelectedTask(task);
        setStep('planning');
        setTimeLeft(task.planningTimeLimit || 300);
        setInputValue('');

        // Fetch existing conversation from DB for this task
        try {
            const res = await api.get(`/speaking/prep/history/${task._id}`);
            if (res.data.success) {
                setChatMessages(res.data.data);
            }
        } catch (err) {
            console.log('No previous prep chat discovered.');
            setChatMessages([]);
        }

        planningTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(planningTimerRef.current);
                    startRecordingPhase();
                    return 0;
                }
                setPlanningTimeSpent(t => t + 1);
                return prev - 1;
            });
        }, 1000);
    };

    const startRecordingPhase = () => {
        clearInterval(planningTimerRef.current);
        setStep('recording');
        setTimeLeft(selectedTask.timeLimit || 120);

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let final = '';
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) final += event.results[i][0].transcript;
                    else interim += event.results[i][0].transcript;
                }
                setTranscription(prev => prev + final);
                setInterimTranscript(interim);
            };
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        } else {
            // Start Text-to-Speech recognition
            if (recognitionRef.current) recognitionRef.current.start();

            // Start Audio-to-Blob recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            toggleRecording();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (err) {
                console.error('Failed to get microphone stream:', err);
                alert('Could not access microphone.');
            }
        }
    };

    const handleSubmit = async () => {
        try {
            let audioUrl = '';

            // 1. Create blob and upload
            if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', audioBlob, `speaking-${Date.now()}.webm`);

                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadRes.data.success) {
                    audioUrl = uploadRes.data.data.url;
                }
            }

            // 2. Submit task with audio URL
            const res = await api.post('/speaking/submit', {
                taskId: selectedTask._id === 'general' ? null : selectedTask._id,
                transcription: transcription + interimTranscript,
                duration: selectedTask.timeLimit - timeLeft,
                planningTimeSpent,
                audioUrl
            });

            if (res.data.success) {
                setFeedback(res.data.data);
                setStep('feedback');
            }
        } catch (err) {
            console.error(err);
            alert('Submission failed. Please try again.');
        }
    };

    // UI Helpers
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTalkingToAi) return;

        const userMsg = { role: 'user', content: inputValue };
        setChatMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTalkingToAi(true);

        try {
            const endpoint = planningTool === 'coach' ? '/speaking/prep/coach' : '/speaking/prep/roleplay';
            const res = await api.post(endpoint, {
                message: inputValue,
                taskId: selectedTask._id === 'general' ? null : selectedTask._id,
                history: chatMessages
            });

            if (res.data.success) {
                setChatMessages(prev => [...prev, { role: 'ai', content: res.data.data.response }]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsTalkingToAi(false);
        }
    };

    if (step === 'list') return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Available Speaking Tasks</h2>

            <div className="grid gap-6">
                {/* General Practice Card - Always Available */}
                <div className="glass-card p-8 rounded-[2rem] border-2 border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500 transition-all flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-indigo-500/10">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 px-2 py-1 rounded">Open Mode</span>
                            <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold uppercase"><Sparkles size={12} /> Best for warm-up</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white">General Speaking Practice</h3>
                        <p className="text-gray-400 text-sm max-w-md">Practice speaking about any topic. Use the AI coach to prepare, record for 2-3 minutes, and get your lexical results instantly.</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTask({
                                _id: 'general',
                                title: 'General Speaking Practice',
                                prompt: 'Talk about your day, a hobby, or something you are passionate about. Try to speak for at least 2 minutes.',
                                timeLimit: 180,
                                planningTimeLimit: 300,
                                targetVocabulary: ['furthermore', 'consequently', 'illustrate', 'substantial']
                            });
                            setStep('intro');
                        }}
                        className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl border border-indigo-500/50 transition-all font-bold text-lg shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        Start Speaking Now
                    </button>
                </div>

                {tasks.length > 0 && <div className="border-t border-white/10 my-4"></div>}

                {tasks.map(task => (
                    <div key={task._id} className="glass-card p-6 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all group flex justify-between items-center">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{task.timePoint}</span>
                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{task.title}</h3>
                            <p className="text-gray-400 text-sm">{task.description}</p>
                        </div>
                        <button
                            onClick={() => { setSelectedTask(task); setStep('intro'); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl border border-indigo-500/50 transition-all font-bold"
                        >
                            Start Task
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (step === 'intro') return (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-[2rem] border border-white/10 text-center space-y-8">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold">{selectedTask.title}</h2>
                <div className="flex justify-center gap-6 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={16} /> Prep: {formatTime(selectedTask.planningTimeLimit)}</span>
                    <span className="flex items-center gap-1"><Mic size={16} /> Speak: {formatTime(selectedTask.timeLimit)}</span>
                </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl text-left space-y-4">
                <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-xs">Topic Prompt</h4>
                <p className="text-lg leading-relaxed">{selectedTask.prompt}</p>
            </div>

            {selectedTask.targetVocabulary?.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-bold text-gray-400 uppercase tracking-wider text-xs">Target Vocabulary</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                        {selectedTask.targetVocabulary.map(word => (
                            <span key={word} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm">{word}</span>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={() => startPlanning(selectedTask)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-2xl font-bold text-xl transition-all shadow-xl"
            >
                Begin Planning
            </button>
        </div>
    );

    if (step === 'planning') return (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-1 rounded-2xl border border-white/10">
                        <button
                            onClick={() => setPlanningTool('coach')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${planningTool === 'coach' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Sparkles size={18} /> AI Vocab Coach
                        </button>
                        <button
                            onClick={() => setPlanningTool('role-play')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold ${planningTool === 'role-play' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <MessageSquare size={18} /> AI Role-play
                        </button>
                    </div>

                    <div className="h-[400px] bg-black/30 rounded-2xl border border-white/5 p-4 overflow-y-auto space-y-4">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} max-w-[90%] ${msg.role === 'user' ? 'ml-auto' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${msg.role === 'ai' ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                                    {msg.role === 'ai' ? 'AI' : 'YOU'}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-white/10 rounded-tl-none font-medium' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatMessages.length === 0 && (
                            <div className="flex gap-3 max-w-[80%]">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">AI</div>
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none font-medium text-sm">
                                    {planningTool === 'coach'
                                        ? "I'm your Vocab Coach! Ask me for synonyms, stronger verbs, or to check a phrase. (I won't write full speeches for you, though!)"
                                        : "Let's warm up. I'll play a role related to your task. Ready? I'll ask 3 small questions."
                                    }
                                </div>
                            </div>
                        )}
                        {isTalkingToAi && <div className="text-gray-500 text-xs italic animate-pulse">AI is typing...</div>}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your prep questions here..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-4 outline-none focus:border-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isTalkingToAi}
                            className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl border border-white/10 text-center space-y-4 bg-indigo-500/5">
                    <div className="text-gray-400 font-bold text-xs uppercase tracking-widest">Planning Time</div>
                    <div className={`text-4xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={startRecordingPhase}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all border border-white/10"
                    >
                        I'm Ready Now
                    </button>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2"><Book size={16} /> Useful Vocabulary</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTask.targetVocabulary.map(word => (
                            <span key={word} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-xs">{word}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (step === 'recording') return (
        <div className="max-w-2xl mx-auto glass-card p-12 rounded-[2.5rem] border border-white/10 text-center space-y-12 relative overflow-hidden">
            <div className="space-y-6 relative z-10">
                <div className="flex flex-col items-center gap-4">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isRecording ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                        <button
                            onClick={toggleRecording}
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            <Mic size={40} className="text-white" />
                        </button>
                    </div>
                    <div className="text-4xl font-mono font-bold">{formatTime(timeLeft)}</div>
                    <p className="text-gray-400 font-medium">
                        {isRecording ? "Listening... Speak clearly." : "Press the button to start recording."}
                    </p>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl min-h-[150px] text-left text-gray-300 relative">
                    <p className="text-sm md:text-base leading-relaxed">
                        {transcription}
                        <span className="text-gray-500 italic">{interimTranscript}</span>
                        {!transcription && !interimTranscript && (
                            <span className="text-gray-600 italic">Your spoken text will appear here...</span>
                        )}
                    </p>
                </div>

                <div className="flex gap-4">
                    {!isRecording && transcription && (
                        <>
                            <button onClick={() => { setTranscription(''); setInterimTranscript(''); setTimeLeft(selectedTask.timeLimit); }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/10">
                                <RotateCcw size={20} /> Reset
                            </button>
                            <button onClick={handleSubmit} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
                                <CheckCircle size={20} /> Submit Recording
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    if (step === 'feedback') {
        const previousSub = history.find(h => h.taskId?._id === selectedTask._id) || history[0];
        const isHigher = (key) => previousSub ? feedback[key] > previousSub[key] : null;

        return (
            <div className="max-w-3xl mx-auto glass-card p-10 rounded-[2.5rem] border border-white/10 space-y-10">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-4xl font-bold">Task Completed!</h2>
                    <p className="text-gray-400">Here is a quick look at your speaking performance numbers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center relative overflow-hidden">
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Different Words</div>
                        <div className="text-4xl font-bold text-white mb-1">{feedback.uniqueWordCount}</div>
                        <div className="text-xs text-gray-500">out of {feedback.wordCount} total</div>
                        {isHigher('uniqueWordCount') !== null && (
                            <div className={`text-[10px] mt-2 font-bold ${isHigher('uniqueWordCount') ? 'text-green-400' : 'text-amber-400'}`}>
                                {isHigher('uniqueWordCount') ? '▲ Higher than last' : '▼ Lower than last'}
                            </div>
                        )}
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Diversity Score</div>
                        <div className="text-4xl font-bold text-indigo-400 mb-1">{feedback.lexicalDiversity}%</div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">Variety</div>
                        {isHigher('lexicalDiversity') !== null && (
                            <div className={`text-[10px] mt-2 font-bold ${isHigher('lexicalDiversity') ? 'text-green-400' : 'text-amber-400'}`}>
                                {isHigher('lexicalDiversity') ? '▲ Higher than last' : '▼ Lower than last'}
                            </div>
                        )}
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-center">
                        <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">Adv. Vocabulary</div>
                        <div className="text-4xl font-bold text-purple-400 mb-1">{feedback.lexicalSophistication}%</div>
                        <div className="text-xs text-gray-500">Sophistication</div>
                        {isHigher('lexicalSophistication') !== null && (
                            <div className={`text-[10px] mt-2 font-bold ${isHigher('lexicalSophistication') ? 'text-green-400' : 'text-amber-400'}`}>
                                {isHigher('lexicalSophistication') ? '▲ Higher than last' : '▼ Lower than last'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-black/40 p-8 rounded-3xl space-y-4 border border-white/5">
                    <h4 className="font-bold flex items-center gap-2"><BarChart2 size={18} className="text-indigo-400" /> Research Summary</h4>
                    <p className="text-gray-300 leading-relaxed italic">
                        "You used {feedback.uniqueWordCount} different words in {feedback.wordCount} total words.
                        About {feedback.lexicalSophistication}% of your words were advanced (low-frequency) vocabulary.
                        Your lexical density was {feedback.lexicalDensity}%, showing a strong use of content words."
                    </p>
                </div>

                <button
                    onClick={() => { setStep('list'); setFeedback(null); setSelectedTask(null); fetchTasks(); }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-all border border-white/10"
                >
                    Return to Task List
                </button>
            </div>
        );
    }

    return null;
};

export default SpeakingPractice;
