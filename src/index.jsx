import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DataContext from './contexts/DataContext';
import './index.css';

// Import Pages
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Jamaah from './pages/Jamaah';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Bookings from './pages/Bookings';
import CreateBooking from './pages/CreateBooking';
// Baris import Payments yang error dihapus karena file JSX-nya tidak ada dan tidak bisa import PHP
import Finance from './pages/Finance';
import Departures from './pages/Departures';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Manifest from './pages/Manifest';
import RoomingList from './pages/RoomingList';
import Logistics from './pages/Logistics';
import Tasks from './pages/Tasks';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Payroll from './pages/Payroll';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Masters from './pages/Masters';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

const App = () => {
    return (
        <DataContext>
            {/* HashRouter wajib untuk Plugin WP agar tidak bentrok dengan URL admin.php */}
            <HashRouter>
                <Layout>
                    <Routes>
                        {/* Dashboard */}
                        <Route path="/" element={<Dashboard />} />

                        {/* Manajemen Agen & Jamaah */}
                        <Route path="/agents" element={<Agents />} />
                        <Route path="/jamaah" element={<Jamaah />} />

                        {/* Manajemen Paket */}
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/package-categories" element={<PackageCategories />} />

                        {/* Transaksi & Booking */}
                        <Route path="/bookings" element={<Bookings />} />
                        <Route path="/bookings/create" element={<CreateBooking />} />
                        <Route path="/bookings/edit/:id" element={<CreateBooking />} />

                        {/* Keuangan */}
                        <Route path="/finance" element={<Finance />} />
                        
                        {/* Operasional */}
                        <Route path="/departures" element={<Departures />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/manifest" element={<Manifest />} />
                        <Route path="/rooming" element={<RoomingList />} />
                        <Route path="/logistics" element={<Logistics />} />
                        <Route path="/tasks" element={<Tasks />} />

                        {/* Marketing & CRM */}
                        <Route path="/marketing" element={<Marketing />} />

                        {/* HRD */}
                        <Route path="/hr" element={<HR />} />
                        <Route path="/payroll" element={<Payroll />} />

                        {/* Manajemen User & Role */}
                        <Route path="/users" element={<Users />} />
                        <Route path="/roles" element={<Roles />} />

                        {/* Master Data */}
                        <Route path="/masters" element={<Masters />} />
                        <Route path="/categories" element={<Categories />} />

                        {/* Pengaturan */}
                        <Route path="/settings" element={<Settings />} />

                        {/* Halaman 404 - Not Found */}
                        <Route path="*" element={
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <h2 className="text-2xl font-bold mb-2">404</h2>
                                <p>Halaman tidak ditemukan.</p>
                            </div>
                        } />
                    </Routes>
                </Layout>
            </HashRouter>
        </DataContext>
    );
};

// PENTING: ID ini harus sama persis dengan yang ada di file admin/dashboard-react.php
const containerId = 'umroh-manager-app-root';
const container = document.getElementById(containerId);

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    // Error handling jika ID tidak ketemu (berguna untuk debugging)
    console.error(
        `[Umroh Manager] Target container #${containerId} tidak ditemukan.`,
        'Pastikan file admin/dashboard-react.php memuat div dengan ID yang benar.'
    );
}