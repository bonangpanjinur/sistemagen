import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';
import './index.css';

// Import Pages Utama
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import Logistics from './pages/Logistics';
import Finance from './pages/Finance';
import Agents from './pages/Agents';
import HR from './pages/HR';

// Import Pages Fitur Baru & Master
import Marketing from './pages/Marketing';
import Tasks from './pages/Tasks';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import PackageCategories from './pages/PackageCategories';
import Settings from './pages/Settings';

// Komponen Fallback 404
const NotFound = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-600">
        <h1 className="text-6xl font-bold mb-4 text-gray-300">404</h1>
        <p className="text-xl font-semibold text-gray-700">Halaman tidak ditemukan</p>
        <p className="text-sm text-gray-500 mt-2">Pastikan URL yang Anda tuju benar.</p>
        <a href="#/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Kembali ke Dashboard
        </a>
    </div>
);

const App = () => {
    // Efek Immersive Mode: Menyembunyikan UI WordPress
    useEffect(() => {
        document.body.classList.add('immersive-mode');
        return () => {
            document.body.classList.remove('immersive-mode');
        };
    }, []);

    return (
        <DataProvider>
            <HashRouter>
                <div className="h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden flex flex-col">
                    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
                    <Routes>
                        {/* Menu Utama */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/jamaah" element={<Jamaah />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/hr" element={<HR />} />
                        
                        {/* Fitur Tambahan */}
                        <Route path="/marketing" element={<Marketing />} />
                        <Route path="/tasks" element={<Tasks />} />
                        
                        {/* Master Data */}
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/categories" element={<PackageCategories />} />
                        
                        {/* Admin & Pengaturan */}
                        <Route path="/roles" element={<Roles />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/settings" element={<Settings />} />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </HashRouter>
        </DataProvider>
    );
};

const container = document.getElementById('umh-app-root') || document.getElementById('umh-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}