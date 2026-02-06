import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const CountUp = ({ end, duration = 2, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            let startTime;
            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
                setCount(Math.floor(progress * end));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
    }, [isInView, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const StatsCounter = () => {
    const stats = [
        { label: 'Active Students', value: 150, suffix: '' },
        { label: 'Video Lessons', value: 85, suffix: '+' },
        { label: 'Questions Solved', value: 120, suffix: '' },
        { label: 'Expert Tutors', value: 50, suffix: '+' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 my-12">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
                >
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-2 leading-tight py-1">
                        <CountUp end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatsCounter;
