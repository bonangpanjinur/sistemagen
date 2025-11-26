import React from 'react';

const Header = ({ title, toggleSidebar }) => {
    return (
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow-md border-b border-gray-200">
            <div className="flex items-center">
                {/* Mobile Menu Button */}
                <button 
                    onClick={toggleSidebar} 
                    className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h2>
            </div>
            
            <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right hidden sm:block">
                    <span className="text-sm font-semibold text-gray-700">Administrator</span>
                    <span className="text-xs text-gray-500">Super Admin</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden border-2 border-white shadow-sm">
                    {/* Placeholder Avatar */}
                    <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;