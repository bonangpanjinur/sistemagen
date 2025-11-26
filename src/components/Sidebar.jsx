import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UsersIcon, 
  CubeIcon, 
  RectangleStackIcon,
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  TicketIcon,
  MegaphoneIcon,
  TruckIcon, 
  IdentificationIcon,
  ClipboardDocumentCheckIcon,
  ArrowLeftOnRectangleIcon // Icon untuk back to WP
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive 
      ? "flex items-center px-6 py-3 bg-blue-800 text-white border-r-4 border-blue-400 transition-colors duration-200"
      : "flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors duration-200";
  };

  // [PERBAIKAN 3] Fungsi untuk beralih tampilan
  const handleSwitchToWP = () => {
    // Hapus class immersive-mode dari body
    document.body.classList.remove('immersive-mode');
    // Opsional: Anda bisa me-redirect ke dashboard utama WP atau hanya memunculkan menu
    // window.location.href = window.umhData.adminUrl; 
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

      {/* Menu Items - Flex Grow agar footer terdorong ke bawah */}
      <nav className="mt-4 flex-grow pb-4">
        <NavLink to="/" className={getLinkClass('/')}>
          <HomeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Dashboard</span>}
        </NavLink>

        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Master Data" : "Data"}
        </div>

        <NavLink to="/package-categories" className={getLinkClass('/package-categories')}>
          <RectangleStackIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Kategori Paket</span>}
        </NavLink>

        <NavLink to="/packages" className={getLinkClass('/packages')}>
          <CubeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Paket Umroh</span>}
        </NavLink>

        <NavLink to="/jamaah" className={getLinkClass('/jamaah')}>
          <UserGroupIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Data Jamaah</span>}
        </NavLink>
        
        <NavLink to="/agents" className={getLinkClass('/agents')}>
          <IdentificationIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Data Sub Agen</span>}
        </NavLink>

        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Operasional" : "Ops"}
        </div>

        <NavLink to="/logistics" className={getLinkClass('/logistics')}>
          <TruckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Logistik & Dokumen</span>}
        </NavLink>
        
        <NavLink to="/departures" className={getLinkClass('/departures')}>
          <ClipboardDocumentListIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Keberangkatan</span>}
        </NavLink>

        <NavLink to="/tasks" className={getLinkClass('/tasks')}>
          <ClipboardDocumentCheckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Tugas & To-Do</span>}
        </NavLink>

        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Keuangan" : "Fin"}
        </div>
        
        <NavLink to="/finance" className={getLinkClass('/finance')}>
          <CurrencyDollarIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Keuangan</span>}
        </NavLink>

        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Inventory" : "Inv"}
        </div>

        <NavLink to="/hotels" className={getLinkClass('/hotels')}>
          <BuildingOfficeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Hotel</span>}
        </NavLink>

        <NavLink to="/flights" className={getLinkClass('/flights')}>
          <TicketIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Penerbangan</span>}
        </NavLink>

        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Manajemen" : "Mgt"}
        </div>

        <NavLink to="/users" className={getLinkClass('/users')}>
          <UsersIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Users & Staff</span>}
        </NavLink>

        <NavLink to="/hr" className={getLinkClass('/hr')}>
          <BriefcaseIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">HR & Payroll</span>}
        </NavLink>

        <NavLink to="/marketing" className={getLinkClass('/marketing')}>
          <MegaphoneIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Marketing</span>}
        </NavLink>
      </nav>

      {/* [PERBAIKAN 3] Footer Sidebar: Tombol Kembali ke WP */}
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