import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { DataProvider } from './contexts/DataContext';
import './index.css';

// Import semua halaman
import Dashboard from './pages/Dashboard';
import Jamaah from './pages/Jamaah';
import Agents from './pages/Agents';
import Packages from './pages/Packages';
import PackageCategories from './pages/PackageCategories';
import Hotels from './pages/Hotels';
import Flights from './pages/Flights';
import Departures from './pages/Departures';
import Finance from './pages/Finance';
import Logistics from './pages/Logistics';
import Marketing from './pages/Marketing';
import HR from './pages/HR';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Categories from './pages/Categories';

const App = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userCapabilities, setUserCapabilities] = useState([]);

    // Ambil capabilities dari window object (injected by WordPress)
    useEffect(() => {
        if (window.umrohManagerData && window.umrohManagerData.capabilities) {
            setUserCapabilities(window.umrohManagerData.capabilities);
        }
        
        // Cek hash URL untuk deep linking sederhana (misal: #/hotels)
        const hash = window.location.hash.replace('#/', '');
        if (hash) {
            setActivePage(hash);
        }
    }, []);

    // Update hash saat page berubah
    useEffect(() => {
        window.location.hash = `#/${activePage}`;
    }, [activePage]);

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard userCapabilities={userCapabilities} />;
            case 'jamaah': return <Jamaah userCapabilities={userCapabilities} />;
            case 'agents': return <Agents userCapabilities={userCapabilities} />;
            case 'packages': return <Packages userCapabilities={userCapabilities} />;
            case 'package-categories': return <PackageCategories userCapabilities={userCapabilities} />;
            case 'hotels': return <Hotels userCapabilities={userCapabilities} />;
            case 'flights': return <Flights userCapabilities={userCapabilities} />;
            case 'departures': return <Departures userCapabilities={userCapabilities} />;
            case 'finance': return <Finance userCapabilities={userCapabilities} />;
            case 'logistics': return <Logistics userCapabilities={userCapabilities} />;
            case 'marketing': return <Marketing userCapabilities={userCapabilities} />;
            case 'hr': return <HR userCapabilities={userCapabilities} />;
            case 'tasks': return <Tasks userCapabilities={userCapabilities} />;
            case 'users': return <Users userCapabilities={userCapabilities} />;
            case 'roles': return <Roles userCapabilities={userCapabilities} />;
            case 'categories': return <Categories userCapabilities={userCapabilities} />;
            default: return <Dashboard userCapabilities={userCapabilities} />;
        }
    };

    return (
        <DataProvider>
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar 
                    activePage={activePage} 
                    setActivePage={setActivePage} 
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                    userCapabilities={userCapabilities}
                />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                        isMobileOpen={isMobileOpen} 
                        setIsMobileOpen={setIsMobileOpen} 
                        title={activePage.replace('-', ' ').toUpperCase()} 
                    />
                    
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                        {renderPage()}
                    </main>
                </div>
            </div>
        </DataProvider>
    );
};

// Mount App
const container = document.getElementById('umroh-manager-app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}