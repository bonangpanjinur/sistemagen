import React from 'react';
import { Bell, UserCircle, LogOut, Menu } from 'lucide-react';

// Ambil data user dari global object
const { currentUser } = window.umhData || { currentUser: { display_name: 'Guest' } };

const Header = ({ title, toggleSidebar }) => {
    return (
        // PERBAIKAN: Menggunakan 'sticky' top-0 agar menempel di atas container flex
        // Tidak menggunakan 'fixed left-64' agar responsif terhadap sidebar yang mengecil
        <header className="bg-white shadow-sm sticky top-0 z-20 h-16 border-b border-gray-200 w-full">
            <div className="flex items-center justify-between h-full px-6">
                
                <div className="flex items-center">
                    {/* Tombol Hamburger untuk Toggle Sidebar */}
                    <button 
                        onClick={toggleSidebar} 
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-md hover:bg-gray-100 mr-4 focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>
                    
                    {/* Judul Halaman (Opsional, bisa dinamis nanti) */}
                    <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
                        {title || "Sistem Manajemen Travel"}
                    </h2>
                </div>
                
                {/* Ikon dan User Menu */}
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                        <Bell size={20} />
                        {/* Contoh notifikasi dot */}
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>
                    
                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-700">{currentUser.display_name}</div>
                            <div className="text-xs text-gray-500 uppercase">{currentUser.role ? currentUser.role.replace('_', ' ') : 'Staff'}</div>
                        </div>
                        <UserCircle size={32} className="text-gray-400" />
                    </div>
                    
                    {/* Link Logout WordPress */}
                    <a 
                        href="/wp-login.php?action=logout" 
                        className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors ml-2" 
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