import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Download, Eye, Search, BookOpen, PlayCircle, Video, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';

const LessonAccordion = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await api.get('/lessons');
                if (res.data.success) {
                    const lessons = res.data.data;

                    const formattedContent = [];
                    lessons.forEach(l => {
                        // Add the lesson
                        formattedContent.push({
                            ...l,
                            type: 'lesson',
                            displayCategory: 'Academic Session'
                        });

                        // Add associated resources
                        if (l.resources && l.resources.length > 0) {
                            l.resources.forEach(r => {
                                formattedContent.push({
                                    ...r,
                                    type: 'resource',
                                    displayCategory: `Asset for: ${l.title}`
                                });
                            });
                        }
                    });

                    setSubjects([{
                        id: 'all-lessons',
                        name: 'English Curriculum',
                        icon: '📖',
                        content: formattedContent
                    }]);
                    setExpanded('all-lessons');
                }
            } catch (err) {
                console.error('Failed to fetch syllabus:', err);
            }
        };
        fetchContent();
    }, []);

    const filteredSubjects = subjects.map(subject => ({
        ...subject,
        content: subject.content.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(subject => subject.content.length > 0);

    const handlePreview = (item) => {
        if (item.type === 'lesson') {
            // Navigate to lesson learning page
            navigate(`/lessons/${item._id}`);
        } else if (item.videoUrl) {
            window.open(item.videoUrl, '_blank');
        } else if (item.url) {
            window.open(item.url, '_blank');
        }
    };

    const handleDownload = (item) => {
        if (item.url) {
            const link = document.createElement('a');
            link.href = item.url;
            link.download = item.title;
            link.click();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-4 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-lg"
                    placeholder="Search for lessons, topics, or materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                        <div key={subject.id} className="glass rounded-2xl overflow-hidden border border-white/10">
                            <button
                                onClick={() => setExpanded(expanded === subject.id ? null : subject.id)}
                                className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors ${expanded === subject.id ? 'bg-white/10' : 'hover:bg-white/5'
                                    }`}
                            >
                                <span className="flex items-center gap-3 text-lg font-bold text-white">
                                    <span className="text-2xl">{subject.icon}</span>
                                    {subject.name}
                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                                        {subject.content.length} items
                                    </span>
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded === subject.id ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {expanded === subject.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden bg-black/20"
                                    >
                                        <div className="p-6 space-y-3">
                                            {subject.content.map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                        <div className={`p-2.5 rounded-lg ${item.type === 'lesson' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                            {item.type === 'lesson' ? (
                                                                item.videoUrl ? <Video size={20} /> : <PlayCircle size={20} />
                                                            ) : (
                                                                (item.url?.toLowerCase().includes('.pdf') || item.format === 'pdf') ? <FileText size={20} /> :
                                                                    (['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => item.url?.toLowerCase().endsWith(ext))) ? <ImageIcon size={20} /> :
                                                                        <LinkIcon size={20} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            <div className="flex gap-4 text-[10px] text-gray-400 mt-1 font-black uppercase tracking-widest">
                                                                <span className={item.type === 'lesson' ? 'text-indigo-400' : 'text-emerald-400'}>{item.type === 'lesson' ? 'Core Lesson' : 'Research Asset'}</span>
                                                                <span>•</span>
                                                                <span>{item.displayCategory}</span>
                                                            </div>
                                                            {item.description && (
                                                                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{item.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {(item.videoUrl || item.url || item.type === 'lesson') && (
                                                            <button
                                                                onClick={() => handlePreview(item)}
                                                                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-green-600/80 text-white text-sm hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Eye size={16} /> {item.type === 'lesson' ? 'Learn' : item.videoUrl ? 'Watch' : 'Preview'}
                                                            </button>
                                                        )}
                                                        {item.url && (
                                                            <button
                                                                onClick={() => handleDownload(item)}
                                                                className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-indigo-600/80 text-white text-sm hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                                                            >
                                                                <Download size={16} /> Download
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <BookOpen size={32} className="text-gray-500" />
                        </div>
                        <p className="text-gray-400 text-lg">No content found matching your search.</p>
                        <p className="text-gray-500 text-sm mt-2">Teachers can add lessons and resources from their dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonAccordion;
