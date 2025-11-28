import { createRoot } from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import './index.css';

// Import Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './contexts/DataContext';

// Import Pages
import Dashboard from './pages/Dashboard';
import Packages from './pages/Packages';
import Departures from './pages/Departures'; // <--- PASTIKAN INI DI-IMPORT
import Jamaah from './pages/Jamaah';
import Finance from './pages/Finance';
import Marketing from './pages/Marketing';
import Hotels from './pages/Hotels';
import Users from './pages/Users';
import Settings from './pages/Settings';

const App = () => {
    // State untuk routing sederhana (hash based atau state based)
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Handle navigasi dari Sidebar
    const handleNavigate = (page) => {
        setCurrentPage(page);
        // Simpan state page terakhir jika perlu (opsional)
        // localStorage.setItem('last_page', page);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'packages': return <Packages />;
            case 'departures': return <Departures />; // <--- TAMBAHKAN CASE INI
            case 'jamaah': return <Jamaah />;
            case 'finance': return <Finance />;
            case 'marketing': return <Marketing />;
            case 'hotels': return <Hotels />;
            case 'users': return <Users />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    return (
        <DataProvider>
            <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    activePage={currentPage}
                    onNavigate={handleNavigate}
                />
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header 
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                        title={currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} // Capitalize title
                    />
                    
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                        {renderPage()}
                    </main>
                </div>
                
                {/* Global Toast Notification */}
                <Toaster position="top-right" />
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