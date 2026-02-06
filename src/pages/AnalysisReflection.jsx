import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    BarChart3,
    Zap,
    BrainCircuit,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import axios from 'axios';

/**
 * Circular Progress Component for Metrics
 */
const CircularProgress = ({ value, label, color, icon: Icon, delay = 0 }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="relative flex flex-col items-center p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl"
        >
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ delay: delay + 0.5, duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className="w-5 h-5 mb-1 text-white/70" />
                    <span className="text-2xl font-bold text-white">{Math.round(value)}%</span>
                </div>
            </div>
            <h3 className="mt-4 text-sm font-medium text-white/80 uppercase tracking-wider">{label}</h3>
        </motion.div>
    );
};

const AnalysisReflection = () => {
    const [transcript, setTranscript] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalysis = async () => {
        if (!transcript.trim()) {
            setError("Please provide a transcript to analyze.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Note: Proxy in vite.config.js handles the http://localhost:5000 part
            const response = await axios.post('/api/analysis/lexical', {
                text: transcript
            });

            if (response.data.success) {
                setResult(response.data.data);
            } else {
                throw new Error(response.data.message || "Analysis failed");
            }
        } catch (err) {
            console.error("Analysis Error:", err);
            setError(err.response?.data?.message || err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getPercentage = (val) => {
        if (typeof val === 'number') return val;
        return 0;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-blue-400 mb-2"
                    >
                        <BrainCircuit size={20} />
                        <span className="text-sm font-semibold uppercase tracking-widest">Phase 3</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400"
                    >
                        Analysis & Reflection
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-slate-400 max-w-2xl"
                    >
                        Our AI-powered linguistic engine analyzes your vocabulary reach, complexity, and structural variety to help you speak more fluently.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText size={80} />
                            </div>

                            <label className="block text-lg font-medium mb-4 flex items-center gap-2">
                                <FileText className="text-blue-400" size={20} />
                                Transcript Input
                            </label>

                            <textarea
                                className="w-full h-64 bg-slate-900/50 border border-slate-700 rounded-2xl p-6 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none placeholder:text-slate-600"
                                placeholder="Paste your transcription here or upload an audio file..."
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                            />

                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className={`mt-6 w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${loading
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/20 active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Processing with AI...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="fill-current" size={18} />
                                        Run Linguistic Analysis
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3"
                            >
                                <AlertCircle size={20} />
                                <span className="text-sm">{error}</span>
                            </motion.div>
                        )}
                    </motion.section>

                    {/* Results Section */}
                    <section className="relative">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-slate-500"
                                >
                                    <BarChart3 size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg">Waiting for analysis...</p>
                                    <p className="text-sm max-w-xs mt-2">Enter your transcript and click run to see your complexity metrics.</p>
                                </motion.div>
                            ) : result.status === "insufficient_data" ? (
                                <motion.div
                                    key="insufficient"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full bg-amber-500/10 border border-amber-500/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <AlertCircle size={48} className="mb-4 text-amber-400" />
                                    <h3 className="text-2xl font-bold text-white mb-2">Insufficient Speech Data</h3>
                                    <p className="text-slate-400 max-w-sm mx-auto">
                                        We couldn't analyze your speech. Please try to speak for at least 30 seconds to provide enough data for a reliable analysis.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Dashboard Area */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <CircularProgress
                                            label="Density"
                                            value={getPercentage(result.analysis.lexicalDensity)}
                                            color="#3b82f6"
                                            icon={BarChart3}
                                        />
                                        <CircularProgress
                                            label="Diversity"
                                            value={getPercentage(result.analysis.mtldScore)}
                                            color="#8b5cf6"
                                            icon={RefreshCw}
                                            delay={0.1}
                                        />
                                        <CircularProgress
                                            label="Sophistication"
                                            value={getPercentage(result.analysis.lexicalSophistication)}
                                            color="#ec4899"
                                            icon={BrainCircuit}
                                            delay={0.2}
                                        />
                                    </div>

                                    {/* Summary Card */}
                                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                                <CheckCircle2 size={24} className="text-blue-400" />
                                            </div>
                                            <h2 className="text-2xl font-bold">Analysis Complete</h2>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                                <span className="text-slate-400">Word Count</span>
                                                <span className="font-mono text-xl">{result.analysis.wordCount || transcript.split(/\s+/).length} words</span>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed italic">
                                                "Your lexical diversity indicates a strong command of varied vocabulary. Focus on increasing your lexical density by using fewer filler words and more precise content-bearing terms."
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transcript Review */}
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Original Transcript</h3>
                                        <div className="text-slate-300 max-h-40 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 custom-scrollbar">
                                            {transcript}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>
            </div>

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
};

export default AnalysisReflection;
