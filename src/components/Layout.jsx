import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useData } from '../contexts/DataContext';
import Spinner from './Spinner';

const Layout = ({ children }) => {
    const { loading, error } = useData();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // 1. Handle Loading State
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <Spinner />
                    <p className="mt-4 text-gray-600">Memuat data sistem...</p>
                </div>
            </div>
        );
    }

    // 2. Handle Critical Global Error
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full border-l-4 border-red-500">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Terjadi Kesalahan</h2>
                    <p className="text-gray-700">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Muat Ulang
                    </button>
                </div>
            </div>
        );
    }

    // 3. Render Main Layout
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Content Wrapper */}
            <div className="relative flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
                    {/* Render children/routes */}
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;