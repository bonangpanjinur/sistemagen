import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UsersIcon, 
  CubeIcon, 
  RectangleStackIcon, // Icon untuk Kategori
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  TicketIcon,
  MegaphoneIcon,
  TruckIcon, 
  IdentificationIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  // Helper untuk styling link aktif vs non-aktif
  const getLinkClass = (path) => {
    // Cek jika path saat ini diawali dengan path link (untuk handle sub-menu seperti /hr/*)
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    
    return isActive 
      ? "flex items-center px-6 py-3 bg-blue-800 text-white border-r-4 border-blue-400 transition-colors duration-200"
      : "flex items-center px-6 py-3 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors duration-200";
  };

  return (
    <div className={`bg-blue-900 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'} shadow-xl scrollbar-thin scrollbar-thumb-blue-700`}>
      {/* Header Sidebar */}
      <div className="flex items-center justify-center h-16 bg-blue-950 shadow-md sticky top-0 z-10">
        {isOpen ? (
            <h1 className="text-xl font-bold tracking-wider">JF BANTEN</h1>
        ) : (
            <span className="text-xl font-bold">JF</span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="mt-4 pb-20">
        <NavLink to="/" className={getLinkClass('/')}>
          <HomeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Dashboard</span>}
        </NavLink>

        {/* SECTION: MASTER DATA */}
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

        {/* SECTION: OPERASIONAL */}
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

        {/* SECTION: KEUANGAN */}
        <div className="px-6 pt-6 pb-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            {isOpen ? "Keuangan" : "Fin"}
        </div>
        
        <NavLink to="/finance" className={getLinkClass('/finance')}>
          <CurrencyDollarIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Keuangan</span>}
        </NavLink>

        {/* SECTION: INVENTORY */}
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

        {/* SECTION: MANAJEMEN */}
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
    </div>
  );
};

export default Sidebar;