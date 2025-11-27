import React from 'react';
import Layout from '../components/Layout'; 
import { useData } from '../contexts/DataContext';
import { Users, Briefcase, DollarSign, Calendar } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
    const { stats, loading, error } = useData();

    // SAFE ACCESS: Mencegah error "Cannot read property of null"
    const data = stats || {};
    const totalJamaah = data.total_jamaah || 0;
    const activePackages = data.active_packages || 0;
    const totalRevenue = data.total_revenue || 0;
    const upcomingDepartures = Array.isArray(data.upcoming_departures) ? data.upcoming_departures : [];

    const renderContent = () => {
        if (loading && !stats) {
            return <div className="p-10 flex justify-center"><Spinner text="Memuat Dashboard..." /></div>;
        }

        if (error && !stats) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700">
                    <h3 className="font-bold">Gagal memuat dashboard</h3>
                    <p>{error}</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Kartu Statistik */}
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

                {/* Tabel Keberangkatan Terdekat */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Jadwal Keberangkatan Terdekat</h2>
                    {upcomingDepartures.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paket</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kuota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {upcomingDepartures.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.name || 'Nama Paket'}</td>
                                            <td className="px-4 py-3 text-gray-600">{item.date || '-'}</td>
                                            <td className="px-4 py-3 text-gray-600">{item.booked} / {item.quota}</td>
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

    return (
        <Layout title="Dashboard Overview">
            {renderContent()}
        </Layout>
    );
};

const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4 transition hover:shadow-md">
        <div className={`p-3 rounded-full ${bg}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

export default Dashboard;