import React, { useState, useEffect } from 'react';
import api from '../utils/api.js'; // Import API yang sebenarnya
import { Users, Package, DollarSign, CheckSquare, BarChart2 } from 'lucide-react';
import Spinner from '../components/Spinner.jsx'; // Import Spinner yang sebenarnya

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
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
                // Menggunakan endpoint yang benar dari api-stats.php
                const response = await api.get('stats/totals'); 
                setStats(response.data);
            } catch (error) {
                console.error("Gagal mengambil statistik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <Spinner size={32} text="Memuat statistik..." />;
    }
    
    // Helper untuk format mata uang
    const formatCurrency = (amount) => {
         return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    }

    return (
        <div className="space-y-6">
            {/* Grid Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah" 
                    value={stats.total_jamaah || 0} 
                    icon={<Users size={24} className="text-blue-600" />}
                    colorClass="text-blue-600 bg-blue-100"
                />
                <StatCard 
                    title="Total Paket" 
                    value={stats.total_packages || 0} 
                    icon={<Package size={24} className="text-green-600" />}
                    colorClass="text-green-600 bg-green-100"
                />
                <StatCard 
                    title="Total Pemasukan" 
                    value={formatCurrency(stats.total_revenue)} 
                    icon={<DollarSign size={24} className="text-yellow-600" />}
                    colorClass="text-yellow-600 bg-yellow-100"
                />
                <StatCard 
                    title="Total Pengeluaran" // Mengganti tugas dengan data keuangan
                    value={formatCurrency(stats.total_expense)}
                    icon={<DollarSign size={24} className="text-red-600" />}
                    colorClass="text-red-600 bg-red-100"
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
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
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