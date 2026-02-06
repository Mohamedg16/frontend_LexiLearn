import React, { useState, useEffect } from 'react';
import LessonAccordion from '../components/Lessons/LessonAccordion';
import { BookOpen, Database, FileText, ImageIcon, Search, Download, Eye, ExternalLink, Loader2 } from 'lucide-react';
import api from '../services/api';

const Lessons = () => {
    const [activeTab, setActiveTab] = useState('curriculum');
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (activeTab === 'library') {
            fetchResources();
        }
    }, [activeTab]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            // Fetch all modules to get all nested resources
            const res = await api.get('/modules');
            if (res.data.success) {
                const allResources = [];
                res.data.data.forEach(mod => {
                    (mod.lessons || []).forEach(lesson => {
                        (lesson.resources || []).forEach(resItem => {
                            allResources.push({
                                ...resItem,
                                moduleTitle: mod.title,
                                lessonTitle: lesson.title
                            });
                        });
                    });
                });
                setResources(allResources);
            }
        } catch (err) {
            console.error('Failed to fetch global resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 px-4 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                        Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Inventory</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-medium">
                        Access the complete repository of linguistic modules and research assets.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-2 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'curriculum'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <BookOpen size={18} />
                            Curriculum
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === 'library'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Database size={18} />
                            Asset Library
                        </button>
                    </div>
                </div>

                {activeTab === 'curriculum' ? (
                    <LessonAccordion />
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Search Bar for Library */}
                        <div className="relative max-w-2xl mx-auto mb-12">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search the research archive..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <Loader2 className="animate-spin text-emerald-500" size={48} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Decrypting Data Grid...</span>
                            </div>
                        ) : filteredResources.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredResources.map((res) => (
                                    <div key={res._id} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col justify-between h-full">
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-xl ${res.type === 'pdf' ? 'bg-red-500/10 text-red-400' : res.type === 'image' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                    {res.type === 'pdf' ? <FileText size={24} /> : res.type === 'image' ? <ImageIcon size={24} /> : <ExternalLink size={24} />}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                                                    {res.type} Format
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors mb-2 uppercase tracking-tight line-clamp-2">{res.title}</h3>
                                            <div className="flex flex-col gap-1 mb-6">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Linked to: {res.lessonTitle}</span>
                                                <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">{res.moduleTitle}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => window.open(res.url, '_blank')}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-white/10"
                                            >
                                                <Eye size={14} /> Preview
                                            </button>
                                            <a
                                                href={res.url}
                                                download={res.title}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
                                            >
                                                <Download size={14} /> Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 glass-card rounded-[3rem] border border-white/5">
                                <Database size={64} className="mx-auto mb-6 text-gray-800" />
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Assets Found</h3>
                                <p className="text-gray-500 font-medium">The research archive is currently empty for this query.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lessons;
