import React from 'react';
import Layout from '../components/Layout'; 
import { useData } from '../contexts/DataContext';
import { Users, Briefcase, DollarSign, Calendar, ArrowRight, TrendingUp, Activity } from 'lucide-react';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
    const { stats, loading, error, user } = useData();

    const data = stats || {};
    const totalJamaah = data.total_jamaah || 0;
    const activePackages = data.active_packages || 0;
    const totalRevenue = data.total_revenue || 0;
    const upcomingDepartures = Array.isArray(data.upcoming_departures) ? data.upcoming_departures : [];

    const renderContent = () => {
        if (loading && !stats) {
            return (
                <div className="h-[60vh] flex flex-col justify-center items-center">
                    <Spinner size={40} text="Menyiapkan Dashboard..." />
                </div>
            );
        }

        if (error && !stats) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex flex-col items-center justify-center text-center">
                    <Activity size={48} className="mb-4 text-red-400" />
                    <h3 className="font-bold text-lg">Gagal memuat data dashboard</h3>
                    <p className="text-sm mt-1">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Coba Lagi
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Halo, {user ? user.name.split(' ')[0] : 'Partner'}! 👋
                        </h1>
                        <p className="text-gray-500 mt-1">Berikut adalah ringkasan aktivitas travel Anda hari ini.</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Jamaah" 
                        value={totalJamaah} 
                        subtext="Aktif terdaftar"
                        icon={<Users size={24} className="text-blue-600" />} 
                        color="blue"
                    />
                    <StatCard 
                        title="Paket Aktif" 
                        value={activePackages} 
                        subtext="Tersedia untuk booking"
                        icon={<Briefcase size={24} className="text-emerald-600" />} 
                        color="emerald"
                    />
                    <StatCard 
                        title="Pendapatan" 
                        value={formatCurrency(totalRevenue)} 
                        subtext="Total masuk (gross)"
                        icon={<DollarSign size={24} className="text-amber-600" />} 
                        color="amber"
                    />
                    <StatCard 
                        title="Keberangkatan" 
                        value={upcomingDepartures.length} 
                        subtext="Jadwal terdekat"
                        icon={<Calendar size={24} className="text-purple-600" />} 
                        color="purple"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Departures Table */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Jadwal Keberangkatan</h3>
                                <p className="text-xs text-gray-500 mt-1">5 Jadwal penerbangan terdekat</p>
                            </div>
                            <a href="#/departures" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight size={14} />
                            </a>
                        </div>
                        
                        <div className="overflow-x-auto flex-1">
                            {upcomingDepartures.length > 0 ? (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-3">Paket</th>
                                            <th className="px-6 py-3">Tanggal</th>
                                            <th className="px-6 py-3 text-center">Status Kuota</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {upcomingDepartures.map((item, index) => {
                                            const percentage = Math.round((item.booked / item.quota) * 100) || 0;
                                            return (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name || 'Tanpa Nama'}</td>
                                                    <td className="px-6 py-4 text-gray-600 font-mono">{item.date || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600 w-12 text-right">
                                                                {item.booked}/{item.quota}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <Calendar size={48} className="text-gray-300 mb-3" />
                                    <p>Belum ada jadwal keberangkatan dalam waktu dekat.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / Mini Stats */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-2">Butuh Bantuan?</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Tim support kami siap membantu Anda mengelola sistem travel.
                            </p>
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Hubungi Support
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Aktivitas Cepat</h3>
                            <div className="space-y-3">
                                <a href="#/jamaah" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <Users size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700">Tambah Jamaah Baru</span>
                                </a>
                                <a href="#/finance" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="bg-green-100 text-green-600 p-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <DollarSign size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700">Catat Pembayaran</span>
                                </a>
                                <a href="#/packages" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Briefcase size={18} />
                                    </div>
                                    <span className="font-medium text-gray-700">Buat Paket Baru</span>
                                </a>
                            </div>
                        </div>
                    </div>
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

const StatCard = ({ title, value, subtext, icon, color }) => {
    const bgColors = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h4>
                </div>
                <div className={`p-3 rounded-xl ${bgColors[color] || bgColors.blue}`}>
                    {icon}
                </div>
            </div>
            {subtext && (
                <div className="mt-4 flex items-center text-xs text-gray-400">
                    <TrendingUp size={12} className="mr-1" /> {subtext}
                </div>
            )}
        </div>
    );
};

export default Dashboard;