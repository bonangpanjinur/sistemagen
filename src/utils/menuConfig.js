import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Calendar, 
    Wallet, 
    Megaphone, 
    ClipboardList, 
    UserCog, 
    Settings, 
    Database, 
    Box,
    Plane,
    Building,
    UserCheck
} from 'lucide-react';

// Definisi Role dan Aksesnya
// super_admin: Akses penuh (Developer)
// administrator: Akses penuh (Pemilik Sistem)
// owner: Pemilik Travel (Bisa lihat semua, edit terbatas)
// admin_staff: Staff Admin (Operasional)
// finance_staff: Staff Keuangan
// marketing_staff: Staff Marketing
// hr_staff: Staff HR
// agent: Agen Travel

export const MENUS = [
    {
        header: 'Utama',
        items: [
            { 
                path: 'dashboard', 
                label: 'Dashboard', 
                icon: <LayoutDashboard size={20} />, 
                roles: ['all'] // Semua user bisa akses
            },
            { 
                path: 'jamaah', 
                label: 'Data Jemaah', 
                icon: <Users size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'agent', 'marketing_staff'] 
            },
            { 
                path: 'packages', 
                label: 'Paket Umrah/Haji', 
                icon: <Briefcase size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'marketing_staff', 'agent'] 
            },
            { 
                path: 'departures', 
                label: 'Jadwal Keberangkatan', 
                icon: <Calendar size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'admin_staff'] 
            }
        ]
    },
    {
        header: 'Keuangan & Bisnis',
        items: [
            { 
                path: 'finance', 
                label: 'Keuangan & Kasir', 
                icon: <Wallet size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'finance_staff'] 
            },
            { 
                path: 'marketing', 
                label: 'Marketing & Leads', 
                icon: <Megaphone size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'marketing_staff'] 
            }
        ]
    },
    {
        header: 'Operasional Internal',
        items: [
            { 
                path: 'tasks', 
                label: 'Tugas Tim', 
                icon: <ClipboardList size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'hr_staff'] 
            },
            { 
                path: 'logistics', 
                label: 'Logistik & Perlengkapan', 
                icon: <Box size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'logistics_staff'] 
            },
            { 
                path: 'hr', 
                label: 'HR & Karyawan', 
                icon: <UserCog size={20} />, 
                roles: ['super_admin', 'administrator', 'owner', 'hr_staff'] 
            }
        ]
    },
    {
        header: 'Master Data',
        items: [
            { path: 'hotels', label: 'Hotel', icon: <Building size={18} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff'] },
            { path: 'flights', label: 'Maskapai', icon: <Plane size={18} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff'] },
            { path: 'agents', label: 'Agen & Mitra', icon: <UserCheck size={18} />, roles: ['super_admin', 'administrator', 'owner', 'marketing_staff'] },
            { path: 'users', label: 'Pengguna Sistem', icon: <Users size={18} />, roles: ['super_admin', 'administrator', 'owner'] },
            { path: 'settings', label: 'Pengaturan', icon: <Settings size={18} />, roles: ['super_admin', 'administrator'] }
        ]
    }
];

// Helper function untuk cek akses
export const hasAccess = (userRole, allowedRoles) => {
    if (!userRole) return false;
    if (allowedRoles.includes('all')) return true;
    if (userRole === 'super_admin' || userRole === 'administrator') return true; // Admin selalu bisa
    return allowedRoles.includes(userRole);
};