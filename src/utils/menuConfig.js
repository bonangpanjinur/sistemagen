import {
    LayoutDashboard,
    Users,
    Calendar,
    Plane,
    Hotel,
    FileText,
    Settings,
    Briefcase,
    DollarSign,
    ClipboardList,
    UserCheck,
    Megaphone,
    Package
} from 'lucide-react';

// Pastikan export default atau named export konsisten. 
// Di sini kita gunakan named export 'menuItems' agar mudah diimport.
export const menuItems = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Data Jamaah',
        path: '/jamaah',
        icon: Users
    },
    {
        title: 'Pemesanan',
        path: '/bookings',
        icon: ClipboardList
    },
    {
        title: 'Paket Umroh',
        path: '/packages',
        icon: Package
    },
    {
        title: 'Keberangkatan',
        path: '/departures',
        icon: Calendar
    },
    {
        title: 'Penerbangan',
        path: '/flights',
        icon: Plane
    },
    {
        title: 'Hotel',
        path: '/hotels',
        icon: Hotel
    },
    {
        title: 'Manajemen Agen',
        path: '/agents',
        icon: UserCheck
    },
    {
        title: 'Keuangan',
        path: '/finance',
        icon: DollarSign
    },
    {
        title: 'Manifest',
        path: '/manifest',
        icon: FileText
    },
    {
        title: 'Marketing',
        path: '/marketing',
        icon: Megaphone
    },
    {
        title: 'Master Data',
        path: '/masters',
        icon: Briefcase
    },
    {
        title: 'Pengaturan',
        path: '/settings',
        icon: Settings
    }
];

// Helper untuk mencari judul berdasarkan path (opsional)
export const getPageTitle = (path) => {
    const item = menuItems.find(item => item.path === path);
    return item ? item.title : 'Sistem Agen Umroh';
};