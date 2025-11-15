import React from 'react';
import { Bell, UserCircle, LogOut } from 'lucide-react';

// Ambil data user dari global object
const { currentUser } = window.umhData || { currentUser: { display_name: 'Guest' } };

const Header = ({ title }) => {
    return (
        <header className="bg-white shadow-md fixed top-0 left-64 right-0 h-16 z-10 border-b border-gray-200"> {/* left-64 = lebar sidebar, PERBAIKAN UI: shadow-md dan border-b */}
            <div className="flex items-center justify-between h-full px-8"> {/* PERBAIKAN UI: padding px-8 */}
                {/* Judul Halaman */}
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                
                {/* Ikon dan User Menu */}
                <div className="flex items-center space-x-5"> {/* PERBAIKAN UI: space-x-5 */}
                    <button className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-gray-100 transition-colors"> {/* PERBAIKAN UI: hover effect */}
                        <Bell size={22} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <UserCircle size={26} className="text-gray-600" /> {/* PERBAIKAN UI: Ukuran ikon */}
                        <span className="text-sm font-medium text-gray-700">{currentUser.display_name}</span>
                    </div>
                    {/* Link Logout WordPress */}
                    <a href="/wp-login.php?action=logout" className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Logout"> {/* PERBAIKAN UI: hover effect */}
                        <LogOut size={22} />
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;