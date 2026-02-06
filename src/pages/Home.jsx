import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import ServiceCards from '../components/Home/ServiceCards';
import AboutSection from '../components/Home/AboutSection';
import ContactSection from '../components/Home/ContactSection';
import { PlayCircle, BookOpen, Eye, Mic } from 'lucide-react';
import api from '../services/api';

const FeaturedLessons = () => {
    const [lessons, setLessons] = useState([]);

    useEffect(() => {
        const fetchLatestLessons = async () => {
            try {
                const res = await api.get('/modules');
                if (res.data.success) {
                    const allLessons = [];
                    res.data.data.forEach(mod => {
                        (mod.lessons || []).forEach(lesson => {
                            allLessons.push({ ...lesson, subject: mod.title });
                        });
                    });

                    const sortedLessons = allLessons
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 6);

                    setLessons(sortedLessons);
                }
            } catch (err) {
                console.error('Failed to fetch featured lessons:', err);
            }
        };
        fetchLatestLessons();
    }, []);

    if (lessons.length === 0) return null;

    return (
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Lessons</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Explore the latest lessons uploaded by our expert teachers
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map((lesson) => (
                        <div key={lesson._id} className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
                            <div className="relative">
                                {lesson.thumbnailUrl ? (
                                    <img
                                        src={lesson.thumbnailUrl}
                                        alt={lesson.title}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                                        <BookOpen size={48} className="text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
                                        {lesson.subject}
                                    </span>
                                </div>
                                {lesson.videoUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="p-3 bg-black/60 backdrop-blur-sm rounded-full">
                                            <PlayCircle size={32} className="text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">{lesson.title}</h3>
                                {lesson.description && (
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        {new Date(lesson.createdAt).toLocaleDateString()}
                                    </div>
                                    <Link
                                        to={`/learn/${lesson._id}`}
                                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        Learn
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link
                        to="/lessons"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all"
                    >
                        <BookOpen size={20} />
                        View All Lessons
                    </Link>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollToContact) {
            // Add a small delay for smooth animation after navigation
            setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                // Optional: Clear state to prevent scrolling again on refresh? 
                // In React Router, state persists, but typically this is fine.
                window.history.replaceState({}, document.title);
            }, 100);
        }
    }, [location]);

    return (
        <>
            <Hero />
            <ServiceCards />
            <FeaturedLessons />
            <AboutSection />
            <ContactSection />
        </>
    );
};

export default Home;
