import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Plane, Hotel, 
    Briefcase, DollarSign, Settings, FileText, 
    LogOut, Database
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useData();

    // Menu Item Configuration
    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/jamaah', label: 'Data Jamaah', icon: <Users size={20} /> },
        { path: '/packages', label: 'Paket Umroh', icon: <Briefcase size={20} /> },
        { path: '/flights', label: 'Penerbangan', icon: <Plane size={20} /> },
        { path: '/hotels', label: 'Hotel', icon: <Hotel size={20} /> },
        { path: '/finance', label: 'Keuangan', icon: <DollarSign size={20} /> },
        { path: '/masters', label: 'Data Master', icon: <Database size={20} /> },
        { path: '/reports', label: 'Laporan', icon: <FileText size={20} /> },
        { path: '/settings', label: 'Pengaturan', icon: <Settings size={20} /> },
    ];

    // Filter menu berdasarkan role jika perlu
    // const filteredMenu = user?.role === 'agent' ? menuItems.filter(...) : menuItems;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Plane className="h-8 w-8" />
                            <span className="text-xl font-bold tracking-tight text-gray-900">UmrohMgr</span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive 
                                        ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer / User Info Mobile */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-4 mb-2">
                            <p className="text-xs text-gray-500 font-medium">Versi Aplikasi</p>
                            <p className="text-xs text-gray-400">v1.3.1 Hybrid</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;