import React from 'react';
import { Bell, UserCircle, LogOut, Menu, Layout } from 'lucide-react'; // Tambah Icon Layout

// Ambil data user dari global object
const { currentUser } = window.umhData || { currentUser: { display_name: 'Guest' } };

const Header = ({ title, toggleSidebar }) => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-20 h-16 border-b border-gray-200 w-full">
            <div className="flex items-center justify-between h-full px-6">
                
                <div className="flex items-center">
                    {/* Tombol Hamburger */}
                    <button 
                        onClick={toggleSidebar} 
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100 mr-4 focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>
                    
                    <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                        {title || "Sistem Manajemen Travel"}
                    </h2>
                </div>
                
                {/* Bagian Kanan Header */}
                <div className="flex items-center space-x-3 md:space-x-4">
                    {/* TOMBOL BARU: Switch to WordPress */}
                    <a 
                        href="/wp-admin/" 
                        className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"
                        title="Kembali ke Tampilan WordPress Biasa"
                    >
                        <Layout size={16} className="mr-2" />
                        Ke WP Admin
                    </a>

                    <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                    <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>
                    
                    <div className="flex items-center space-x-3 pl-2">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-700">{currentUser.display_name}</div>
                            <div className="text-xs text-gray-500 uppercase">{currentUser.role ? currentUser.role.replace('_', ' ') : 'Staff'}</div>
                        </div>
                        
                        {currentUser.avatar ? (
                            <img 
                                src={currentUser.avatar} 
                                alt="Profile" 
                                className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                            />
                        ) : (
                            <UserCircle size={32} className="text-gray-400" />
                        )}
                    </div>
                    
                    {/* Link Logout */}
                    <a 
                        href="/wp-login.php?action=logout" 
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors ml-1" 
                        title="Keluar Aplikasi"
                    >
                        <LogOut size={20} />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;