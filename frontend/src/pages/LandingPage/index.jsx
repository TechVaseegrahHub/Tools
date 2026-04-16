import React from 'react';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Footer from './Footer';

const LandingPage = () => {
    return (
        <div className="landing-theme min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Hero />
            <Features />
            <Pricing />
            <Footer />
        </div>
    );
};

export default LandingPage;
