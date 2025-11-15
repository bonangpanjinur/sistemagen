// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/components/
// Nama File: Sidebar.jsx

import React from 'react';
import {
    LayoutDashboard, Package, Users, DollarSign, ListChecks, UserCheck,
    Ticket, Building, Plane, Settings, BarChart, FileText
} from 'lucide-react';

// Navigasi utama
const mainNav = [
    { name: 'Dashboard', href: '#/', icon: LayoutDashboard, cap: 'read' },
    { name: 'Paket', href: '#/packages', icon: Package, cap: 'read_packages' },
    { name: 'Jamaah', href: '#/jamaah', icon: Users, cap: 'read_jamaah' },
    { name: 'Keuangan', href: '#/finance', icon: DollarSign, cap: 'manage_finance' },
    { name: 'Tugas', href: '#/tasks', icon: ListChecks, cap: 'manage_tasks' }, // Icon diperbaiki di sini
    { name: 'Kategori', href: '#/categories', icon: FileText, cap: 'manage_categories' },
    { name: 'Penerbangan', href: '#/flights', icon: Plane, cap: 'manage_flights' },
    { name: 'Hotel', href: '#/hotels', icon: Building, cap: 'manage_hotels' },
    { name: 'Keberangkatan', href: '#/departures', icon: Ticket, cap: 'manage_departures' },
];

// Navigasi pengaturan
const settingsNav = [
    { name: 'Staff', href: '#/users', icon: UserCheck, cap: 'list_users' },
    { name: 'Roles', href: '#/roles', icon: Settings, cap: 'manage_roles' },
    { name: 'Laporan', href: '#/reports', icon: BarChart, cap: 'view_reports' },
];

/**
 * Cek apakah user memiliki kapabilitas
 * @param {string} cap - Nama kapabilitas
 * @param {Array<string>} userCapabilities - List kapabilitas user
 * @returns {boolean}
 */
const hasCapability = (cap, userCapabilities) => {
    return userCapabilities.includes(cap) || userCapabilities.includes('manage_options');
};

// Komponen sub-item untuk link navigasi
const SidebarLink = ({ item, currentPath }) => {
    const isActive = currentPath === item.href;
    const Icon = item.icon;

    return (
        <li>
            <a
                href={item.href}
                className={`flex items-center p-2 rounded-lg text-sm font-medium ${
                    isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{item.name}</span>
            </a>
        </li>
    );
};

// Komponen Sidebar utama
const Sidebar = ({ currentPath, userCapabilities = [] }) => {
    const { currentUser } = window.umhData || { currentUser: { name: 'Pengguna', role: '...'} };

    return (
        <div className="w-64 h-screen bg-gray-800 text-white fixed top-0 left-0 flex flex-col z-20">
            {/* Header Sidebar */}
            <div className="flex items-center justify-center h-16 shadow-md bg-gray-900">
                <h1 className="text-xl font-bold text-white">Travel M</h1>
                {/* Ganti dengan Logo jika ada */}
            </div>

            {/* Konten Navigasi Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Navigasi Utama */}
                <nav className="space-y-1">
                    <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Utama</h3>
                    <ul className="space-y-1">
                        {mainNav
                            .filter(item => hasCapability(item.cap, userCapabilities))
                            .map(item => (
                                <SidebarLink key={item.name} item={item} currentPath={currentPath} />
                            ))}
                    </ul>
                </nav>

                {/* Navigasi Pengaturan */}
                <nav className="mt-6 space-y-1">
                    <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pengaturan</h3>
                    <ul className="space-y-1">
                        {settingsNav
                            .filter(item => hasCapability(item.cap, userCapabilities))
                            .map(item => (
                                <SidebarLink key={item.name} item={item} currentPath={currentPath} />
                            ))}
                    </ul>
                </nav>
            </div>

            {/* Footer Sidebar (Info User) */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
                <div className="flex items-center">
                    {/* Ganti dengan avatar user */}
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white mr-3">
                        {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{currentUser.name || 'Nama Pengguna'}</p>
                        <p className="text-xs text-gray-400 capitalize">{currentUser.role || 'Role'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;