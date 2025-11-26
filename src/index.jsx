import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
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

// Ambil data user
const umhData = window.umhData || { currentUser: { role: 'guest' } };

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Role yang menggunakan Top Navigation
  const topNavRoles = ['super_admin', 'administrator', 'owner', 'admin_staff', 'karyawan', 'staff'];
  const useTopNav = topNavRoles.includes(umhData.currentUser.role);

  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
          
          {useTopNav ? (
            <TopNavigation />
          ) : (
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          )}
          
          <div 
            className={`flex-1 flex flex-col h-full transition-all duration-300 
              ${useTopNav ? 'pt-16 w-full' : (sidebarOpen ? 'ml-64' : 'ml-20')}
            `}
          >
            {!useTopNav && <Header toggleSidebar={toggleSidebar} />}
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 pb-20">
              <GlobalErrorAlert />

              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/package-categories" element={<PackageCategories />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/departures" element={<Departures />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/hr/*" element={<HR />} />
                <Route path="/marketing/*" element={<Marketing />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

// Render
const container = document.getElementById('umh-app-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}