import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Wrench, Globe, Book, FileText, ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import api from '../../services/api';

const ResourceList = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    const getIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('tool') || cat.includes('productivity')) return Wrench;
        if (cat.includes('platform') || cat.includes('learn')) return Globe;
        if (cat.includes('research') || cat.includes('book') || cat.includes('reference')) return Book;
        return FileText;
    };

    const fetchResources = async () => {
        try {
            const res = await api.get('/resources');
            if (res.data.success) {
                const data = res.data.data;
                // Group by category
                const groups = data.reduce((acc, resource) => {
                    const cat = resource.category || 'General';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(resource);
                    return acc;
                }, {});

                const formattedSections = Object.keys(groups).map(category => ({
                    category,
                    icon: getIcon(category),
                    items: groups[category]
                }));

                setSections(formattedSections);
            }
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="font-bold uppercase tracking-widest text-sm">Accessing Toolkit...</p>
            </div>
        );
    }

    if (sections.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="font-bold uppercase tracking-widest text-sm underline decoration-red-500 underline-offset-8">No resources registered in the grid yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            {sections.map((section, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-white/10 text-indigo-400">
                            <section.icon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{section.category}</h3>
                    </div>

                    <div className="space-y-4">
                        {section.items.map((item, itemIdx) => (
                            <a
                                key={itemIdx}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 rounded-xl glass border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.type === 'pdf' && <FileText size={12} className="text-red-400" />}
                                            {item.type === 'image' && <ImageIcon size={12} className="text-emerald-400" />}
                                            {item.type === 'link' && <LinkIcon size={12} className="text-blue-400" />}
                                            <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {item.description || "No description provided."}
                                        </p>
                                        {item.lessonId?.title && (
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                Node: {item.lessonId.title}
                                            </span>
                                        )}
                                    </div>
                                    <ExternalLink size={16} className="text-gray-500 group-hover:text-indigo-400 transition-colors shrink-0 ml-4" />
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ResourceList;
