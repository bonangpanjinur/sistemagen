import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Calendar, 
    Wallet, 
    Megaphone, 
    ClipboardList, 
    UserCog, 
    Package, 
    Settings, 
    Database, 
    LogOut,
    Box
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useData();

    // Fungsi helper untuk mengecek menu aktif
    const isActive = (path) => location.pathname === path ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white';

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/jamaah', label: 'Data Jemaah', icon: <Users size={20} /> },
        { path: '/packages', label: 'Paket Umrah/Haji', icon: <Briefcase size={20} /> },
        { path: '/departures', label: 'Jadwal Keberangkatan', icon: <Calendar size={20} /> },
        { path: '/finance', label: 'Keuangan & Kasir', icon: <Wallet size={20} /> },
        { path: '/marketing', label: 'Marketing & Leads', icon: <Megaphone size={20} /> },
        { path: '/tasks', label: 'Tugas Tim', icon: <ClipboardList size={20} /> },
        { path: '/hr', label: 'HR & Karyawan', icon: <UserCog size={20} /> },
        { path: '/logistics', label: 'Logistik & Perlengkapan', icon: <Box size={20} /> },
    ];

    const masterItems = [
        { path: '/hotels', label: 'Hotel' },
        { path: '/flights', label: 'Maskapai' },
        { path: '/agents', label: 'Agen & Mitra' },
        { path: '/users', label: 'Pengguna Sistem' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300">
            {/* LOGO AREA */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800 font-bold text-xl tracking-wider">
                <span className="text-blue-500 mr-1">UMH</span> SYSTEM
            </div>

            {/* USER PROFILE MINI */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                    <p className="text-sm font-medium truncate w-32">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role || 'Super Admin'}</p>
                </div>
            </div>

            {/* MENU SCROLL AREA */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-2 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
                        >
                            {item.icon}
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}

                    {/* SEPARATOR MASTER DATA */}
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Master Data
                        </p>
                    </div>

                    {/* SUB-MENU MASTER */}
                    <div className="space-y-1">
                        {masterItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg ml-2 transition-colors text-sm ${isActive(item.path)}`}
                            >
                                <Database size={16} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>

            {/* FOOTER SETTINGS */}
            <div className="p-4 border-t border-gray-800">
                <NavLink
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')}`}
                >
                    <Settings size={20} />
                    <span className="font-medium text-sm">Pengaturan</span>
                </NavLink>
                <div className="mt-2 text-center text-xs text-gray-600">
                    &copy; 2024 Umroh Manager Hybrid
                </div>
            </div>
        </div>
    );
};

export default Sidebar;