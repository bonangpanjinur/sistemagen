import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Components
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import GlobalErrorAlert from './components/GlobalErrorAlert.jsx';
import { DataProvider } from './contexts/DataContext.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Agents from './pages/Agents.jsx';
import Jamaah from './pages/Jamaah.jsx';
import Packages from './pages/Packages.jsx';
import PackageCategories from './pages/PackageCategories.jsx';
import Flights from './pages/Flights.jsx';
import Hotels from './pages/Hotels.jsx';
import Departures from './pages/Departures.jsx';

import Finance from './pages/Finance.jsx';
import Logistics from './pages/Logistics.jsx';
import Users from './pages/Users.jsx';
import Roles from './pages/Roles.jsx';
import Tasks from './pages/Tasks.jsx';
import Categories from './pages/Categories.jsx'; 

// NEW PAGES
import HR from './pages/HR.jsx';
import Marketing from './pages/Marketing.jsx';

const App = () => {
    const [userCapabilities, setUserCapabilities] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load capabilities from global object provided by WordPress
        if (window.umhData) {
            setUserCapabilities(window.umhData.capabilities || []);
            // Default avatar fallback jika null
            const userData = window.umhData.currentUser || {};
            if (!userData.avatar) {
                userData.avatar = 'https://www.gravatar.com/avatar/?d=mp'; 
            }
            setCurrentUser(userData);
        } else {
            console.warn("umhData not found in window object");
        }
        setLoading(false);
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Application...</div>;

    return (
        <HashRouter>
            <DataProvider>
                <div className="flex h-screen bg-gray-100">
                    <Sidebar userCapabilities={userCapabilities} />
                    
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Header user={currentUser} />
                        
                        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                            <GlobalErrorAlert />
                            <Routes>
                                <Route path="/" element={<Dashboard userCapabilities={userCapabilities} />} />
                                
                                {/* Core Modules */}
                                <Route path="/agents" element={<Agents userCapabilities={userCapabilities} />} />
                                <Route path="/jamaah" element={<Jamaah userCapabilities={userCapabilities} />} />
                                
                                {/* Products */}
                                <Route path="/packages" element={<Packages userCapabilities={userCapabilities} />} />
                                <Route path="/package-categories" element={<PackageCategories userCapabilities={userCapabilities} />} />
                                <Route path="/flights" element={<Flights userCapabilities={userCapabilities} />} />
                                <Route path="/hotels" element={<Hotels userCapabilities={userCapabilities} />} />
                                <Route path="/departures" element={<Departures userCapabilities={userCapabilities} />} />

                                {/* Modules with Sub-Routes */}
                                <Route path="/hr/*" element={<HR userCapabilities={userCapabilities} />} />
                                <Route path="/marketing/*" element={<Marketing userCapabilities={userCapabilities} />} />
                                <Route path="/finance/*" element={<Finance userCapabilities={userCapabilities} />} />
                                <Route path="/logistics/*" element={<Logistics userCapabilities={userCapabilities} />} />

                                {/* Settings & System */}
                                <Route path="/users" element={<Users userCapabilities={userCapabilities} />} />
                                <Route path="/roles" element={<Roles userCapabilities={userCapabilities} />} />
                                <Route path="/tasks" element={<Tasks userCapabilities={userCapabilities} />} />
                                <Route path="/categories" element={<Categories userCapabilities={userCapabilities} />} />
                                
                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </DataProvider>
        </HashRouter>
    );
};

// [PERBAIKAN CRITICAL] Pastikan ID ini sama dengan di dashboard-react.php
const container = document.getElementById('umh-app-root');

if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("Target container 'umh-app-root' not found in DOM.");
}