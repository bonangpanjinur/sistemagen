import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GlobalErrorAlert from './components/GlobalErrorAlert';

// Pages
import Dashboard from './pages/Dashboard';
import PackageCategories from './pages/PackageCategories';
import Packages from './pages/Packages';
import Jamaah from './pages/Jamaah';
import Agents from './pages/Agents';
import Logistics from './pages/Logistics';
import Departures from './pages/Departures';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import Categories from './pages/Categories';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Users from './pages/Users';
import Roles from './pages/Roles';
import HR from './pages/HR';
import Marketing from './pages/Marketing';

import './index.css';

// Helper: Mapping Role ke Capabilities
// Ini mencegah error "undefined" di halaman-halaman
const getUserCapabilities = (role) => {
  const capabilitiesMap = {
    // Super Admin / Owner
    administrator: ['manage_options', 'manage_packages', 'manage_jamaah', 'manage_finance', 'manage_tasks', 'manage_categories', 'manage_flights', 'manage_hotels', 'manage_departures', 'manage_users', 'manage_roles', 'view_reports', 'list_users'],
    owner: ['manage_options', 'manage_packages', 'manage_jamaah', 'manage_finance', 'manage_tasks', 'manage_categories', 'manage_flights', 'manage_hotels', 'manage_departures', 'manage_users', 'manage_roles', 'view_reports', 'list_users'],
    
    // Staff Khusus
    admin_staff: ['read_packages', 'manage_packages', 'read_jamaah', 'manage_jamaah', 'manage_tasks', 'manage_categories', 'manage_flights', 'manage_hotels', 'manage_departures', 'list_users', 'view_reports'],
    finance_staff: ['read_packages', 'read_jamaah', 'manage_finance', 'view_reports'],
    marketing_staff: ['read_packages', 'read_jamaah', 'manage_marketing'],
    hr_staff: ['list_users', 'manage_users', 'manage_hr'],
    ops_staff: ['read_packages', 'read_jamaah', 'manage_jamaah', 'manage_flights', 'manage_hotels', 'manage_departures']
  };

  // Return capabilities sesuai role, atau array kosong jika tidak ditemukan
  return capabilitiesMap[role] || [];
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 1. AMBIL DATA USER DARI WINDOW (Dikirim dari PHP)
  // Default ke 'subscriber' jika tidak ada data untuk mencegah crash
  const currentUserRole = window.umhData?.currentUser?.role || 'subscriber';
  
  // 2. HITUNG CAPABILITIES SEKALI SAJA
  const userCapabilities = useMemo(() => getUserCapabilities(currentUserRole), [currentUserRole]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
          
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          
          <div 
            className={`flex-1 flex flex-col h-full transition-all duration-300 
              ${sidebarOpen ? 'ml-64' : 'ml-20'}
            `}
          >
            <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 pb-20">
              <GlobalErrorAlert />

              {/* PERBAIKAN UTAMA: 
                 Mengirim props `userCapabilities` ke semua halaman 
                 yang membutuhkannya untuk pengecekan izin tombol.
              */}
              <Routes>
                {/* Dashboard jarang butuh capabilities, tapi bisa dikirim jika perlu */}
                <Route path="/" element={<Dashboard />} />

                <Route path="/package-categories" element={<PackageCategories userCapabilities={userCapabilities} />} />
                <Route path="/packages" element={<Packages userCapabilities={userCapabilities} />} />
                <Route path="/jamaah" element={<Jamaah userCapabilities={userCapabilities} />} />
                <Route path="/agents" element={<Agents userCapabilities={userCapabilities} />} />
                <Route path="/logistics" element={<Logistics userCapabilities={userCapabilities} />} />
                <Route path="/departures" element={<Departures userCapabilities={userCapabilities} />} />
                <Route path="/tasks" element={<Tasks userCapabilities={userCapabilities} />} />
                <Route path="/finance" element={<Finance userCapabilities={userCapabilities} />} />
                <Route path="/categories" element={<Categories userCapabilities={userCapabilities} />} />
                <Route path="/hotels" element={<Hotels userCapabilities={userCapabilities} />} />
                <Route path="/flights" element={<Flights userCapabilities={userCapabilities} />} />
                <Route path="/users" element={<Users userCapabilities={userCapabilities} />} />
                <Route path="/roles" element={<Roles userCapabilities={userCapabilities} />} />
                
                {/* Sub-routes mungkin menangani capabilities di dalamnya, tapi kita kirim saja */}
                <Route path="/hr/*" element={<HR userCapabilities={userCapabilities} />} />
                <Route path="/marketing/*" element={<Marketing userCapabilities={userCapabilities} />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

const container = document.getElementById('umh-app-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}