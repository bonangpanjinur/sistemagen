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
  MegaphoneIcon,
  TruckIcon, 
  ClipboardDocumentCheckIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive 
      ? "flex items-center px-6 py-3 bg-blue-800 text-white border-r-4 border-blue-400 transition-colors duration-200"
      : "flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors duration-200";
  };

  // Fungsi untuk mematikan immersive mode (kembali ke WP biasa)
  const handleSwitchToWP = () => {
    document.body.classList.remove('immersive-mode');
  };

  return (
    <div className={`bg-blue-900 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} shadow-xl scrollbar-thin scrollbar-thumb-blue-700 flex flex-col`}>
      {/* Header Sidebar */}
      <div className="flex items-center justify-center h-16 bg-blue-950 shadow-md sticky top-0 z-10 flex-shrink-0">
        {isOpen ? (
            <h1 className="text-xl font-bold tracking-wider">JF BANTEN</h1>
        ) : (
            <span className="text-xl font-bold">JF</span>
        )}
      </div>

      {/* Menu Items - Urutan Sesuai Screenshot */}
      <nav className="mt-4 flex-grow pb-4">
        
        <NavLink to="/" className={getLinkClass('/')} title="Dashboard">
          <HomeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Dashboard</span>}
        </NavLink>

        <NavLink to="/packages" className={getLinkClass('/packages')} title="Paket">
          <CubeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Paket</span>}
        </NavLink>

        <NavLink to="/jamaah" className={getLinkClass('/jamaah')} title="Jamaah">
          <UserGroupIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Jamaah</span>}
        </NavLink>
        
        <NavLink to="/departures" className={getLinkClass('/departures')} title="Jadwal">
          <ClipboardDocumentListIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Jadwal</span>}
        </NavLink>

        <NavLink to="/finance" className={getLinkClass('/finance')} title="Keuangan">
          <CurrencyDollarIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Keuangan</span>}
        </NavLink>

        <NavLink to="/tasks" className={getLinkClass('/tasks')} title="Tugas">
          <ClipboardDocumentCheckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Tugas</span>}
        </NavLink>

        <NavLink to="/logistics" className={getLinkClass('/logistics')} title="Logistik">
          <TruckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Logistik</span>}
        </NavLink>

        <NavLink to="/hotels" className={getLinkClass('/hotels')} title="Hotel">
          <BuildingOfficeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Hotel</span>}
        </NavLink>

        <NavLink to="/flights" className={getLinkClass('/flights')} title="Flight">
          <TicketIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Flight</span>}
        </NavLink>

        <NavLink to="/marketing" className={getLinkClass('/marketing')} title="Marketing">
          <MegaphoneIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Marketing</span>}
        </NavLink>

        <NavLink to="/users" className={getLinkClass('/users')} title="Staff">
          <UsersIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Staff</span>}
        </NavLink>

      </nav>

      {/* Footer Sidebar: Tombol Kembali ke WP */}
      <div className="p-4 bg-blue-950 border-t border-blue-800 sticky bottom-0">
        <button 
            onClick={handleSwitchToWP}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-200 bg-blue-900 rounded hover:bg-blue-800 hover:text-white transition-colors"
            title="Kembali ke Tampilan WordPress Biasa"
        >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isOpen && <span className="ml-2">Mode WordPress</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;