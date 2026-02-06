import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Pause, RotateCcw, BarChart2, Save, Send, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';

const SpeechAnalysis = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [interimTranscription, setInterimTranscription] = useState('');
    const [seconds, setSeconds] = useState(0);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);

    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        // Initialize Web Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US'; // Default to English, can be adjusted

            recognitionRef.current.onresult = (event) => {
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                setTranscription(prev => prev + final);
                setInterimTranscription(interim);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError('Speech recognition error: ' + event.error);
                stopRecording();
            };
        } else {
            setError('Your browser does not support Speech Recognition.');
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const startRecording = () => {
        setIsRecording(true);
        setError(null);
        setAnalysisResult(null);
        setIsSaved(false);
        setTranscription('');
        setInterimTranscription('');
        setSeconds(0);

        if (recognitionRef.current) {
            recognitionRef.current.start();
        }

        timerRef.current = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const handleAnalyze = async () => {
        if (!transcription.trim()) {
            setError('Please record some speech first.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/speech/assess', {
                transcription: transcription + interimTranscription,
                duration: seconds
            });

            if (response.data.success) {
                setAnalysisResult(response.data.data);
                setIsSaved(true);
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('Failed to analyze speech. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium border border-indigo-500/20">
                        <Mic size={16} />
                        Speech assessment
                    </div>

                    <h2 className="text-3xl font-bold">Record Your Voice</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Speak clearly into your microphone for 2-3 minutes. Our AI will analyze your vocabulary,
                        lexical diversity, and complexity.
                    </p>

                    <div className="py-8 flex flex-col items-center">
                        <div className={`relative p-8 rounded-full ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-white/5'}`}>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl border-4 ${isRecording
                                        ? 'bg-red-500 border-red-400 hover:bg-red-600'
                                        : 'bg-indigo-600 border-indigo-500 hover:bg-indigo-700'
                                    }`}
                            >
                                {isRecording ? <MicOff size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
                            </button>

                            {isRecording && (
                                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
                            )}
                        </div>

                        <div className="mt-6 text-4xl font-mono font-bold text-white tabular-nums">
                            {formatTime(seconds)}
                        </div>

                        {seconds > 180 && (
                            <p className="mt-2 text-amber-400 text-sm font-medium">
                                Target duration reached (3 mins limit recommended)
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isRecording || !transcription.trim() || isLoading}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <BarChart2 size={20} />
                                    Analyze Speech
                                </>
                            )}
                        </button>

                        {(transcription || analysisResult) && (
                            <button
                                onClick={() => {
                                    setTranscription('');
                                    setAnalysisResult(null);
                                    setSeconds(0);
                                    setInterimTranscription('');
                                    setIsSaved(false);
                                }}
                                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-white/10"
                            >
                                <RotateCcw size={20} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                >
                    <AlertCircle size={20} />
                    {error}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transcription View */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                    <h3 className="font-bold flex items-center gap-2">
                        <FileText size={20} className="text-indigo-400" />
                        Transcription
                    </h3>
                    <div className="min-h-[200px] p-4 bg-black/40 rounded-xl overflow-hidden relative">
                        <p className="text-gray-200 leading-relaxed text-sm md:text-base">
                            {transcription}
                            <span className="text-gray-500 italic">{interimTranscription}</span>
                            {!transcription && !interimTranscription && (
                                <span className="text-gray-600 italic">Transcription will appear here while you speak...</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Analysis Results */}
                <AnimatePresence>
                    {analysisResult && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card p-6 rounded-2xl border border-white/10 space-y-6"
                        >
                            <h3 className="font-bold flex items-center gap-2 text-emerald-400">
                                <CheckCircle size={20} />
                                Analysis Results
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Word Count</div>
                                    <div className="text-2xl font-bold">{analysisResult.wordCount}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Unique Words</div>
                                    <div className="text-2xl font-bold">{analysisResult.uniqueWordCount}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Lexical Diversity</div>
                                    <div className="text-2xl font-bold text-indigo-400">{analysisResult.lexicalDiversity}</div>
                                    <div className="text-[10px] text-gray-500">(Higher is more varied)</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Advanced Words</div>
                                    <div className="text-2xl font-bold text-purple-400">{analysisResult.advancedWordsCount}</div>
                                    <div className="text-[10px] text-gray-500">(Long & complex words)</div>
                                </div>
                            </div>

                            {analysisResult.advancedWords.length > 0 && (
                                <div>
                                    <div className="text-sm font-semibold mb-3 text-gray-300">Advanced Vocabulary Detected:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.advancedWords.map((word, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm border border-indigo-500/10">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isSaved && (
                                <div className="pt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                    <CheckCircle size={16} />
                                    Results saved to your profile and shared with your teacher.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpeechAnalysis;
