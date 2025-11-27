import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Package, 
    FileText, 
    Settings, 
    LogOut,
    Truck,
    DollarSign,
    UserCheck,
    MapPin, 
    Plane,
    Database
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

const Sidebar = () => {
    const { user } = useData();

    const handleLogout = () => {
        localStorage.removeItem('umh_auth_token');
        window.location.reload();
    };

    const menuItems = [
        { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/jamaah', icon: <Users size={20} />, label: 'Data Jamaah' },
        { path: '/packages', icon: <Package size={20} />, label: 'Paket Umroh & Haji' },
        { path: '/logistics', icon: <Truck size={20} />, label: 'Logistik' },
        { path: '/finance', icon: <DollarSign size={20} />, label: 'Keuangan' },
        { path: '/agents', icon: <UserCheck size={20} />, label: 'Kemitraan Agen' },
        { path: '/hr', icon: <Briefcase size={20} />, label: 'HR & Karyawan' },
    ];

    // Menu Master Data (Terpisah)
    const masterDataItems = [
        { path: '/hotels', icon: <MapPin size={20} />, label: 'Master Hotel' },
        { path: '/flights', icon: <Plane size={20} />, label: 'Master Maskapai' },
        { path: '/categories', icon: <Database size={20} />, label: 'Kategori Paket' },
    ];

    const adminItems = [
        { path: '/users', icon: <Users size={20} />, label: 'Manajemen User' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Pengaturan' },
    ];

    const renderMenu = (items) => (
        <ul className="space-y-1 mb-6">
            {items.map((item) => (
                <li key={item.path}>
                    <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 overflow-y-auto z-10">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Package className="text-blue-600" fill="currentColor" size={28} />
                    UMH Admin
                </h1>
                <p className="text-xs text-gray-500 mt-1">Umroh Manager Hybrid</p>
            </div>

            <nav className="flex-1 p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">Menu Utama</div>
                {renderMenu(menuItems)}

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Master Data</div>
                {renderMenu(masterDataItems)}

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4 mt-6">Administrator</div>
                {renderMenu(adminItems)}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Keluar</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;