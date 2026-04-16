import React from 'react';
import { FiTool } from 'react-icons/fi';

const Logo = ({ isSuperAdmin = false, className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`flex-shrink-0 flex items-center justify-center rounded-none border-2 border-black transition-all shadow-brutal
          ${isSuperAdmin
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }
          w-10 h-10 sm:w-12 sm:h-12
        `}
            >
                <FiTool className={`w-5 h-5 sm:w-6 sm:h-6 ${!isSuperAdmin ? 'text-accent' : 'text-white'}`} strokeWidth={4} />
            </div>

            <div className="flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter leading-none bg-black !text-white px-2 py-1 inline-block w-fit">
                    TOOLROOM
                </h1>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-accent mt-1 whitespace-nowrap italic">
                    {isSuperAdmin ? 'System Admin' : 'Inventory App'}
                </p>
            </div>
        </div>
    );
};

export default Logo;
