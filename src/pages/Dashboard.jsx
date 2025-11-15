import React, { useState, useEffect } from 'react';
// import api from '../utils/api'; // Dihapus
import { Users, Package, DollarSign, CheckSquare, BarChart2 } from 'lucide-react';
// import Spinner from '../components/Spinner'; // Dihapus

// --- STUB UNTUK API ---
// Objek API tiruan untuk menggantikan file ../utils/api
const api = {
    get: (endpoint) => {
        console.log(`[STUB API] GET: ${endpoint}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === 'stats') {
                    // Kembalikan data statistik tiruan
                    resolve({
                        data: {
                            total_jamaah: 120,
                            total_packages: 15,
                            total_revenue: 'Rp 1.2M',
                            tasks_completed: 8,
                            total_tasks: 10
                        }
                    });
                } else {
                    resolve({ data: {} });
                }
            }, 500); // Tunda 0.5 detik
        });
    }
};

// --- STUB UNTUK SPINNER ---
// Komponen Spinner tiruan untuk menggantikan file ../components/Spinner
const Spinner = ({ size = 24, text = "Memuat..." }) => (
    <div className="flex flex-col justify-center items-center p-8">
        <svg
            className="animate-spin text-blue-600"
            style={{ height: `${size}px`, width: `${size}px` }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
        {text && <span className="mt-3 text-gray-600">{text}</span>}
    </div>
);


// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ambil data statistik dari API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <Spinner size={32} text="Memuat statistik..." />;
    }

    return (
        <div className="space-y-6">
            {/* Grid Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah" 
                    value={stats.total_jamaah} 
                    icon={<Users size={24} className="text-blue-600" />}
                    color="text-blue-600 bg-blue-100"
                />
                <StatCard 
                    title="Total Paket" 
                    value={stats.total_packages} 
                    icon={<Package size={24} className="text-green-600" />}
                    color="text-green-600 bg-green-100"
                />
                <StatCard 
                    title="Total Pemasukan" 
                    value={stats.total_revenue} 
                    icon={<DollarSign size={24} className="text-yellow-600" />}
                    color="text-yellow-600 bg-yellow-100"
                />
                <StatCard 
                    title="Tugas Selesai" 
                    value={`${stats.tasks_completed} / ${stats.total_tasks}`}
                    icon={<CheckSquare size={24} className="text-purple-600" />}
                    color="text-purple-600 bg-purple-100"
                />
            </div>
            
            {/* Placeholder untuk Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart2 size={20} className="mr-2 text-blue-600" />
                        Statistik Pendaftaran Jamaah
                    </h3>
                    <div className="h-64 bg-gray-100 flex items-center justify-center rounded">
                        <p className="text-gray-500">[Placeholder Grafik]</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <DollarSign size={20} className="mr-2 text-green-600" />
                        Status Pembayaran
                    </h3>
                    <div className="h-64 bg-gray-100 flex items-center justify-center rounded">
                        <p className="text-gray-500">[Placeholder Grafik Donat]</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;