import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import api from '../utils/api';
import { Users, DollarSign, Briefcase, CheckCircle, Megaphone } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
    const { user } = useData();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Menggunakan endpoint stats/totals yang sudah kita perbaiki sebelumnya
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

    if (loading) return <Layout><div className="p-8 text-center">Memuat Dashboard...</div></Layout>;

    return (
        <Layout title={`Selamat Datang, ${user?.name || 'Admin'}`}>
            {/* WIDGET UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Total Jemaah</p>
                            <h3 className="text-2xl font-bold">{stats?.total_jamaah || 0}</h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Pemasukan</p>
                            <h3 className="text-xl font-bold">{formatCurrency(stats?.total_revenue || 0)}</h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Paket Aktif</p>
                            <h3 className="text-2xl font-bold">{stats?.total_packages || 0}</h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <Briefcase size={24} />
                        </div>
                    </div>
                </div>

                {/* WIDGET TAMBAHAN: MARKETING */}
                <div className="bg-white p-4 rounded shadow border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">Leads/Prospek</p>
                            <h3 className="text-2xl font-bold text-orange-600">Lihat</h3>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                            <Megaphone size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* BARIS KEDUA: JADWAL & TUGAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tabel Keberangkatan Terdekat */}
                <div className="bg-white rounded shadow p-4">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Briefcase size={18}/> Keberangkatan Terdekat
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                    <th className="py-2 px-3">Tanggal</th>
                                    <th className="py-2 px-3">Paket</th>
                                    <th className="py-2 px-3">Kursi Terisi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {stats?.upcoming_departures && stats.upcoming_departures.length > 0 ? (
                                    stats.upcoming_departures.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="py-2 px-3 font-medium">{formatDate(row.departure_date)}</td>
                                            <td className="py-2 px-3">{row.package_name}</td>
                                            <td className="py-2 px-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.available_seats < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    {row.slots_filled} / {row.total_seats}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-gray-400">Belum ada jadwal keberangkatan.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Links / Status Sistem */}
                <div className="bg-white rounded shadow p-4">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircle size={18}/> Status Sistem
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <span className="text-gray-600">Versi Sistem</span>
                            <span className="font-mono font-bold">v1.0.0 Hybrid</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <span className="text-gray-600">Database</span>
                            <span className="text-green-600 font-bold text-sm">Terhubung</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                            <span className="text-gray-600">User Login</span>
                            <span className="text-blue-600 font-bold text-sm">{user?.name} ({user?.role})</span>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Dashboard;