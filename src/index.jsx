/*
 * Lokasi File: /src/index.jsx
 * File: index.jsx
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';

// Import komponen layout utama
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Spinner from './components/Spinner.jsx';
import GlobalErrorAlert from './components/GlobalErrorAlert.jsx'; // PERBAIKAN: Tambah ekstensi .jsx

// Import semua halaman
import Dashboard from './pages/Dashboard.jsx';
import Packages from './pages/Packages.jsx';
import Jamaah from './pages/Jamaah.jsx';
import Finance from './pages/Finance.jsx';
import Tasks from './pages/Tasks.jsx';
import Categories from './pages/Categories.jsx';
import Flights from './pages/Flights.jsx';
import Hotels from './pages/Hotels.jsx';
import Departures from './pages/Departures.jsx';
import Users from './pages/Users.jsx';
import Roles from './pages/Roles.jsx';

// Import Context Provider
import { DataProvider } from './contexts/DataContext.jsx';

// Import CSS
import './index.css'; // Ini adalah path relatif, seharusnya benar

// Ambil data global dari WordPress
const { currentUser } = window.umhData || { currentUser: { name: 'Guest', role: 'guest', capabilities: [] } };
// Buat kapabilitas dari role jika tidak ada (untuk file stub)
if (!currentUser.capabilities) {
    // PERBAIKAN: Ambil kapabilitas dari data roles yang di-bootstrap
    const allRoles = window.umhData.roles || {};
    currentUser.capabilities = allRoles[currentUser.role]?.capabilities || ['read'];
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
            <div className="flex items-center justify-center h-screen">
                <Spinner text="Memuat aplikasi..." />
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
                <main className="flex-1 p-6 pt-20 overflow-y-auto"> {/* pt-20 = 16 (tinggi header) + 4 (padding) */}
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