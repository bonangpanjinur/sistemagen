import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UsersIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  TicketIcon,
  TruckIcon, 
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { UserCircle } from 'lucide-react';

const TopNavigation = () => {
  const location = useLocation();

  // Ambil data user secara aman
  const umhData = window.umhData || {};
  const currentUser = umhData.currentUser || { display_name: 'User', role: 'guest' };

  // Helper untuk styling link
  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive 
      ? "flex items-center px-3 py-2 bg-blue-800 text-white rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap shadow-sm"
      : "flex items-center px-3 py-2 text-blue-100 hover:bg-blue-700 hover:text-white rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap";
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center pr-4 border-r border-blue-800">
             <span className="text-xl font-bold tracking-wider text-white">JF BANTEN</span>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex items-center overflow-x-auto px-4 space-x-2 scrollbar-hide h-full">
            <NavLink to="/" className={getLinkClass('/')} title="Dashboard">
              <HomeIcon className="w-5 h-5 mr-1.5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/packages" className={getLinkClass('/packages')} title="Paket">
              <CubeIcon className="w-5 h-5 mr-1.5" />
              <span>Paket</span>
            </NavLink>

            <NavLink to="/jamaah" className={getLinkClass('/jamaah')} title="Jamaah">
              <UserGroupIcon className="w-5 h-5 mr-1.5" />
              <span>Jamaah</span>
            </NavLink>

            <NavLink to="/departures" className={getLinkClass('/departures')} title="Jadwal">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-1.5" />
              <span>Jadwal</span>
            </NavLink>

            <NavLink to="/finance" className={getLinkClass('/finance')} title="Keuangan">
              <CurrencyDollarIcon className="w-5 h-5 mr-1.5" />
              <span>Keuangan</span>
            </NavLink>
            
            <div className="h-8 w-px bg-blue-800 mx-2 hidden md:block"></div>

            <NavLink to="/tasks" className={getLinkClass('/tasks')} title="Tugas">
               <ClipboardDocumentCheckIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Tugas</span>
            </NavLink>
            
            <NavLink to="/logistics" className={getLinkClass('/logistics')} title="Logistik">
               <TruckIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Logistik</span>
            </NavLink>
            
            <NavLink to="/hotels" className={getLinkClass('/hotels')} title="Hotel">
               <BuildingOfficeIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Hotel</span>
            </NavLink>
            
             <NavLink to="/flights" className={getLinkClass('/flights')} title="Flight">
               <TicketIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Flight</span>
            </NavLink>

            <div className="h-8 w-px bg-blue-800 mx-2 hidden md:block"></div>

            <NavLink to="/marketing" className={getLinkClass('/marketing')} title="Marketing">
               <ChartBarIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Marketing</span>
            </NavLink>

             <NavLink to="/users" className={getLinkClass('/users')} title="Staff">
               <UsersIcon className="w-5 h-5 mr-1.5" />
               <span className="hidden lg:inline">Staff</span>
            </NavLink>
          </div>

          {/* Profil & Logout */}
          <div className="flex items-center ml-2 pl-4 border-l border-blue-800 space-x-3 bg-blue-900 z-10">
             <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block min-w-[80px]">
                    <div className="text-sm font-bold text-white truncate max-w-[150px]">{currentUser.display_name}</div>
                    <div className="text-xs text-blue-300 uppercase tracking-wide font-semibold">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <div className="bg-blue-800 p-1 rounded-full">
                    <UserCircle size={28} className="text-blue-200" />
                </div>
             </div>
             
             <a 
                href="/wp-login.php?action=logout" 
                className="group flex items-center justify-center p-2 text-red-200 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200" 
                title="Keluar"
             >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
             </a>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;