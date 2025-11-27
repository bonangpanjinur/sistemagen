import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalErrorAlert from './GlobalErrorAlert';

const Layout = ({ children, title = "Dashboard" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar 
                isOpen={sidebarOpen} 
                toggleSidebar={toggleSidebar} 
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header Top Bar */}
                <Header 
                    title={title} 
                    toggleSidebar={toggleSidebar} 
                />

                {/* Main Scrollable Content */}
                <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Global Error Handler (jika ada error API global) */}
                        <GlobalErrorAlert />
                        
                        {/* Page Content */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;