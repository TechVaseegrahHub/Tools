import React from 'react';

const Logo = ({ isSuperAdmin = false, className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden transition-all shadow-lg
          ${isSuperAdmin
                        ? 'bg-black'
                        : 'bg-black'
                    }
          w-10 h-10 sm:w-12 sm:h-12
        `}
            >
                <img 
                    src="/icons/icon-192.png" 
                    alt="Tools App Logo" 
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter leading-none text-white px-2 py-1 inline-block w-fit bg-gradient-to-r from-red-600 to-red-500 rounded">
                    TOOLS APP
                </h1>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mt-1 whitespace-nowrap italic">
                    {isSuperAdmin ? 'System Admin' : 'Professional Inventory'}
                </p>
            </div>
        </div>
    );
};

export default Logo;
