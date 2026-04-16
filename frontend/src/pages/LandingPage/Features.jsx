import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FiActivity, FiUsers } from 'react-icons/fi';

const usageData = [
    { name: 'Mon', checkouts: 40, checkins: 24 },
    { name: 'Tue', checkouts: 30, checkins: 13 },
    { name: 'Wed', checkouts: 20, checkins: 58 },
    { name: 'Thu', checkouts: 27, checkins: 39 },
    { name: 'Fri', checkouts: 18, checkins: 48 },
    { name: 'Sat', checkouts: 23, checkins: 38 },
    { name: 'Sun', checkouts: 34, checkins: 43 },
];

const statusData = [
    { name: 'READY', value: 65, color: '#000000' },
    { name: 'TAKEN', value: 25, color: '#e5e5e5' },
    { name: 'FIXING', value: 10, color: '#ff0000' }
];

const BrutalistTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-mono-tech text-xs font-bold uppercase mb-1">{`Day: ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} className="font-mono-tech text-xs" style={{ color: entry.color }}>
                        {`${entry.name}: ${entry.value}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Features = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Intense brutal parallax
    const graphY1 = useTransform(scrollYProgress, [0, 1], [300, -300]);
    const graphY2 = useTransform(scrollYProgress, [0, 1], [-200, 200]);

    return (
        <section ref={ref} className="py-24 bg-white relative overflow-hidden border-b-4 border-black">
            {/* Raw Grid Background */}
            <div className="absolute inset-0 bg-dot-black opacity-10 pointer-events-none mix-blend-multiply"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">

                {/* Brutal Header */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end md:justify-between border-b-4 border-black pb-8">
                    <div>
                        <div className="inline-block bg-black text-white font-mono-tech text-xs px-2 py-1 mb-4">What we do</div>
                        <h2 className="text-3xl sm:text-4xl md:text-6xl uppercase tracking-tighter break-words" style={{ fontFamily: 'Syncopate' }}>
                            HOW IT<br />WORKS
                        </h2>
                    </div>
                    <p className="mt-6 md:mt-0 max-w-sm font-mono-tech text-sm leading-relaxed text-black font-semibold">
                        Forget about messy spreadsheets. Track your tools and see everything clearly in one place.
                    </p>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start mb-32 relative">

                    {/* Sticky Feature Text container */}
                    <div className="lg:sticky lg:top-32 mb-16 lg:mb-0 space-y-8">
                        <div className="w-16 h-16 border-4 border-black flex items-center justify-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <FiActivity size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ fontFamily: 'Syncopate' }}>LIVE<br />UPDATES</h3>
                        <p className="font-mono-tech text-lg leading-relaxed border-l-4 border-black pl-4">
                            See where your tools are right now. Know what's being used and what's ready to go.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['SEE TOOLS IN & OUT', 'SMART NOTICES', 'SAVE DATA TO FILE'].map((text, i) => (
                                <li key={i} className="flex items-center font-mono-tech text-sm font-bold bg-gray-100 p-3 border border-black">
                                    <div className="w-2 h-2 bg-[#ff0000] mr-4"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Brutalist Graphical Analytics Component with Parallax */}
                    <motion.div
                        style={{ y: graphY1 }}
                        className="bg-white p-1 sm:p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] z-10 relative mt-8 lg:mt-0 max-w-[calc(100vw-2rem)]"
                    >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6 p-2 sm:p-4 border-b-2 border-black bg-gray-50">
                            <h4 className="font-mono-tech font-bold uppercase tracking-widest">WEEKLY REPORT</h4>
                            <select className="bg-transparent border-2 border-black font-mono-tech text-xs p-1 outline-none uppercase font-bold cursor-pointer hover:bg-black hover:text-white transition-colors">
                                <option>Past week</option>
                                <option>Past month</option>
                            </select>
                        </div>
                        <div className="h-72 w-full pr-4 pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={true} stroke="#e5e5e5" />
                                    <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fill: '#000', fontSize: 10, fontFamily: 'Space Mono', fontWeight: 'bold' }} />
                                    <YAxis axisLine={{ stroke: '#000', strokeWidth: 2 }} tickLine={{ stroke: '#000', strokeWidth: 2 }} tick={{ fill: '#000', fontSize: 10, fontFamily: 'Space Mono', fontWeight: 'bold' }} />
                                    <Tooltip content={<BrutalistTooltip />} />
                                    {/* Clean, high contrast lines instead of messy patterns */}
                                    <Area type="monotone" dataKey="checkouts" name="TAKEN" stroke="#000" strokeWidth={4} fill="#000" fillOpacity={0.1} animationDuration={1000} />
                                    <Area type="monotone" dataKey="checkins" name="RETURNED" stroke="#ff0000" strokeWidth={3} fill="#ff0000" fillOpacity={0.1} animationDuration={1200} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start relative pb-20">

                    {/* Brutalist Graphical Donut Component */}
                    <motion.div
                        style={{ y: graphY2 }}
                        className="order-2 lg:order-1 bg-white p-1 sm:p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center relative z-20 mt-8 lg:mt-0 max-w-[calc(100vw-2rem)]"
                    >
                        <div className="w-full border-b-2 border-black p-2 sm:p-4 bg-gray-50 flex justify-between">
                            <span className="font-mono-tech font-bold uppercase text-xs">TOOL STATUS</span>
                            <span className="w-3 h-3 bg-[#ff0000] animate-pulse"></span>
                        </div>
                        <div className="w-full h-48 sm:h-64 flex justify-center items-center py-4 sm:py-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2} // Sharp separated slices
                                        dataKey="value"
                                        stroke="#000"
                                        strokeWidth={2}
                                        animationBegin={200}
                                        animationDuration={1000}
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<BrutalistTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="w-full p-4 border-t-2 border-black grid grid-cols-1 space-y-2">
                            {statusData.map((stat, i) => (
                                <div key={i} className="flex justify-between items-center bg-white p-2 border border-black font-mono-tech text-xs font-bold transition-all hover:bg-black hover:text-white">
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 mr-3 border border-black" style={{ backgroundColor: stat.color }}></div>
                                        <span>{stat.name}</span>
                                    </div>
                                    <span className="text-base">{stat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Feature Text */}
                    <div className="order-1 lg:order-2 lg:sticky lg:top-32 mb-16 lg:mb-0 space-y-8">
                        <div className="w-16 h-16 border-4 border-black flex items-center justify-center bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,0,0,1)]">
                            <FiUsers size={32} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase" style={{ fontFamily: 'Syncopate' }}>TEAM<br />LEVELS</h3>
                        <p className="font-mono-tech text-lg leading-relaxed border-l-4 border-black pl-4">
                            Organize your team easily. Give different people different jobs like Boss, Manager, or Worker.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {['SAFE LOGIN', 'CLEAR VIEWS', 'HISTORY LOGS', 'ALLOW ACCESS'].map((text, i) => (
                                <div key={i} className="font-mono-tech text-xs font-bold border-2 border-black p-3 text-center hover:bg-[#ff0000] hover:text-white transition-colors cursor-crosshair">
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Features;
