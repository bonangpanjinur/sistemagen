import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';

// --- COMPONENTS ---
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GlobalErrorAlert from './components/GlobalErrorAlert';

// --- PAGES ---
import Dashboard from './pages/Dashboard';

// Master Data
import PackageCategories from './pages/PackageCategories'; // Halaman Baru v1.6
import Packages from './pages/Packages';
import Jamaah from './pages/Jamaah';
import Agents from './pages/Agents'; // Halaman Baru v1.4

// Operasional
import Logistics from './pages/Logistics'; // Halaman Baru v1.4
import Departures from './pages/Departures';
import Tasks from './pages/Tasks';

// Keuangan
import Finance from './pages/Finance';
import Categories from './pages/Categories'; // Kategori Keuangan

// Inventory
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';

// Manajemen & HR
import Users from './pages/Users';
import Roles from './pages/Roles';
import HR from './pages/HR'; // Halaman dengan Sub-routes (Payroll/Attendance)
import Marketing from './pages/Marketing'; // Halaman dengan Sub-routes

import './index.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DataProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
          
          {/* Sidebar Navigation */}
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          
          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
            
            {/* Top Header */}
            <Header toggleSidebar={toggleSidebar} />
            
            {/* Scrollable Page Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              
              {/* Global Alert System */}
              <GlobalErrorAlert />

              {/* Application Routes */}
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Master Data */}
                <Route path="/package-categories" element={<PackageCategories />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/agents" element={<Agents />} />

                {/* Operasional */}
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/departures" element={<Departures />} />
                <Route path="/tasks" element={<Tasks />} />

                {/* Keuangan */}
                <Route path="/finance" element={<Finance />} />
                <Route path="/categories" element={<Categories />} />

                {/* Inventory */}
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/flights" element={<Flights />} />

                {/* Manajemen */}
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                
                {/* Module dengan Sub-Routes */}
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

// Render Application
const container = document.getElementById('umh-app-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Umroh Manager Error: Target container #umh-app-root not found in the DOM.');
}