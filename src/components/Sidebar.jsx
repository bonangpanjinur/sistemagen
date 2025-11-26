import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    
    // Fungsi helper untuk mengecek menu aktif
    const isActive = (path) => location.pathname === path ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white';

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white w-64 shadow-xl">
            {/* Logo Area */}
            <div className="flex items-center justify-center h-16 bg-gray-900 border-b border-gray-800">
                <span className="text-xl font-bold tracking-wider text-blue-500">UMRAH<span className="text-white">MANAGER</span></span>
            </div>

            {/* Scrollable Menu Area */}
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    
                    {/* DASHBOARD */}
                    <Link to="/" className={`${isActive('/')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <svg className="mr-3 h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>

                    {/* MODULE: MASTER DATA */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Master Data
                    </div>
                    <Link to="/agents" className={`${isActive('/agents')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">🤝</span>
                        Agen & Mitra
                    </Link>
                    <Link to="/packages" className={`${isActive('/packages')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">📦</span>
                        Paket Umroh
                    </Link>
                    <Link to="/flights" className={`${isActive('/flights')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">✈️</span>
                        Penerbangan
                    </Link>
                    <Link to="/hotels" className={`${isActive('/hotels')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">🏨</span>
                        Hotel
                    </Link>

                    {/* MODULE: TRANSAKSI & JAMAAH */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Operasional
                    </div>
                    <Link to="/jamaah" className={`${isActive('/jamaah')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">👥</span>
                        Data Jamaah
                    </Link>
                    <Link to="/logistics" className={`${isActive('/logistics')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">🎒</span>
                        Logistik & Perlengkapan
                    </Link>
                    <Link to="/departures" className={`${isActive('/departures')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">📅</span>
                        Jadwal Keberangkatan
                    </Link>

                    {/* MODULE: KEUANGAN */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Keuangan
                    </div>
                    <Link to="/finance" className={`${isActive('/finance')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">💰</span>
                        Transaksi & Pembayaran
                    </Link>

                    {/* MODULE: HR & KANTOR */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        HR & Kantor
                    </div>
                    <Link to="/hr" className={`${isActive('/hr')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">👔</span>
                        Karyawan & Payroll
                    </Link>
                    <Link to="/tasks" className={`${isActive('/tasks')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">✅</span>
                        Tugas & To-Do
                    </Link>

                    {/* MODULE: MARKETING */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Marketing
                    </div>
                    <Link to="/marketing" className={`${isActive('/marketing')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">📢</span>
                        Kampanye & Leads
                    </Link>

                    {/* MODULE: PENGATURAN */}
                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sistem
                    </div>
                    <Link to="/users" className={`${isActive('/users')} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                        <span className="mr-3 h-6 w-6 text-center text-lg leading-6">🔐</span>
                        Pengguna & Hak Akses
                    </Link>
                </nav>
            </div>

            {/* User Profile Area */}
            <div className="border-t border-gray-800 p-4">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Administrator</p>
                        <p className="text-xs font-medium text-gray-400">View Profile</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;