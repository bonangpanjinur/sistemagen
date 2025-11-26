import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import Pages (Sesuai dengan file yang ada di folder src/pages/)
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories'; // Tambahan: File ada
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Jamaah from './pages/Jamaah';
import Logistics from './pages/Logistics';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Categories from './pages/Categories'; // Tambahan: File ada (Kategori Keuangan)
import HR from './pages/HR';
import Tasks from './pages/Tasks';
import Marketing from './pages/Marketing';
import Users from './pages/Users';
import Roles from './pages/Roles'; // Tambahan: File ada

const App = () => {
    return (
        <HashRouter>
            <Routes>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Master Data */}
                <Route path="/agents" element={<Agents />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/package-categories" element={<PackageCategories />} /> {/* Route Baru */}
                <Route path="/flights" element={<Flights />} />
                <Route path="/hotels" element={<Hotels />} />

                {/* Operasional */}
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/departures" element={<Departures />} />

                {/* Keuangan */}
                <Route path="/finance" element={<Finance />} />
                <Route path="/categories" element={<Categories />} /> {/* Route Baru */}

                {/* HR & Kantor */}
                <Route path="/hr" element={<HR />} />
                <Route path="/tasks" element={<Tasks />} />

                {/* Marketing */}
                <Route path="/marketing" element={<Marketing />} />

                {/* Sistem */}
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} /> {/* Route Baru */}
                
                {/* 404 Not Found */}
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
                        <h1 className="text-6xl font-bold mb-4">404</h1>
                        <p className="text-xl mb-8">Halaman modul ini belum tersedia atau sedang dikembangkan.</p>
                        <a href="#/" className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 transition">
                            Kembali ke Dashboard
                        </a>
                    </div>
                } />
            </Routes>
        </HashRouter>
    );
};

// Mount React ke DIV 'umh-app'
const container = document.getElementById('umh-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}