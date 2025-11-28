import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import Provider (PENTING: Jangan dihapus)
import { DataProvider } from './contexts/DataContext';

// Import Pages
import Dashboard from './pages/Dashboard';
import CreateBooking from './pages/CreateBooking'; 
import Bookings from './pages/Bookings';
import Packages from './pages/Packages';
import Departures from './pages/Departures';
import Hotels from './pages/Hotels';
import PackageCategories from './pages/PackageCategories';
import Flights from './pages/Flights';
import Jamaah from './pages/Jamaah';
import Manifest from './pages/Manifest';
import RoomingList from './pages/RoomingList';
import Logistics from './pages/Logistics';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Payroll from './pages/Payroll';
import Agents from './pages/Agents';
import Marketing from './pages/Marketing';
import Masters from './pages/Masters';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Settings from './pages/Settings';

const UnderConstruction = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-gray-500">Halaman ini sedang dalam tahap pengembangan.</p>
        </div>
    </div>
);

// Component Utama dengan Router
const AppRoutes = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Transaksi */}
                <Route path="/bookings/create" element={<CreateBooking />} />
                <Route path="/bookings" element={<Bookings />} />

                {/* Produk */}
                <Route path="/packages" element={<Packages />} />
                <Route path="/departures" element={<Departures />} />
                <Route path="/hotels" element={<Hotels />} />
                <Route path="/package-categories" element={<PackageCategories />} />
                <Route path="/flights" element={<Flights />} />

                {/* CRM & Operasional */}
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/manifest" element={<Manifest />} />
                <Route path="/rooming" element={<RoomingList />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/tasks" element={<Tasks />} />

                {/* Finance & HR */}
                <Route path="/finance" element={<Finance />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/hr/payroll" element={<Payroll />} />

                {/* Marketing & Admin */}
                <Route path="/agents" element={<Agents />} />
                <Route path="/marketing" element={<Marketing />} />
                <Route path="/masters" element={<Masters />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="*" element={<UnderConstruction title="Halaman Tidak Ditemukan (404)" />} />
            </Routes>
        </HashRouter>
    );
};

// Root App dengan DataProvider (SOLUSI BLANK SCREEN)
const App = () => {
    return (
        <DataProvider>
            <AppRoutes />
        </DataProvider>
    );
};

const container = document.getElementById('umh-app-root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}