import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import Layout (Optional wrapper if needed globally, but usually inside pages)
// Pages Imports
import Dashboard from './pages/Dashboard';
import CreateBooking from './pages/CreateBooking'; // Modul Booking Baru
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import PackageCategories from './pages/PackageCategories';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Jamaah from './pages/Jamaah';
import Tasks from './pages/Tasks';
import Logistics from './pages/Logistics';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';

// Komponen Placeholder untuk halaman yang belum dibuat filenya
const UnderConstruction = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500">Halaman ini sedang dalam tahap pengembangan.</p>
            <p className="text-xs text-gray-400 mt-4">Modul Enterprise V3</p>
        </div>
    </div>
);

const App = () => {
    return (
        <HashRouter>
            <Routes>
                {/* === DASHBOARD === */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* === MODUL 1: TRANSAKSI === */}
                <Route path="/bookings/create" element={<CreateBooking />} />
                {/* List Data Booking belum ada filenya, pakai placeholder dulu */}
                <Route path="/bookings" element={<UnderConstruction title="Data Transaksi Booking" />} />

                {/* === MODUL 2: PRODUK & INVENTORY === */}
                <Route path="/packages" element={<Packages />} />
                <Route path="/departures" element={<Departures />} />
                <Route path="/package-categories" element={<PackageCategories />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/hotels" element={<Hotels />} />

                {/* === MODUL 3: CRM (JEMAAH) === */}
                <Route path="/jamaah" element={<Jamaah />} />

                {/* === MODUL 4: OPERASIONAL === */}
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/logistics" element={<Logistics />} />

                {/* === MODUL 5: KEUANGAN === */}
                <Route path="/finance" element={<Finance />} />
                <Route path="/finance/expenses" element={<Finance />} /> {/* Bisa dipisah nanti jika butuh view beda */}

                {/* === MODUL 6: HR & KARYAWAN === */}
                <Route path="/hr" element={<HR />} />

                {/* === MODUL 7: MARKETING & AGEN === */}
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/agents" element={<Agents />} />

                {/* === MODUL 8: MASTER DATA & SYSTEM === */}
                <Route path="/masters" element={<Masters />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/settings" element={<Settings />} />

                {/* Fallback Route (404) */}
                <Route path="*" element={<UnderConstruction title="Halaman Tidak Ditemukan (404)" />} />
            </Routes>
        </HashRouter>
    );
};

const container = document.getElementById('umh-app-root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}