import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, Brain, BarChart3, ArrowRight, LogIn, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthRequired = () => {
    const navigate = useNavigate();

    const benefits = [
        {
            icon: Mic,
            title: "Sonic Real-time Analysis",
            description: "Get instant feedback on your pronunciation and fluency with our AI-powered audio analysis engine."
        },
        {
            icon: Brain,
            title: "Socratic Scaffolding",
            description: "Engage in intelligent dialogue that builds your confidence through guided linguistic transitions."
        },
        {
            icon: BarChart3,
            title: "Lexical Analytics",
            description: "Track your diversity index, sophistication scores, and academic word usage over time."
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-['Outfit'] overflow-x-hidden pt-32 pb-20 px-6">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    {/* Left: Content */}
                    <div className="space-y-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-8">
                                <Sparkles size={18} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Driven Excellence</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
                                Unlock Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-indigo-600">Full Potential</span>
                            </h1>
                            <p className="text-xl text-gray-400 font-medium max-w-lg leading-relaxed">
                                Join our elite linguistic community and access cutting-edge AI tools designed to accelerate your English mastery through real-time simulation.
                            </p>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-6">
                            <button
                                onClick={() => navigate('/auth')}
                                className="px-12 py-6 bg-white text-black rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10"
                            >
                                <LogIn size={20} />
                                Start Learning Now
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-12 py-6 bg-white/5 text-white border border-white/10 rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all hover:bg-white/10 hover:scale-105"
                            >
                                View Public Core
                            </button>
                        </div>
                    </div>

                    {/* Right: Benefits Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        {benefits.map((benefit, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1, duration: 0.8 }}
                                className="glass-card p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex gap-8 group hover:border-indigo-500/30 transition-all"
                            >
                                <div className="w-20 h-20 bg-indigo-600/10 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                    <benefit.icon size={32} />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">{benefit.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium">{benefit.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-32 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-16 opacity-30">
                    {['Global Standards', 'Neural Learning', 'Cloud Sync', 'Research Focused'].map(tag => (
                        <div key={tag} className="flex items-center gap-3">
                            <ChevronRight size={16} className="text-red-600" />
                            <span className="text-xs font-black uppercase tracking-[0.4em]">{tag}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthRequired;
