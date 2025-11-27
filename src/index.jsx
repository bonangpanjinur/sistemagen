import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';
import './index.css';

// Import Pages
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Logistics from './pages/Logistics';
import Finance from './pages/Finance';
import Agents from './pages/Agents';
import HR from './pages/HR';
import Users from './pages/Users';

// Import New Master Pages (YANG SEBELUMNYA 404)
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import PackageCategories from './pages/PackageCategories';
import Settings from './pages/Settings'; // Halaman Pengaturan Baru

// Komponen Fallback untuk 404
const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-600">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p>Halaman tidak ditemukan atau sedang dalam pengembangan.</p>
        <a href="#/" className="mt-4 text-blue-600 hover:underline">Kembali ke Dashboard</a>
    </div>
);

const App = () => {
    return (
        <DataProvider>
            <HashRouter>
                <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/hr" element={<HR />} />
                        <Route path="/users" element={<Users />} />
                        
                        {/* RUTE BARU DITAMBAHKAN DI SINI */}
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/categories" element={<PackageCategories />} />
                        <Route path="/settings" element={<Settings />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umh-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}