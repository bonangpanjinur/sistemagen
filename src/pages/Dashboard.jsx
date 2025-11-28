import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { 
    BanknotesIcon, UserGroupIcon, CalendarIcon, 
    ClipboardDocumentCheckIcon, ArrowTrendingUpIcon, 
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/umh/v1/stats/dashboard');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) return <Layout title="Dashboard"><Spinner /></Layout>;
    if (!data) return <Layout title="Dashboard"><div className="p-6">Gagal memuat data.</div></Layout>;

    return (
        <Layout title="Dashboard Eksekutif">
            <div className="space-y-6">
                
                {/* 1. STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Omset */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Penjualan</p>
                                <h3 className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(data.revenue.total_sales)}</h3>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                <ArrowTrendingUpIcon className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>

                    {/* Uang Masuk */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Uang Diterima (Cash In)</p>
                                <h3 className="text-xl font-bold text-green-700 mt-1">{formatCurrency(data.revenue.cash_in)}</h3>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full text-green-600">
                                <BanknotesIcon className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>

                    {/* Piutang */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Sisa Tagihan (Piutang)</p>
                                <h3 className="text-xl font-bold text-red-600 mt-1">{formatCurrency(data.revenue.receivable)}</h3>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full text-red-600">
                                <ExclamationTriangleIcon className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>

                    {/* Total Jemaah */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Database Jemaah</p>
                                <h3 className="text-xl font-bold text-purple-700 mt-1">{data.stats.total_jamaah} Orang</h3>
                                <p className="text-xs text-gray-400 mt-1">{data.stats.active_bookings} Booking Aktif</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                <UserGroupIcon className="h-5 w-5"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 2. NEXT DEPARTURE (KEBERANGKATAN TERDEKAT) */}
                    <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-500"/> Keberangkatan Terdekat
                        </h3>
                        {data.next_departure ? (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="text-2xl font-bold text-blue-800">{formatDate(data.next_departure.departure_date)}</p>
                                    <p className="text-sm text-blue-600 mt-1">{data.next_departure.package_name}</p>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Terisi: <strong>{data.next_departure.booked_count} Pax</strong></span>
                                        <span>Kuota: <strong>{data.next_departure.quota} Pax</strong></span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div 
                                            className="bg-blue-500 h-4 rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min((data.next_departure.booked_count / data.next_departure.quota) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div>
                                    <Link to={`/rooming`} className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-50">
                                        Atur Rooming
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded border-2 border-dashed">
                                Tidak ada jadwal keberangkatan mendatang.
                            </div>
                        )}

                        {/* SIMPLE CHART (CSS ONLY) */}
                        <div className="mt-8">
                            <h4 className="font-bold text-sm text-gray-600 mb-4">Tren Penjualan (6 Bulan Terakhir)</h4>
                            <div className="flex items-end gap-2 h-40 border-b pb-2">
                                {data.chart.series.map((val, idx) => {
                                    const maxVal = Math.max(...data.chart.series) || 1;
                                    const height = Math.round((val / maxVal) * 100);
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center group">
                                            <div 
                                                className="w-full bg-blue-400 rounded-t hover:bg-blue-600 transition-all relative" 
                                                style={{ height: `${height}%` }}
                                            >
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatCurrency(val)}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{data.chart.labels[idx]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 3. URGENT TASKS (SIDEBAR) */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-orange-500"/> Tugas Prioritas (7 Hari)
                        </h3>
                        <div className="space-y-3">
                            {data.pending_tasks.length > 0 ? (
                                data.pending_tasks.map(task => (
                                    <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 bg-white">
                                        <div className="text-sm font-bold text-gray-800">{task.task_name}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                            <span>{task.package_name}</span>
                                            <span className="text-red-600 font-bold">Due: {task.due_date}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">Tidak ada tugas mendesak. Kerja bagus!</p>
                            )}
                            
                            <Link to="/tasks" className="block text-center text-sm text-blue-600 font-medium mt-4 hover:underline">
                                Lihat Semua Tugas &rarr;
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;