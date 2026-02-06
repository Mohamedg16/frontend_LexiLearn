import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Filter, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const VideoGrid = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await api.get('/videos');
                if (res.data.success) {
                    setVideos(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch videos:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    const categories = ['All', ...new Set([
        ...videos.map(v => v.category).filter(Boolean)
    ])];

    const filteredVideos = videos.filter(video => {
        const matchesCategory = activeCategory === 'All' || video.category === activeCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (video.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getPlayUrl = (video) => {
        if (video.type === 'standalone-video') {
            return video.youtubeUrl;
        }
        return `/learn/${video._id}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-red-600" size={48} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Streaming Media Node...</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-center">
                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search educational videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-500/50 outline-none transition-all text-xs font-medium"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode='popLayout'>
                    {filteredVideos.map((video) => (
                        <motion.div
                            key={video._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="glass-card rounded-[2rem] overflow-hidden group hover:border-red-500/30 transition-all duration-300 bg-white/5 relative"
                        >
                            {/* Dynamic Background */}
                            <div
                                className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none group-hover:opacity-40 transition-opacity duration-700"
                                style={{
                                    backgroundImage: `url(${video.thumbnail || `https://img.youtube.com/vi/${video.youtubeUrl?.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            />

                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeUrl?.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg` || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600`}
                                    alt={video.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all flex items-center justify-center">
                                    <a
                                        href={video.youtubeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-xl shadow-red-600/40"
                                    >
                                        <Play fill="white" className="ml-1" size={24} />
                                    </a>
                                </div>
                                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-black/80 text-[10px] font-black text-white flex items-center gap-2 backdrop-blur-md uppercase tracking-widest">
                                    <Clock size={12} />
                                    {video.duration || 15}m
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-500/10 uppercase tracking-widest">
                                        {video.category || 'English Research'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-red-500 transition-colors line-clamp-2">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">
                                    {video.description || 'Accessing core linguistic instructional data for this academic module.'}
                                </p>
                                <a
                                    href={video.youtubeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 transition-colors gap-2 group/link border-b border-transparent hover:border-red-500/40 pb-1"
                                >
                                    Launch Video Class
                                    <Play size={12} fill="currentColor" className="group-hover/link:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredVideos.length === 0 && (
                <div className="text-center py-32 glass-card rounded-[3rem] border border-white/10 bg-white/5">
                    <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">No research footage found matching your current parameters.</p>
                </div>
            )}
        </div>
    );
};

export default VideoGrid;
