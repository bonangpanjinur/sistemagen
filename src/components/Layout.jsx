import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast'; 

const Layout = ({ children, title }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
            {/* Overlay Mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gray-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    title={title} 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            
            {/* Global Notifications */}
            <Toaster position="top-right" />
        </div>
    );
};

export default Layout;