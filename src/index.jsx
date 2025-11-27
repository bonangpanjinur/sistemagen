import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { DataProvider } from './contexts/DataContext';

import Dashboard from './pages/Dashboard';
import Masters from './pages/Masters'; // Halaman Baru
import Agents from './pages/Agents';
import Packages from './pages/Packages';
import Jamaah from './pages/Jamaah';
import Logistics from './pages/Logistics';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Users from './pages/Users';
import Roles from './pages/Roles';

const App = () => (
    <DataProvider>
        <HashRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/masters" element={<Masters />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/jamaah" element={<Jamaah />} />
                <Route path="/logistics" element={<Logistics />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/hr" element={<HR />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="*" element={<div className="p-10 text-center">404 - Halaman tidak ditemukan</div>} />
            </Routes>
        </HashRouter>
    </DataProvider>
);

const container = document.getElementById('umh-app-root');
if (container) { createRoot(container).render(<App />); }