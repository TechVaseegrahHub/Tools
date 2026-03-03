import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiActivity } from 'react-icons/fi';

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Intense Parallax parameters
    const textY = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const mockY = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const mockScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const dotOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <header ref={ref} className="relative overflow-hidden bg-white min-h-screen flex items-center border-b-[3px] border-black">
            {/* Raw Grid Background */}
            <motion.div
                style={{ opacity: dotOpacity }}
                className="absolute inset-0 bg-dot-black opacity-20 pointer-events-none mix-blend-multiply"
            ></motion.div>

            {/* Raw diagonal line */}
            <div className="absolute top-0 right-0 w-[2px] h-[150%] bg-black origin-top transform rotate-45 translate-x-[20vw] -translate-y-[20vh] opacity-10"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-20">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        style={{ y: textY }}
                        className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0 relative"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Brutal Badge */}
                        <div className="inline-flex items-center space-x-2 border-2 border-black px-4 py-1 font-mono-tech text-xs font-bold uppercase tracking-widest bg-[#ff0000] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-10">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span>OS V2.0 / SYSTEM ACTIVE</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-[0.9] mb-8 uppercase" style={{ fontFamily: 'Syncopate, sans-serif' }}>
                            ABSOLUTE<br />
                            <span className="text-transparent border-text" style={{ WebkitTextStroke: '2px black' }}>CONTROL.</span>
                        </h1>

                        <div className="pl-6 border-l-4 border-black mb-10">
                            <p className="text-xl font-mono-tech text-black font-medium leading-relaxed max-w-lg">
                                SYSTEMATIC TOOL INVENTORY MANAGEMENT.
                                TRACK CHECK-INS, CHECK-OUTS, AND WORKFLOWS WITH RAW PRECISION.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                            <Link to="/register-org" className="w-full sm:w-auto">
                                <button className="btn-primary w-full flex items-center justify-center text-sm md:text-base px-4 py-3">
                                    INITIATE_FREE <FiArrowRight className="ml-2" />
                                </button>
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto">
                                <button className="btn-secondary w-full text-sm md:text-base px-4 py-3">
                                    AUTH_LOGIN
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Brutalist Graphical Mockup */}
                    <motion.div
                        style={{ y: mockY, scale: mockScale }}
                        className="lg:col-span-6 relative z-0"
                        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
                        animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.85, 0, 0.15, 1] }} // Heavy easing
                    >
                        <div className="relative bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-none p-1">
                            {/* Fake App Browser Bar */}
                            <div className="flex items-center justify-between border-b-4 border-black pb-2 mb-4 px-2 pt-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiLz4KPC9zdmc+')]">
                                <div className="flex space-x-2">
                                    <div className="w-4 h-4 rounded-none border-2 border-black bg-white"></div>
                                    <div className="w-4 h-4 rounded-none border-2 border-black bg-white"></div>
                                </div>
                                <div className="font-mono-tech text-xs font-bold uppercase tracking-widest">/TOOLROOM/DASHBOARD</div>
                                <div className="w-4 h-4 bg-black"></div>
                            </div>

                            {/* Fake App Body */}
                            <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Stat Block 1 */}
                                    <div className="border-2 border-black p-3 sm:p-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-black group-hover:bg-[#ff0000] transition-colors origin-bottom-left rotate-45 translate-x-4 -translate-y-4"></div>
                                        <div className="font-mono-tech text-xs font-bold mb-1 sm:mb-2">/AVAILABLE</div>
                                        <div className="text-4xl sm:text-5xl font-black tracking-tighter" style={{ fontFamily: 'Syncopate' }}>124</div>
                                    </div>
                                    {/* Stat Block 2 */}
                                    <div className="border-2 border-black p-3 sm:p-4 bg-black text-white relative">
                                        <div className="font-mono-tech text-xs text-gray-400 font-bold mb-1 sm:mb-2">/IN_USE</div>
                                        <div className="text-4xl sm:text-5xl font-black tracking-tighter" style={{ fontFamily: 'Syncopate' }}>48</div>
                                        <div className="absolute bottom-4 right-4 text-[#ff0000] animate-pulse">
                                            <FiActivity size={24} />
                                        </div>
                                    </div>
                                </div>

                                {/* List Block */}
                                <div className="border-2 border-black p-4">
                                    <h3 className="font-mono-tech text-sm font-bold uppercase border-b-2 border-black pb-2 mb-4">Live.Feed</h3>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex justify-between items-end border-b border-dashed border-gray-300 pb-2">
                                                <div>
                                                    <div className="font-mono-tech text-xs text-gray-500 mb-1">ID: B-PWR-{i}0{i}</div>
                                                    <div className="font-bold uppercase tracking-tight text-sm">Bosch Power Drill</div>
                                                </div>
                                                <div className="font-mono-tech text-[10px] bg-black text-white px-2 py-1">CHECK_OUT</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements removed in favor of strict grid layout */}
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default Hero;
