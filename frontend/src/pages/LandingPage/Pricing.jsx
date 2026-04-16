import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Intense opposing parallax
    const card1Y = useTransform(scrollYProgress, [0, 1], [150, -150]);
    const card2Y = useTransform(scrollYProgress, [0, 1], [250, -250]);

    return (
        <section ref={ref} className="py-32 bg-white relative border-b-4 border-black font-mono-tech">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-20 text-center">
                    <div className="inline-block bg-[#ff0000] text-white font-bold px-3 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase tracking-widest text-sm">
                        Simple Plans
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter break-words" style={{ fontFamily: 'Syncopate' }}>
                        PLANS
                    </h2>
                </div>

                {/* Brutalist Toggle Switch */}
                <div className="flex justify-center mb-16 relative z-30">
                    <div className="flex flex-col sm:flex-row border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`w-full sm:w-36 py-3 px-4 sm:px-0 text-sm font-bold tracking-widest uppercase transition-colors ${!isAnnual ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-gray-100'}`}
                        >
                            EVERY MONTH
                        </button>
                        <div className="h-1 w-full sm:w-1 sm:h-auto bg-black"></div>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`w-full sm:w-36 py-3 px-4 sm:px-0 text-sm font-bold tracking-widest uppercase transition-colors ${isAnnual ? 'bg-[#ff0000] text-white' : 'bg-transparent text-black hover:bg-gray-100'}`}
                        >
                            EVERY YEAR
                        </button>
                    </div>
                </div>

                <div className="mt-12 space-y-12 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:max-w-7xl lg:mx-auto">

                    {/* Brutal Free Tier */}
                    <motion.div
                        style={{ y: card1Y }}
                        className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative z-10"
                    >
                        <div className="p-6 border-b-4 border-black">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Syncopate' }}>01. FREE</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">TEST THE WATERS</p>
                            <div className="mt-6 mb-6 flex items-end">
                                <span className="text-5xl font-black tracking-tighter" style={{ fontFamily: 'Syncopate' }}>₹0</span>
                                <span className="text-lg font-bold ml-2 mb-1">/MO</span>
                            </div>
                            <Link to="/register-org">
                                <button className="w-full py-3 border-2 border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Start Free
                                </button>
                            </Link>
                        </div>
                        <div className="p-6 bg-gray-50 flex-1">
                            <ul className="space-y-4">
                                {['Up to 5 tools', 'Unlimited users', 'Basic stats', 'Normal visibility'].map((feature, i) => (
                                    <li key={i} className="flex items-center text-xs font-bold uppercase">
                                        <div className="w-2 h-2 bg-black mr-3"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Brutal Basic Tier */}
                    <motion.div
                        className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col relative z-20 transform lg:-translate-y-4"
                    >
                        <div className="p-6 border-b-4 border-black">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Syncopate' }}>02. BASIC</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">GETTING STARTED</p>
                            <div className="mt-6 mb-6 flex items-end">
                                <span className="text-5xl font-black tracking-tighter" style={{ fontFamily: 'Syncopate' }}>₹{isAnnual ? '490' : '49'}</span>
                                <span className="text-lg font-bold ml-2 mb-1">/{isAnnual ? 'YR' : 'MO'}</span>
                            </div>
                            <Link to="/register-org">
                                <button className="w-full py-3 border-2 border-black bg-blue-600 text-white font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Go Basic
                                </button>
                            </Link>
                        </div>
                        <div className="p-6 bg-blue-50 flex-1">
                            <ul className="space-y-4">
                                {['Up to 25 tools', 'Priority support', 'Basic analytics', 'Priority visibility'].map((feature, i) => (
                                    <li key={i} className="flex items-center text-xs font-bold uppercase">
                                        <div className="w-2 h-2 bg-blue-600 mr-3"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* Brutal Pro Tier (Inverted) */}
                    <motion.div
                        style={{ y: card2Y }}
                        className="border-4 border-black bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(255,0,0,1)] flex flex-col relative z-30 transform lg:-translate-y-8 sm:col-span-2 lg:col-span-1"
                    >
                        <div className="absolute top-0 right-0 bg-[#ff0000] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 border-l-4 border-b-4 border-black uppercase tracking-widest translate-x-1 sm:translate-x-1 -translate-y-1">
                            Recommended
                        </div>

                        <div className="p-6 border-b-4 border-white">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Syncopate' }}>03. PRO</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest line-clamp-1">EVERYTHING INCLUDED</p>
                            <div className="mt-6 mb-6 flex items-end">
                                <span className="text-5xl font-black tracking-tighter text-[#ff0000]" style={{ fontFamily: 'Syncopate' }}>₹{isAnnual ? '990' : '99'}</span>
                                <span className="text-lg font-bold ml-2 mb-1 text-gray-400">/{isAnnual ? 'YR' : 'MO'}</span>
                            </div>
                            <Link to="/register-org">
                                <button className="w-full py-3 bg-[#ff0000] text-white font-bold uppercase tracking-widest hover:bg-white hover:text-[#ff0000] transition-colors border-2 border-transparent hover:border-[#ff0000]">
                                    Go Pro Now
                                </button>
                            </Link>
                        </div>
                        <div className="p-6 bg-[#111] flex-1">
                            <ul className="space-y-4">
                                {['Unlimited tools', 'Full analytics & reports', 'Highlighted visibility', 'Dedicated support'].map((feature, i) => (
                                    <li key={i} className="flex items-center text-xs font-bold uppercase text-gray-300">
                                        <div className="w-2 h-2 bg-[#ff0000] mr-3"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Decorative background tape */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-black transform -rotate-1 translate-y-4 flex items-center overflow-hidden z-0">
                <div className="text-[#ff0000] font-mono-tech font-bold text-xs whitespace-nowrap tracking-[0.5em] opacity-80">
                    READY TO START // JOIN US NOW // READY TO START // JOIN US NOW // READY TO START // JOIN US NOW // READY TO START // JOIN US NOW // READY TO START // JOIN US NOW //
                </div>
            </div>
        </section>
    );
};

export default Pricing;
