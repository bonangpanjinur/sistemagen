import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { 
    LayoutDashboard, Users, Package, Database, Plane, Hotel, 
    Briefcase, ClipboardList, Wallet, Settings, ShieldCheck, LogOut 
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useData();
    const location = useLocation();
    const getLinkClass = (path) => `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${location.pathname === path ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`;

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-100 w-64 shadow-xl border-r border-gray-800">
            <div className="flex items-center justify-center h-16 bg-gray-950 border-b border-gray-800">
                <span className="text-xl font-bold tracking-wider"><span className="text-blue-500">UMRAH</span>MANAGER</span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                <Link to="/" className={getLinkClass('/')}><LayoutDashboard size={20} className="mr-3" /> Dashboard</Link>
                
                {/* AREA DATA MASTER */}
                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Master</div>
                <Link to="/masters" className={getLinkClass('/masters')}><Database size={20} className="mr-3" /> Hotel & Referensi</Link>
                <Link to="/packages" className={getLinkClass('/packages')}><Package size={20} className="mr-3" /> Paket Umroh</Link>
                <Link to="/agents" className={getLinkClass('/agents')}><Users size={20} className="mr-3" /> Agen & Mitra</Link>

                {/* AREA OPERASIONAL */}
                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operasional</div>
                <Link to="/jamaah" className={getLinkClass('/jamaah')}><Users size={20} className="mr-3" /> Data Jemaah</Link>
                <Link to="/logistics" className={getLinkClass('/logistics')}><Briefcase size={20} className="mr-3" /> Logistik</Link>
                <Link to="/finance" className={getLinkClass('/finance')}><Wallet size={20} className="mr-3" /> Keuangan</Link>
                <Link to="/hr" className={getLinkClass('/hr')}><ClipboardList size={20} className="mr-3" /> HR & Payroll</Link>

                {/* AREA SISTEM */}
                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sistem</div>
                <Link to="/users" className={getLinkClass('/users')}><Settings size={20} className="mr-3" /> Pengguna</Link>
                <Link to="/roles" className={getLinkClass('/roles')}><ShieldCheck size={20} className="mr-3" /> Hak Akses</Link>
                
                {user?.roles?.includes('administrator') && (
                    <a href={window.umhData?.admin_url || '/wp-admin'} className="group flex items-center px-3 py-2.5 text-sm font-medium text-red-400 mt-6 hover:bg-gray-800 hover:text-red-300">
                        <LogOut size={20} className="mr-3" /> Kembali ke WP
                    </a>
                )}
            </div>
        </div>
    );
};
export default Sidebar;