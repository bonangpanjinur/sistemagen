import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { 
    ClipboardDocumentListIcon, PlusIcon, EyeIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/umh/v1/bookings');
            setBookings(res.data);
        } catch (err) {
            console.error("Gagal load data", err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Helper Status Badge
    const renderPaymentStatus = (status) => {
        const classes = {
            unpaid: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overpaid: 'bg-purple-100 text-purple-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${classes[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <Layout title="Data Transaksi Booking">
            <div className="bg-white rounded shadow p-6">
                
                {/* Header Action */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                        <ClipboardDocumentListIcon className="h-6 w-6" />
                        <span>Daftar seluruh transaksi masuk.</span>
                    </div>
                    <Link to="/bookings/create" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5" /> Buat Booking Baru
                    </Link>
                </div>

                {/* Table Data */}
                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 text-left text-gray-600 border-b">
                                    <th className="p-3">Kode Booking</th>
                                    <th className="p-3">Tgl Booking</th>
                                    <th className="p-3">Kontak (Ketua)</th>
                                    <th className="p-3">Paket & Keberangkatan</th>
                                    <th className="p-3 text-center">Jemaah</th>
                                    <th className="p-3 text-right">Total Tagihan</th>
                                    <th className="p-3 text-right">Sudah Bayar</th>
                                    <th className="p-3 text-center">Status Bayar</th>
                                    <th className="p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan="9" className="p-6 text-center text-gray-500">Belum ada data transaksi.</td></tr>
                                ) : (
                                    bookings.map(item => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-mono font-bold text-blue-600">{item.booking_code}</td>
                                            <td className="p-3">{formatDate(item.booking_date)}</td>
                                            <td className="p-3">
                                                <div className="font-bold">{item.contact_name}</div>
                                                <div className="text-xs text-gray-500">{item.contact_phone}</div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">{item.package_name}</div>
                                                <div className="text-xs text-gray-500">Tgl: {formatDate(item.departure_date)}</div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{item.total_pax} Pax</span>
                                            </td>
                                            <td className="p-3 text-right font-medium">{formatPrice(item.total_price)}</td>
                                            <td className="p-3 text-right text-gray-600">{formatPrice(item.total_paid)}</td>
                                            <td className="p-3 text-center">{renderPaymentStatus(item.payment_status)}</td>
                                            <td className="p-3 text-center">
                                                <button className="text-blue-600 hover:text-blue-800" title="Lihat Detail">
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Bookings;