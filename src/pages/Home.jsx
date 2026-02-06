import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Home/Hero';
import ServiceCards from '../components/Home/ServiceCards';
import AboutSection from '../components/Home/AboutSection';
import ContactSection from '../components/Home/ContactSection';



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

            <AboutSection />
            <ContactSection />
        </>
    );
};

export default Home;
