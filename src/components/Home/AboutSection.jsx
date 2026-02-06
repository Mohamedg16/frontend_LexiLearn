import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import StatsCounter from './StatsCounter';

const AboutSection = () => {
    return (
        <section className="py-20 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob" />
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 glass">
                                {/* Placeholder for an image */}
                                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 h-96 w-full flex items-center justify-center text-white text-opacity-20 text-9xl font-bold">
                                    AI
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Our Mission: Empowering Students with AI
                        </h2>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            We believe that every student deserves personalized support. By combining cutting-edge AI technology with high-quality educational content, we're making learning more accessible, engaging, and effective for everyone.
                        </p>

                        <StatsCounter />

                        <ul className="space-y-4">
                            {[
                                '24/7 AI Homework Assistance',
                                'Curated Video Lessons from Experts',
                                'Interactive Learning Materials',
                                'Community-Driven Resources'
                            ].map((item, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                                    <span className="text-gray-200 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
