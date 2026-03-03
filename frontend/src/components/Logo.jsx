import React from 'react';
import { FiTool } from 'react-icons/fi';

const Logo = ({ isSuperAdmin = false, className = '' }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                className={`flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all shadow-md
          ${isSuperAdmin
                        ? 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                    }
          w-10 h-10 sm:w-12 sm:h-12
        `}
            >
                <FiTool className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div className="flex flex-col justify-center overflow-hidden">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                    ToolRoom
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400 mt-0.5 whitespace-nowrap">
                    {isSuperAdmin ? 'Super Admin' : 'Management System'}
                </p>
            </div>
        </div>
    );
};

export default Logo;
