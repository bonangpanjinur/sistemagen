import React from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Briefcase, DollarSign, Calendar } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';

const Dashboard = ({ userCapabilities }) => {
    // Default stats to prevent crash if stats are undefined
    const { stats = {}, loading, error } = useData();

    // Safe stats access
    const totalJamaah = stats.total_jamaah || 0;
    const activePackages = stats.active_packages || 0;
    const totalRevenue = stats.total_revenue || 0;
    const upcomingDepartures = stats.upcoming_departures || [];

    // Safe Capabilities
    const caps = Array.isArray(userCapabilities) ? userCapabilities : [];
    // Anda bisa menambahkan logika render berdasarkan caps di sini jika perlu

    if (loading) return <div className="p-10 flex justify-center"><Spinner text="Memuat Dashboard..." /></div>;
    
    // Tampilkan error jika ada, tapi jangan crash
    if (error) return (
        <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700">
            <h3 className="font-bold">Gagal memuat dashboard</h3>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Jamaah" 
                    value={totalJamaah} 
                    icon={<Users className="text-blue-600" />} 
                    bg="bg-blue-50" 
                />
                <StatCard 
                    title="Paket Aktif" 
                    value={activePackages} 
                    icon={<Briefcase className="text-green-600" />} 
                    bg="bg-green-50" 
                />
                <StatCard 
                    title="Pendapatan" 
                    value={formatCurrency(totalRevenue)} 
                    icon={<DollarSign className="text-yellow-600" />} 
                    bg="bg-yellow-50" 
                />
                <StatCard 
                    title="Keberangkatan" 
                    value={upcomingDepartures.length} 
                    icon={<Calendar className="text-purple-600" />} 
                    bg="bg-purple-50" 
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <h2 className="text-lg font-semibold mb-4">Jadwal Keberangkatan Terdekat</h2>
                {upcomingDepartures.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Paket</th>
                                    <th className="px-4 py-2 text-left">Tanggal</th>
                                    <th className="px-4 py-2 text-left">Kuota</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingDepartures.map((item, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="px-4 py-3 font-medium">{item.name || 'Nama Paket'}</td>
                                        <td className="px-4 py-3">{item.date || '-'}</td>
                                        <td className="px-4 py-3">{item.booked}/{item.quota}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Belum ada jadwal keberangkatan dalam waktu dekat.</p>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${bg}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default Dashboard;