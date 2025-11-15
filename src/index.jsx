/*
 * Lokasi File: /src/index.jsx
 * File: index.jsx
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

// Import komponen layout utama
// PERBAIKAN: Hapus ekstensi .jsx agar build tool bisa me-resolve path
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Spinner from './components/Spinner';
import GlobalErrorAlert from './components/GlobalErrorAlert';

// Import semua halaman
// PERBAIKAN: Hapus ekstensi .jsx
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Jamaah from './pages/Jamaah';
import Finance from './pages/Finance';
import Tasks from './pages/Tasks';
import Categories from './pages/Categories';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Departures from './pages/Departures';
import Users from './pages/Users';
import Roles from './pages/Roles';

// Import Context Provider
// PERBAIKAN: Hapus ekstensi .jsx
import { DataProvider } from './contexts/DataContext';

// Import CSS
// PERBAIKAN: Hapus ekstensi .css
import './index.css';

// Ambil data global dari WordPress
const { currentUser } = window.umhData || { currentUser: { name: 'Guest', role: 'guest', capabilities: [] } };
// Buat kapabilitas dari role jika tidak ada (untuk file stub)
if (!currentUser.capabilities) {
    // PERBAIKAN: Ambil kapabilitas dari data roles yang di-bootstrap
    const allRoles = window.umhData.roles || [];
    // Cari role yang sesuai
    const userRoleData = allRoles.find(r => r.role_key === currentUser.role);
    currentUser.capabilities = userRoleData?.capabilities || ['read'];
}


// Komponen untuk merender halaman berdasarkan route
const PageRouter = ({ route, userCapabilities }) => {
    switch (route) {
        case '#/packages':
            return <Packages userCapabilities={userCapabilities} />;
        case '#/jamaah':
            return <Jamaah userCapabilities={userCapabilities} />;
        case '#/finance':
            return <Finance userCapabilities={userCapabilities} />;
        case '#/tasks':
            return <Tasks userCapabilities={userCapabilities} />;
        case '#/categories':
            return <Categories userCapabilities={userCapabilities} />;
        case '#/flights':
            return <Flights userCapabilities={userCapabilities} />;
        case '#/hotels':
            return <Hotels userCapabilities={userCapabilities} />;
        case '#/departures':
            return <Departures userCapabilities={userCapabilities} />;
        case '#/users':
            return <Users userCapabilities={userCapabilities} />;
        case '#/roles':
            return <Roles userCapabilities={userCapabilities} />;
        case '#/':
        default:
            return <Dashboard userCapabilities={userCapabilities} />;
    }
};

// Komponen App utama
const App = () => {
    const [route, setRoute] = useState(window.location.hash || '#/');
    const [pageTitle, setPageTitle] = useState('Dashboard');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleHashChange = () => {
            setRoute(window.location.hash || '#/');
        };

        window.addEventListener('hashchange', handleHashChange);
        
        // Simulasikan loading data awal
        setTimeout(() => setIsLoading(false), 500); 

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Update judul halaman berdasarkan route
    useEffect(() => {
        const newTitle = (route.replace('#/', '') || 'dashboard')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase()); // Kapitalisasi
        setPageTitle(newTitle);
    }, [route]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <Spinner text="Memuat aplikasi..." size={32} />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            {/* PERBAIKAN BARU: Tambahkan komponen error global */}
            <GlobalErrorAlert />
            
            {/* Sidebar */}
            <Sidebar currentPath={route} userCapabilities={currentUser.capabilities} />

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col ml-64"> {/* ml-64 = lebar sidebar */}
                {/* Header */}
                <Header title={pageTitle} />

                {/* Area Konten Halaman */}
                <main className="flex-1 p-6 pt-24 overflow-y-auto"> {/* PERBAIKAN UI: pt-24 = 16 (tinggi header) + 8 (padding) */}
                    <PageRouter route={route} userCapabilities={currentUser.capabilities} />
                </main>
            </div>
        </div>
    );
};

// Render aplikasi
const rootElement = document.getElementById('umh-react-app');
if (rootElement) {
    ReactDOM.render(
        <React.StrictMode>
            <DataProvider>
                <App />
            </DataProvider>
        </React.StrictMode>,
        rootElement
    );
}