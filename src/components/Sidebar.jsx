import React from 'react';
import { 
    Home, Users, Briefcase, Calendar, FileText, 
    Settings, DollarSign, Truck, BarChart2, 
    Clipboard, user, MapPin, Package, Grid, 
    UserCheck, Briefcase as Office, Plane,
    LogOut, Menu, X
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, userCapabilities = [] }) => {
    
    // Helper untuk cek akses (opsional, saat ini kita tampilkan semua dulu agar muncul)
    const hasAccess = (cap) => {
        return true; // Sementara di-bypass agar menu muncul semua untuk debugging
        // if (!userCapabilities.length) return true;
        // return userCapabilities.includes(cap) || userCapabilities.includes('manage_options');
    };

    const menuGroups = [
        {
            title: "Utama",
            items: [
                { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
                { id: 'tasks', label: 'Tugas & Approval', icon: <Clipboard size={20} /> },
            ]
        },
        {
            title: "Operasional",
            items: [
                { id: 'jamaah', label: 'Data Jamaah', icon: <Users size={20} /> },
                { id: 'departures', label: 'Keberangkatan', icon: <Calendar size={20} /> },
                { id: 'finance', label: 'Keuangan', icon: <DollarSign size={20} /> },
            ]
        },
        {
            title: "Produk & Layanan",
            items: [
                { id: 'packages', label: 'Paket Umroh', icon: <Briefcase size={20} /> },
                { id: 'package-categories', label: 'Kategori Paket', icon: <Grid size={20} /> },
                { id: 'hotel-bookings', label: 'Booking Hotel', icon: <MapPin size={20} /> }, // Opsional jika ada page ini
                { id: 'flight-bookings', label: 'Booking Pesawat', icon: <Plane size={20} /> }, // Opsional
            ]
        },
        {
            title: "Data Master",
            items: [
                { id: 'hotels', label: 'Hotel', icon: <MapPin size={20} /> },
                { id: 'flights', label: 'Penerbangan', icon: <Plane size={20} /> },
                { id: 'logistics', label: 'Logistik', icon: <Truck size={20} /> },
                { id: 'categories', label: 'Kategori Umum', icon: <Grid size={20} /> },
            ]
        },
        {
            title: "Mitra & SDM",
            items: [
                { id: 'agents', label: 'Agen', icon: <UserCheck size={20} /> },
                { id: 'hr', label: 'SDM / HR', icon: <Office size={20} /> },
                { id: 'marketing', label: 'Marketing', icon: <BarChart2 size={20} /> },
            ]
        },
        {
            title: "Pengaturan",
            items: [
                { id: 'users', label: 'Pengguna', icon: <Users size={20} /> },
                { id: 'roles', label: 'Peran & Akses', icon: <UserCheck size={20} /> },
                // { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
            ]
        }
    ];

    const handleNavClick = (pageId) => {
        setActivePage(pageId);
        if (window.innerWidth < 1024) {
            setIsMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-30
                w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                flex flex-col h-full
            `}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <span className="text-xl font-bold text-blue-600">UmrohManager</span>
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    {menuGroups.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={`
                                            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                            ${activePage === item.id 
                                                ? 'bg-blue-50 text-blue-700' 
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                                        `}
                                    >
                                        <span className={`mr-3 ${activePage === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / User Profile Summary */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                                A
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">Administrator</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;