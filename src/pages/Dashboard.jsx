import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Gunakan Link untuk navigasi cepat
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Users, TrendingUp, TrendingDown, Calendar, Briefcase, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_jamaah: 0, new_jamaah_month: 0, income_month: 0, expense_month: 0,
        logistics_pending: 0, upcoming_departures: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('umh/v1/stats/dashboard');
                // Validasi data sebelum set state
                if (response.data) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError('Gagal memuat data statistik. Pastikan plugin aktif dan API terhubung.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Layout title="Dashboard"><div className="h-96 flex items-center justify-center"><Spinner text="Menghitung Statistik..." /></div></Layout>;
    if (error) return <Layout title="Dashboard"><div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div></Layout>;

    return (
        <Layout title="Dashboard Overview">
            {/* Baris 1: Kartu Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Kartu: Jemaah */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Total Jemaah</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.total_jamaah || 0}</h3>
                        <span className="text-xs text-green-600 font-medium flex items-center">
                            +{stats.new_jamaah_month || 0} baru bulan ini
                        </span>
                    </div>
                </div>

                {/* Kartu: Pemasukan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Pemasukan (Bulan Ini)</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.income_month || 0)}</h3>
                    </div>
                </div>

                {/* Kartu: Pengeluaran */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Pengeluaran (Bulan Ini)</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.expense_month || 0)}</h3>
                    </div>
                </div>

                {/* Kartu: Logistik */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition hover:shadow-md">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Logistik Pending</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.logistics_pending || 0}</h3>
                        <span className="text-xs text-gray-500">Belum ambil koper</span>
                    </div>
                </div>
            </div>

            {/* Baris 2: Konten Utama */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Tabel Jadwal */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={18} className="text-blue-600" />
                            Jadwal Keberangkatan Terdekat
                        </h3>
                        <Link to="/packages" className="text-xs font-medium text-blue-600 hover:text-blue-800">Lihat Semua &rarr;</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-3">Paket</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3 text-center">Kuota</th>
                                    <th className="px-6 py-3 text-center">Sisa Seat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.upcoming_departures && stats.upcoming_departures.length > 0 ? (
                                    stats.upcoming_departures.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.package_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.departure_date}</td>
                                            <td className="px-6 py-4 text-center">{item.quota}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                                    item.available_seats < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {item.available_seats}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                                            Belum ada jadwal keberangkatan aktif. Silakan buat Paket baru.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-purple-600" />
                        Aksi Cepat
                    </h3>
                    <div className="space-y-3">
                        <Link to="/jamaah" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition group border border-gray-100">
                            <span className="font-medium text-sm">Registrasi Jemaah Baru</span>
                            <span className="text-gray-300 group-hover:text-blue-500">&rarr;</span>
                        </Link>
                        <Link to="/finance" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-700 transition group border border-gray-100">
                            <span className="font-medium text-sm">Catat Pembayaran</span>
                            <span className="text-gray-300 group-hover:text-green-500">&rarr;</span>
                        </Link>
                        <Link to="/logistics" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-yellow-50 hover:text-yellow-700 transition group border border-gray-100">
                            <span className="font-medium text-sm">Update Status Koper</span>
                            <span className="text-gray-300 group-hover:text-yellow-500">&rarr;</span>
                        </Link>
                        <Link to="/packages" className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition group border border-gray-100">
                            <span className="font-medium text-sm">Buat Paket Umroh</span>
                            <span className="text-gray-300 group-hover:text-purple-500">&rarr;</span>
                        </Link>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">Sistem Versi 2.0 (ERP Edition)</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;