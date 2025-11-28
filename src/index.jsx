import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Context & Components
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import GlobalErrorAlert from './components/GlobalErrorAlert';

// Pages Import
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Departures from './pages/Departures';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Agents from './pages/Agents';
import Finance from './pages/Finance';
import Manifest from './pages/Manifest';
import Marketing from './pages/Marketing';
import Masters from './pages/Masters';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Roles from './pages/Roles';
import HR from './pages/HR';
import Payroll from './pages/Payroll';
import Logistics from './pages/Logistics';
import RoomingList from './pages/RoomingList';
import Tasks from './pages/Tasks';
import Categories from './pages/Categories';

const initApp = () => {
    let container = document.getElementById('umroh-manager-app');

    // --- AUTO-FIX: BUAT WADAH JIKA HILANG ---
    if (!container) {
        console.warn('⚠️ Container #umroh-manager-app tidak ditemukan. Mencoba membuat container darurat...');
        
        // Cari lokasi standar konten admin WP
        const wpBody = document.getElementById('wpbody-content');
        const wrap = document.querySelector('.wrap');
        const targetLocation = wrap || wpBody;

        if (targetLocation) {
            container = document.createElement('div');
            container.id = 'umroh-manager-app';
            // Tambahkan styling agar langsung terlihat rapi
            container.style.minHeight = '100vh'; 
            
            // Masukkan container ke dalam halaman
            targetLocation.appendChild(container);
            console.log('✅ Container darurat berhasil dibuat & disuntikkan.');
        } else {
            console.error('❌ Gagal membuat container: Area admin WP tidak ditemukan.');
            return; // Menyerah jika halaman WP admin pun tidak ada
        }
    }
    // ----------------------------------------

    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <DataProvider>
                <HashRouter>
                    <Layout>
                        <GlobalErrorAlert />
                        <Routes>
                            {/* Dashboard */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />

                            {/* Jamaah */}
                            <Route path="/jamaah" element={<Jamaah />} />

                            {/* Bookings */}
                            <Route path="/bookings" element={<Bookings />} />
                            <Route path="/bookings/create" element={<CreateBooking />} />
                            <Route path="/bookings/edit/:id" element={<CreateBooking />} />

                            {/* Packages */}
                            <Route path="/packages" element={<Packages />} />
                            <Route path="/packages/categories" element={<PackageCategories />} />

                            {/* Departures */}
                            <Route path="/departures" element={<Departures />} />
                            <Route path="/departures/rooming" element={<RoomingList />} />

                            {/* Flights & Hotels */}
                            <Route path="/flights" element={<Flights />} />
                            <Route path="/hotels" element={<Hotels />} />

                            {/* Agents */}
                            <Route path="/agents" element={<Agents />} />

                            {/* Finance & HR */}
                            <Route path="/finance" element={<Finance />} />
                            <Route path="/finance/payroll" element={<Payroll />} />
                            <Route path="/hr" element={<HR />} />

                            {/* Manifest & Logistics */}
                            <Route path="/manifest" element={<Manifest />} />
                            <Route path="/logistics" element={<Logistics />} />

                            {/* Marketing & Tasks */}
                            <Route path="/marketing" element={<Marketing />} />
                            <Route path="/tasks" element={<Tasks />} />

                            {/* Masters & Settings */}
                            <Route path="/masters" element={<Masters />} />
                            <Route path="/masters/categories" element={<Categories />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/users" element={<Users />} />
                            <Route path="/settings/roles" element={<Roles />} />

                            {/* 404 Fallback */}
                            <Route path="*" element={
                                <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                                    <h2 className="text-2xl font-bold text-gray-700">404 - Halaman Tidak Ditemukan</h2>
                                    <p className="mt-2 text-gray-500">Halaman yang Anda cari tidak tersedia.</p>
                                    <a href="#/dashboard" className="mt-4 text-blue-600 hover:underline">Kembali ke Dashboard</a>
                                </div>
                            } />
                        </Routes>
                    </Layout>
                </HashRouter>
            </DataProvider>
        </React.StrictMode>
    );
};

// Pastikan DOM sudah siap sepenuhnya sebelum render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // Delay sedikit untuk memastikan script WP lain sudah jalan
    setTimeout(initApp, 100);
}