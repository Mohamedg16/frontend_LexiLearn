import React from 'react';
import { motion } from 'framer-motion';
import { Bot, BookOpen, Video, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
    {
        id: 1,
        title: 'Sonic Lab',
        description: 'Engage with our advanced AI speaking simulation for real-time linguistic analysis.',
        icon: Bot,
        color: 'from-red-600 to-red-900',
        path: '/lexilearn',
        bg: 'bg-red-500/10',
        text: 'text-red-500'
    },
    {
        id: 2,
        title: 'Syllabus Arch',
        description: 'Access the complete repository of linguistic modules and research papers.',
        icon: BookOpen,
        color: 'from-indigo-600 to-indigo-900',
        path: '/lessons',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400'
    },
    {
        id: 3,
        title: 'Visual Core',
        description: 'Master English nuances with our 4K cinematic instructional lectures.',
        icon: Video,
        color: 'from-red-600 to-indigo-600',
        path: '/videos',
        bg: 'bg-red-500/10',
        text: 'text-white'
    },
    {
        id: 4,
        title: 'Asset Matrix',
        description: 'Download critical research assets, lexicon maps, and exercise archives.',
        icon: ExternalLink,
        color: 'from-gray-600 to-black',
        path: '/resources',
        bg: 'bg-white/5',
        text: 'text-gray-400'
    }
];

const ServiceCards = () => {
    return (
        <section className="py-20 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to excel</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Our platform provides a complete ecosystem for your learning journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <Link to={card.path} className="block h-full">
                                <div className="glass-card group h-full rounded-2xl p-8 relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${card.color} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />

                                    <div className={`w-14 h-14 rounded-xl ${card.bg} ${card.text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <card.icon size={28} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-pink-400 transition-all">
                                        {card.title}
                                    </h3>

                                    <p className="text-gray-400 leading-relaxed mb-6 group-hover:text-gray-300 transition-colors">
                                        {card.description}
                                    </p>

                                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-500 group-hover:text-white transition-colors mt-auto">
                                        Learn more <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceCards;
