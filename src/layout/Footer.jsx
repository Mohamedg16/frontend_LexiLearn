import React from 'react';
import { Rocket, Github, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#000212] border-t border-white/5 pt-16 pb-8 text-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-white mb-4">
                            <Rocket className="text-indigo-500" size={24} />
                            <span className="text-xl font-bold">LexiLearn</span>
                        </Link>
                        <p className="text-sm leading-relaxed">
                            Empowering students with AI-driven tools, comprehensive lessons, and a community of learners. The future of education is here.
                        </p>
                        <div className="flex gap-4 pt-4">
                            {[Github, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-white/5 hover:border-indigo-500/50"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Platform</h3>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', path: '/' },
                                { label: 'Lessons', path: '/lessons' },
                                { label: 'Video Tutorials', path: '/videos' },
                                { label: 'LexiLearn', path: '/lexilearn' }
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link to={link.path} className="text-sm hover:text-indigo-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Resources</h3>
                        <ul className="space-y-3">
                            {[
                                'Study Guides',
                                'Exam Prep',
                                'Student Blog',
                                'Tools Library',
                                'Community Forum'
                            ].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm hover:text-indigo-400 transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
                        <p className="text-sm mb-4">Subscribe to our newsletter for the latest study tips and platform updates.</p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
                            />
                            <button className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all text-sm shadow-lg shadow-indigo-500/20">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} LexiLearn AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
