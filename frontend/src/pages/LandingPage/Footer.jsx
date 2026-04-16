import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-b-[16px] border-black pt-20 pb-10 font-mono-tech relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 border-b-4 border-black pb-16">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Syncopate' }}>
                            TOOLROOM_
                        </h2>
                        <p className="text-sm font-bold max-w-sm mb-8 leading-relaxed">
                            Manage your tools easily.
                            Built to help you work faster and stay in control.
                        </p>
                        <div className="w-16 h-4 bg-black"></div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h3 className="text-sm font-black uppercase text-gray-500 mb-6 tracking-widest border-b-2 border-gray-200 pb-2 inline-block">LINKS</h3>
                        <ul className="space-y-4 font-bold text-sm">
                            <li><a href="#" className="hover:bg-black hover:text-white px-1 transition-colors uppercase">FEATURES</a></li>
                            <li><a href="#" className="hover:bg-black hover:text-white px-1 transition-colors uppercase">PRICING</a></li>
                            <li><Link to="/register-org" className="text-[#ff0000] hover:bg-[#ff0000] hover:text-white px-1 transition-colors uppercase">GET STARTED</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h3 className="text-sm font-black uppercase text-gray-500 mb-6 tracking-widest border-b-2 border-gray-200 pb-2 inline-block">LEGAL</h3>
                        <ul className="space-y-4 font-bold text-sm">
                            <li><a href="#" className="hover:bg-black hover:text-white px-1 transition-colors uppercase">Privacy Policy</a></li>
                            <li><a href="#" className="hover:bg-black hover:text-white px-1 transition-colors uppercase">User Agreement</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 flex justify-center md:justify-start">
                        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            &copy; 2026 TOOLROOM_SYS. ALL RIGHTS RESERVED.
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Powered By</span>
                        <div className="flex items-center gap-2">
                            <img 
                                src="/tech-vaseegrah-logo.png" 
                                alt="Tech Vaseegrah Logo" 
                                className="h-6 w-auto object-contain"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <span className="text-sm font-black uppercase tracking-widest text-black">
                                Tech Vaseegrah
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center md:justify-end space-x-4">
                        <div className="flex items-center space-x-2 border-2 border-black px-2 py-1">
                            <span className="w-2 h-2 bg-black animate-ping"></span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">STATUS: LIVE</span>
                        </div>
                        <div className="flex items-center space-x-2 border-2 border-black px-2 py-1 bg-black text-white">
                            <span className="text-[10px] font-bold uppercase tracking-widest">V2.0.4</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Huge background text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.03] pointer-events-none text-[20vw] font-black tracking-tighter whitespace-nowrap z-0" style={{ fontFamily: 'Syncopate' }}>
                TOOLROOM
            </div>
        </footer>
    );
};

export default Footer;
