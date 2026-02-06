import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ContactSection = () => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formState.name) newErrors.name = 'Name is required';
        if (!formState.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formState.message) newErrors.message = 'Message is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setStatus('submitting');
        setErrorMessage('');

        try {
            const response = await api.post('/contact', {
                name: formState.name,
                email: formState.email,
                message: formState.message
            });

            if (response.data.success) {
                setStatus('success');
                setFormState({ name: '', email: '', message: '' });
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Failed to send message. Please try again.');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    return (
        <section id="contact" className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get in Touch</h2>
                    <p className="text-xl text-gray-400">
                        Have questions or suggestions? We'd love to hear from you.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="glass rounded-2xl p-8 md:p-10 relative overflow-hidden"
                >
                    <AnimatePresence>
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-[#000428]/95 backdrop-blur-md z-10"
                            >
                                <CheckCircle className="text-emerald-500 w-16 h-16 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-400">We'll get back to you as soon as possible.</p>
                            </motion.div>
                        ) : status === 'error' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-[#000428]/95 backdrop-blur-md z-10"
                            >
                                <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
                                <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
                                <p className="text-gray-400">{errorMessage}</p>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formState.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${errors.name ? 'border-red-500/50' : 'border-white/10'} text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                                        placeholder="Your Name"
                                    />
                                    {errors.name && <AlertCircle className="absolute right-3 top-3 text-red-500" size={18} />}
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formState.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all`}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && <AlertCircle className="absolute right-3 top-3 text-red-500" size={18} />}
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                            <div className="relative">
                                <textarea
                                    rows="4"
                                    name="message"
                                    value={formState.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg bg-white/5 border ${errors.message ? 'border-red-500/50' : 'border-white/10'} text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none`}
                                    placeholder="How can we help you?"
                                ></textarea>
                                {errors.message && <AlertCircle className="absolute right-3 top-3 text-red-500" size={18} />}
                            </div>
                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            {!status === 'submitting' && <Send size={18} />}
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;
