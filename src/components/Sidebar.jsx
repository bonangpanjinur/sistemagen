import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { menuItems } from '../utils/menuConfig';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();

    return (
        <>
            {/* Mobile Overlay - Klik di luar untuk menutup sidebar */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <div 
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                // Tambahkan style khusus untuk memastikan dia di atas elemen WP Admin jika perlu
                style={{ paddingTop: '0px' }} 
            >
                {/* Logo / Header Sidebar */}
                <div className="flex items-center justify-between h-16 px-6 bg-gray-800 border-b border-gray-700">
                    <span className="text-xl font-bold tracking-wider uppercase">Sistem Agen</span>
                    {/* Tombol Close untuk Mobile */}
                    <button 
                        onClick={toggleSidebar} 
                        className="p-1 rounded-md lg:hidden hover:bg-gray-700 focus:outline-none"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="px-4 py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
                    {menuItems && menuItems.length > 0 ? (
                        menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                            const Icon = item.icon;
                            
                            return (
                                <NavLink
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-lg group ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                    onClick={() => {
                                        // Tutup sidebar otomatis di mobile saat menu diklik
                                        if (window.innerWidth < 1024) toggleSidebar();
                                    }}
                                >
                                    {Icon && <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />}
                                    <span>{item.title}</span>
                                </NavLink>
                            );
                        })
                    ) : (
                        <div className="px-4 text-sm text-gray-500">Menu tidak tersedia</div>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;