import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, UserCheck, Package, Plane, 
    Building, Calendar, Briefcase, Megaphone, DollarSign, 
    Truck, Settings, List, FileText, CheckSquare 
} from 'lucide-react';

const Sidebar = ({ userCapabilities }) => {
    const location = useLocation();
    
    // Helper untuk mengecek active state (termasuk sub-menu)
    const isActive = (path) => location.pathname.startsWith(path);
    const linkClass = (path) => `flex items-center py-2.5 px-4 rounded transition duration-200 ${isActive(path) ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'}`;

    return (
        <div className="bg-blue-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out z-20 flex flex-col">
            <div className="flex items-center justify-center space-x-2 px-4">
                <span className="text-2xl font-extrabold text-white">Sistem Agen</span>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
                <Link to="/" className={linkClass('/')}>
                    <LayoutDashboard size={20} className="mr-3" /> Dashboard
                </Link>

                <div className="pt-4 pb-1 px-4 text-xs font-semibold text-blue-300 uppercase">Operasional</div>
                
                <Link to="/jamaah" className={linkClass('/jamaah')}>
                    <Users size={20} className="mr-3" /> Data Jamaah
                </Link>
                <Link to="/agents" className={linkClass('/agents')}>
                    <UserCheck size={20} className="mr-3" /> Agen / Cabang
                </Link>
                <Link to="/departures" className={linkClass('/departures')}>
                    <Calendar size={20} className="mr-3" /> Keberangkatan
                </Link>

                <div className="pt-4 pb-1 px-4 text-xs font-semibold text-blue-300 uppercase">Produk</div>
                
                <Link to="/packages" className={linkClass('/packages')}>
                    <Package size={20} className="mr-3" /> Paket Umrah
                </Link>
                <Link to="/flights" className={linkClass('/flights')}>
                    <Plane size={20} className="mr-3" /> Penerbangan
                </Link>
                <Link to="/hotels" className={linkClass('/hotels')}>
                    <Building size={20} className="mr-3" /> Hotel
                </Link>

                <div className="pt-4 pb-1 px-4 text-xs font-semibold text-blue-300 uppercase">Manajemen</div>

                <Link to="/hr" className={linkClass('/hr')}>
                    <Briefcase size={20} className="mr-3" /> HR & Staff
                </Link>
                <Link to="/marketing" className={linkClass('/marketing')}>
                    <Megaphone size={20} className="mr-3" /> Marketing & Leads
                </Link>
                <Link to="/finance" className={linkClass('/finance')}>
                    <DollarSign size={20} className="mr-3" /> Keuangan
                </Link>
                <Link to="/logistics" className={linkClass('/logistics')}>
                    <Truck size={20} className="mr-3" /> Logistik
                </Link>

                <div className="pt-4 pb-1 px-4 text-xs font-semibold text-blue-300 uppercase">Sistem</div>

                <Link to="/tasks" className={linkClass('/tasks')}>
                    <CheckSquare size={20} className="mr-3" /> Tasks
                </Link>
                <Link to="/users" className={linkClass('/users')}>
                    <Settings size={20} className="mr-3" /> Pengguna
                </Link>
                 <Link to="/roles" className={linkClass('/roles')}>
                    <FileText size={20} className="mr-3" /> Hak Akses
                </Link>
            </nav>
            
            <div className="px-4 py-2 text-xs text-blue-300 text-center">
                v1.0.0 Hybrid App
            </div>
        </div>
    );
};

export default Sidebar;