import React from 'react';
import { Bell, UserCircle, LogOut } from 'lucide-react';

// Ambil data user dari global object
const { currentUser } = window.umhData || { currentUser: { display_name: 'Guest' } };

const Header = ({ title }) => {
    return (
        <header className="bg-white shadow-sm fixed top-0 left-64 right-0 h-16 z-10"> {/* left-64 = lebar sidebar */}
            <div className="flex items-center justify-between h-full px-6">
                {/* Judul Halaman */}
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                
                {/* Ikon dan User Menu */}
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                        <Bell size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <UserCircle size={24} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{currentUser.display_name}</span>
                    </div>
                    {/* Link Logout WordPress */}
                    <a href="/wp-login.php?action=logout" className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100" title="Logout">
                        <LogOut size={20} />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;