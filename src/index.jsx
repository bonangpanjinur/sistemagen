import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import Pages
import Dashboard from './pages/Dashboard';
// Modul Transaksi
import CreateBooking from './pages/CreateBooking'; 
import Bookings from './pages/Bookings';
// Modul Produk & Inventory
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import PackageCategories from './pages/PackageCategories';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
// Modul CRM
import Jamaah from './pages/Jamaah';
// Modul Operasional
import Tasks from './pages/Tasks';
import Logistics from './pages/Logistics';
import RoomingList from './pages/RoomingList';
// Modul Keuangan
import Finance from './pages/Finance';
// Modul HR
import HR from './pages/HR';
import Payroll from './pages/Payroll'; // Import Baru
// Modul Marketing & Agen
import Marketing from './pages/Marketing';
import Agents from './pages/Agents';
// Modul Master Data
import Masters from './pages/Masters';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';

// Placeholder
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
                <Route path="/bookings" element={<Bookings />} />

                {/* === MODUL 2: PRODUK & INVENTORY === */}
                <Route path="/packages" element={<Packages />} />
                <Route path="/departures" element={<Departures />} />
                <Route path="/package-categories" element={<PackageCategories />} />
                <Route path="/flights" element={<Flights />} />
                <Route path="/hotels" element={<Hotels />} />

                {/* === MODUL 3: CRM (JEMAAH) === */}
                <Route path="/jamaah" element={<Jamaah />} />

                {/* === MODUL 4: OPERASIONAL === */}
                <Route path="/rooming" element={<RoomingList />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/logistics" element={<Logistics />} />

                {/* === MODUL 5: KEUANGAN === */}
                <Route path="/finance" element={<Finance />} />
                
                {/* === MODUL 6: HR & KARYAWAN === */}
                <Route path="/hr" element={<HR />} />
                <Route path="/hr/payroll" element={<Payroll />} /> {/* Route Baru */}

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