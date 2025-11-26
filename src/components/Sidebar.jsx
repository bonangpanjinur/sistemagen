import React, { useState } from 'react';
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
  ArrowLeftOnRectangleIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TagIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  // State untuk dropdown menu
  const [expandedMenus, setExpandedMenus] = useState({
    master: false,
    settings: false
  });

  const toggleSubMenu = (menu) => {
    if (!isOpen) toggleSidebar(); // Buka sidebar jika sedang collapse saat klik dropdown
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Ambil role user untuk proteksi menu sederhana
  const currentUserRole = window.umhData?.currentUser?.role || 'subscriber';
  
  // Helper class
  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive 
      ? "flex items-center px-4 py-3 bg-blue-800 text-white border-r-4 border-blue-400 transition-colors duration-200"
      : "flex items-center px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors duration-200";
  };

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

      {/* Menu Items */}
      <nav className="mt-4 flex-grow pb-20">
        
        <NavLink to="/" className={getLinkClass('/')} title="Dashboard">
          <HomeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Dashboard</span>}
        </NavLink>

        {/* --- OPERASIONAL --- */}
        <div className={`px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider ${!isOpen && 'hidden'}`}>
            Operasional
        </div>

        <NavLink to="/packages" className={getLinkClass('/packages')} title="Paket">
          <CubeIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Paket Umroh/Haji</span>}
        </NavLink>

        <NavLink to="/jamaah" className={getLinkClass('/jamaah')} title="Jamaah">
          <UserGroupIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Data Jamaah</span>}
        </NavLink>
        
        <NavLink to="/departures" className={getLinkClass('/departures')} title="Jadwal Keberangkatan">
          <ClipboardDocumentListIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Jadwal</span>}
        </NavLink>

        <NavLink to="/logistics" className={getLinkClass('/logistics')} title="Logistik">
          <TruckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Logistik</span>}
        </NavLink>

        <NavLink to="/tasks" className={getLinkClass('/tasks')} title="Tugas">
          <ClipboardDocumentCheckIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Tugas Staff</span>}
        </NavLink>

        {/* --- KEUANGAN & MARKETING --- */}
        <div className={`px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mt-2 ${!isOpen && 'hidden'}`}>
            Bisnis
        </div>

        <NavLink to="/finance" className={getLinkClass('/finance')} title="Keuangan">
          <CurrencyDollarIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Keuangan</span>}
        </NavLink>

        <NavLink to="/marketing" className={getLinkClass('/marketing')} title="Marketing">
          <MegaphoneIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Marketing</span>}
        </NavLink>

        {/* --- DROPDOWN MASTER DATA (YANG HILANG SEBELUMNYA) --- */}
        <button 
            onClick={() => toggleSubMenu('master')}
            className={`w-full flex items-center justify-between px-4 py-3 text-blue-100 hover:bg-blue-800 hover:text-white transition-colors duration-200 ${!isOpen && 'justify-center'}`}
            title="Master Data"
        >
            <div className="flex items-center">
                <BriefcaseIcon className="w-6 h-6 min-w-[24px]" />
                {isOpen && <span className="ml-3 font-medium truncate">Master Data</span>}
            </div>
            {isOpen && (
                expandedMenus.master ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />
            )}
        </button>

        {/* Submenu Master Data */}
        {(expandedMenus.master || !isOpen) && (
            <div className={`${isOpen ? 'bg-blue-950' : 'hidden group-hover:block absolute left-20 bg-blue-900 w-48 shadow-xl'}`}>
                <NavLink to="/agents" className={`${getLinkClass('/agents')} ${isOpen ? 'pl-12' : ''}`} title="Data Agen">
                    {isOpen ? null : <IdentificationIcon className="w-5 h-5 mr-2" />}
                    <span className="font-medium truncate text-sm">Data Agen</span>
                </NavLink>
                <NavLink to="/hotels" className={`${getLinkClass('/hotels')} ${isOpen ? 'pl-12' : ''}`} title="Hotel">
                    {isOpen ? null : <BuildingOfficeIcon className="w-5 h-5 mr-2" />}
                    <span className="font-medium truncate text-sm">Hotel</span>
                </NavLink>
                <NavLink to="/flights" className={`${getLinkClass('/flights')} ${isOpen ? 'pl-12' : ''}`} title="Penerbangan">
                    {isOpen ? null : <TicketIcon className="w-5 h-5 mr-2" />}
                    <span className="font-medium truncate text-sm">Penerbangan</span>
                </NavLink>
                 <NavLink to="/package-categories" className={`${getLinkClass('/package-categories')} ${isOpen ? 'pl-12' : ''}`} title="Kategori Paket">
                    {isOpen ? null : <TagIcon className="w-5 h-5 mr-2" />}
                    <span className="font-medium truncate text-sm">Kategori Paket</span>
                </NavLink>
                <NavLink to="/categories" className={`${getLinkClass('/categories')} ${isOpen ? 'pl-12' : ''}`} title="Kategori Umum">
                    {isOpen ? null : <TagIcon className="w-5 h-5 mr-2" />}
                    <span className="font-medium truncate text-sm">Kategori Umum</span>
                </NavLink>
            </div>
        )}

        {/* --- ADMIN & HR --- */}
        <div className={`px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mt-2 ${!isOpen && 'hidden'}`}>
            Admin
        </div>

        <NavLink to="/users" className={getLinkClass('/users')} title="Staff / Users">
          <UsersIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">Data Staff</span>}
        </NavLink>
        
        <NavLink to="/hr" className={getLinkClass('/hr')} title="HR & Payroll">
          <UserGroupIcon className="w-6 h-6 min-w-[24px]" />
          {isOpen && <span className="ml-3 font-medium truncate">HR & Payroll</span>}
        </NavLink>

         {/* Hanya tampilkan Settings untuk Owner/Admin */}
         {['owner', 'administrator'].includes(currentUserRole) && (
            <NavLink to="/roles" className={getLinkClass('/roles')} title="Role & Izin">
                <Cog6ToothIcon className="w-6 h-6 min-w-[24px]" />
                {isOpen && <span className="ml-3 font-medium truncate">Role & Izin</span>}
            </NavLink>
        )}

      </nav>

      {/* Footer Sidebar: Tombol Kembali ke WP */}
      <div className="p-4 bg-blue-950 border-t border-blue-800 sticky bottom-0 z-20">
        <button 
            onClick={handleSwitchToWP}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-200 bg-blue-900 rounded hover:bg-blue-800 hover:text-white transition-colors"
            title="Kembali ke Tampilan WordPress Biasa"
        >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            {isOpen && <span className="ml-2">Mode WP</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;