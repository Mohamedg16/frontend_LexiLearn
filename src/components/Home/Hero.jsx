import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative overflow-hidden pt-32 pb-16 lg:pt-48 lg:pb-32">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 drop-shadow-lg">
                        Learn Smarter,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
                            Not Harder.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-300 mb-10 leading-relaxed">
                        Experience the future of education with our AI-driven assistant,
                        interactive lessons, and curated video courses designed to boost your potential.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/auth"
                            state={{ preSelectedRole: 'student' }}
                            className="group px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 transform hover:-translate-y-1"
                        >
                            Get Started as Student
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/auth"
                            state={{ preSelectedRole: 'teacher' }}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 transform hover:-translate-y-1"
                        >
                            Join as Teacher
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
