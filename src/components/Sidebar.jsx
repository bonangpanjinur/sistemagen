import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext'; // Import DataContext
import { 
    LayoutDashboard, 
    Users, 
    Package, 
    Tags, 
    Plane, 
    Hotel, 
    Briefcase, 
    ClipboardList, 
    CalendarDays, 
    Wallet, 
    PieChart, 
    Megaphone, 
    Settings, 
    ShieldCheck,
    FileText,
    LogOut // Icon untuk tombol keluar
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useData(); // Ambil data user dari context
    const location = useLocation();
    const currentPath = location.pathname;

    // Fungsi helper untuk style menu aktif
    const getLinkClass = (path) => {
        const isActive = currentPath === path;
        return `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
            isActive 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`;
    };

    const iconSize = 20;

    // Cek Role Administrator
    const isSuperAdmin = user?.roles?.includes('administrator');
    // URL Admin WordPress (dari wp_localize_script di PHP)
    const wpAdminUrl = window.umhData?.admin_url || '/wp-admin';

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-100 w-64 shadow-xl border-r border-gray-800">
            {/* Logo Area */}
            <div className="flex items-center justify-center h-16 bg-gray-950 border-b border-gray-800 shadow-sm">
                <span className="text-xl font-bold tracking-wider">
                    <span className="text-blue-500">UMRAH</span>MANAGER
                </span>
            </div>

            {/* Scrollable Menu Area */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                
                {/* DASHBOARD */}
                <Link to="/" className={getLinkClass('/')}>
                    <LayoutDashboard size={iconSize} className="mr-3 flex-shrink-0" />
                    Dashboard
                </Link>

                {/* SECTION: MASTER DATA */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Master Data
                </div>
                <Link to="/agents" className={getLinkClass('/agents')}>
                    <Users size={iconSize} className="mr-3 flex-shrink-0" />
                    Agen & Mitra
                </Link>
                <Link to="/packages" className={getLinkClass('/packages')}>
                    <Package size={iconSize} className="mr-3 flex-shrink-0" />
                    Paket Umroh
                </Link>
                <Link to="/package-categories" className={getLinkClass('/package-categories')}>
                    <Tags size={iconSize} className="mr-3 flex-shrink-0" />
                    Kategori Paket
                </Link>
                <Link to="/flights" className={getLinkClass('/flights')}>
                    <Plane size={iconSize} className="mr-3 flex-shrink-0" />
                    Penerbangan
                </Link>
                <Link to="/hotels" className={getLinkClass('/hotels')}>
                    <Hotel size={iconSize} className="mr-3 flex-shrink-0" />
                    Hotel
                </Link>

                {/* SECTION: OPERASIONAL */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Operasional
                </div>
                <Link to="/jamaah" className={getLinkClass('/jamaah')}>
                    <Users size={iconSize} className="mr-3 flex-shrink-0" />
                    Data Jamaah
                </Link>
                <Link to="/logistics" className={getLinkClass('/logistics')}>
                    <Briefcase size={iconSize} className="mr-3 flex-shrink-0" />
                    Logistik
                </Link>
                <Link to="/departures" className={getLinkClass('/departures')}>
                    <CalendarDays size={iconSize} className="mr-3 flex-shrink-0" />
                    Jadwal Keberangkatan
                </Link>

                {/* SECTION: KEUANGAN */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keuangan
                </div>
                <Link to="/finance" className={getLinkClass('/finance')}>
                    <Wallet size={iconSize} className="mr-3 flex-shrink-0" />
                    Transaksi
                </Link>
                <Link to="/categories" className={getLinkClass('/categories')}>
                    <FileText size={iconSize} className="mr-3 flex-shrink-0" />
                    Kategori Keuangan
                </Link>

                {/* SECTION: KANTOR */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    HR & Kantor
                </div>
                <Link to="/hr" className={getLinkClass('/hr')}>
                    <Users size={iconSize} className="mr-3 flex-shrink-0" />
                    Karyawan (HR)
                </Link>
                <Link to="/tasks" className={getLinkClass('/tasks')}>
                    <ClipboardList size={iconSize} className="mr-3 flex-shrink-0" />
                    Tugas & To-Do
                </Link>

                {/* SECTION: MARKETING */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Marketing
                </div>
                <Link to="/marketing" className={getLinkClass('/marketing')}>
                    <Megaphone size={iconSize} className="mr-3 flex-shrink-0" />
                    Kampanye
                </Link>

                {/* SECTION: SISTEM */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pengaturan
                </div>
                <Link to="/users" className={getLinkClass('/users')}>
                    <Settings size={iconSize} className="mr-3 flex-shrink-0" />
                    Pengguna Sistem
                </Link>
                <Link to="/roles" className={getLinkClass('/roles')}>
                    <ShieldCheck size={iconSize} className="mr-3 flex-shrink-0" />
                    Hak Akses (Role)
                </Link>
                
                {/* MENU KHUSUS ADMIN: KEMBALI KE WP */}
                {isSuperAdmin && (
                    <>
                        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Akses Admin
                        </div>
                        <a 
                            href={wpAdminUrl} 
                            className="group flex items-center px-3 py-2.5 text-sm font-medium text-red-400 rounded-md transition-colors duration-200 hover:bg-gray-800 hover:text-red-300"
                        >
                            <LogOut size={iconSize} className="mr-3 flex-shrink-0" />
                            Kembali ke WordPress
                        </a>
                    </>
                )}

                {/* Spacer bottom */}
                <div className="pb-10"></div>
            </div>

            {/* User Profile Area (Footer) */}
            <div className="border-t border-gray-800 p-4 bg-gray-950">
                <div className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.display_name || 'Pengguna'}
                        </p>
                        <p className="text-xs font-medium text-gray-400 truncate">
                            {user?.roles ? user.roles[0] : 'Staff'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;