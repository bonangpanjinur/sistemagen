import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import api from '../utils/api';
import { Users, DollarSign, Briefcase, CheckCircle, Megaphone, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
    const { user } = useData();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('stats/totals');
                setStats(data);
            } catch (error) {
                console.error("Gagal memuat statistik", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${colorClass}`}>
                <Icon size={64} />
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                    {trend && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={12}/> {trend}</p>}
                </div>
                <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data dashboard...</div>;

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-2">Assalamu'alaikum, {user?.name || 'Admin'}!</h1>
                    <p className="text-blue-100 opacity-90">Semoga harimu berkah. Berikut ringkasan aktivitas travel hari ini.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="currentColor"><path d="M45.7,157.3C-21.2,102.8,-2.5,16.3,48.4,-24.2C99.4,-64.7,182.6,-59.2,214.2,-8.7C245.8,41.8,225.8,137.3,168.3,177.3C110.8,217.3,112.6,201.8,45.7,157.3Z" /></svg>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jemaah" 
                    value={stats?.total_jamaah || 0} 
                    icon={Users} 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-50" 
                />
                <StatCard 
                    title="Pemasukan" 
                    value={formatCurrency(stats?.total_revenue || 0)} 
                    icon={DollarSign} 
                    colorClass="text-green-600" 
                    bgClass="bg-green-50" 
                />
                <StatCard 
                    title="Paket Aktif" 
                    value={stats?.total_packages || 0} 
                    icon={Briefcase} 
                    colorClass="text-purple-600" 
                    bgClass="bg-purple-50" 
                />
                <StatCard 
                    title="Prospek Leads" 
                    value="Aktif" 
                    icon={Megaphone} 
                    colorClass="text-orange-600" 
                    bgClass="bg-orange-50" 
                    trend="+5 minggu ini"
                />
            </div>

            {/* Recent Activity & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Jadwal Keberangkatan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={20} className="text-blue-600"/> Keberangkatan Terdekat
                        </h3>
                        <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 rounded-tl-lg">Tanggal</th>
                                    <th className="py-3 px-4">Paket</th>
                                    <th className="py-3 px-4 rounded-tr-lg text-center">Keterisian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats?.upcoming_departures && stats.upcoming_departures.length > 0 ? (
                                    stats.upcoming_departures.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-800">{formatDate(row.departure_date)}</td>
                                            <td className="py-3 px-4 text-gray-600">{row.package_name}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${row.available_seats < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {row.slots_filled} / {row.total_seats}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-gray-400">Belum ada jadwal keberangkatan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600"/> Status Sistem
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-gray-600 text-sm">Versi</span>
                            <span className="font-mono font-bold text-xs bg-gray-200 px-2 py-1 rounded">v1.3.2</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-gray-600 text-sm">Database</span>
                            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-gray-600 text-sm">User</span>
                            <span className="text-blue-600 font-bold text-sm capitalize">{user?.role?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;