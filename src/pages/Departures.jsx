import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import api from '../utils/api';
import { CalendarIcon, UserGroupIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Departures = () => {
    // State untuk Data Dropdown
    const [packages, setPackages] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [airlines, setAirlines] = useState([]);

    // Load Data Referensi saat halaman dibuka
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const pkgRes = await api.get('/umh/v1/packages'); // Pastikan API packages sudah ada
                const hotelRes = await api.get('/umh/v1/hotels');
                const airRes = await api.get('/umh/v1/masters/airlines');

                if(pkgRes.data) setPackages(pkgRes.data.map(p => ({ value: p.id, label: p.name })));
                if(hotelRes.data) setHotels(hotelRes.data.map(h => ({ value: h.id, label: `${h.name} (${h.city})` })));
                if(airRes.data) setAirlines(airRes.data.map(a => ({ value: a.id, label: `${a.name} (${a.code})` })));
            } catch (err) {
                console.error("Gagal load referensi", err);
            }
        };
        loadReferences();
    }, []);

    const formatPrice = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    // Konfigurasi Kolom
    const columns = [
        { 
            header: 'Tanggal', 
            accessor: 'departure_date',
            render: (val, row) => (
                <div>
                    <div className="font-bold flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-gray-500"/> {val}
                    </div>
                    <div className="text-xs text-gray-500">Pulang: {row.return_date}</div>
                </div>
            )
        },
        { header: 'Paket', accessor: 'package_name' },
        { 
            header: 'Hotel & Maskapai', 
            accessor: 'id', // Dummy accessor
            render: (_, row) => (
                <div className="text-xs">
                    <div className="flex items-center gap-1"><BuildingOfficeIcon className="h-3 w-3"/> Mk: {row.hotel_makkah_name || '-'}</div>
                    <div className="flex items-center gap-1"><BuildingOfficeIcon className="h-3 w-3"/> Md: {row.hotel_madinah_name || '-'}</div>
                    <div className="mt-1 font-semibold text-blue-600">{row.airline_name || '-'}</div>
                </div>
            )
        },
        { 
            header: 'Harga (Quad)', 
            accessor: 'price_quad', 
            render: (val) => <span className="font-bold text-green-700">{formatPrice(val)}</span> 
        },
        { 
            header: 'Seat', 
            accessor: 'available_seats',
            render: (val, row) => (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${val > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {val} / {row.quota}
                    </span>
                </div>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (val) => val === 'open' 
                ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs uppercase">Open</span>
                : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs uppercase">{val}</span>
        }
    ];

    // Konfigurasi Form
    const formFields = [
        { 
            name: 'package_id', 
            label: 'Pilih Paket Dasar', 
            type: 'select', 
            options: packages,
            required: true 
        },
        { 
            name: 'departure_date', 
            label: 'Tanggal Berangkat', 
            type: 'date', 
            required: true 
        },
        { 
            name: 'return_date', 
            label: 'Tanggal Pulang', 
            type: 'date', 
            required: true 
        },
        { 
            name: 'airline_id', 
            label: 'Maskapai Penerbangan', 
            type: 'select', 
            options: airlines 
        },
        { 
            name: 'hotel_makkah_id', 
            label: 'Hotel Makkah', 
            type: 'select', 
            options: hotels.filter(h => h.label.includes('Makkah')) // Filter sederhana
        },
        { 
            name: 'hotel_madinah_id', 
            label: 'Hotel Madinah', 
            type: 'select', 
            options: hotels.filter(h => h.label.includes('Madinah')) 
        },
        { 
            name: 'quota', 
            label: 'Total Kuota Seat', 
            type: 'number', 
            defaultValue: 45 
        },
        { 
            name: 'price_quad', 
            label: 'Harga Quad (Sekamar Ber-4)', 
            type: 'number', 
            placeholder: 'Contoh: 28500000',
            required: true
        },
        { 
            name: 'price_triple', 
            label: 'Harga Triple (Sekamar Ber-3)', 
            type: 'number', 
            placeholder: 'Contoh: 30500000'
        },
        { 
            name: 'price_double', 
            label: 'Harga Double (Sekamar Ber-2)', 
            type: 'number', 
            placeholder: 'Contoh: 32500000'
        },
        { 
            name: 'status', 
            label: 'Status Penjualan', 
            type: 'select', 
            options: [
                { value: 'open', label: 'Open (Buka)' },
                { value: 'closed', label: 'Closed (Tutup)' },
                { value: 'departed', label: 'Departed (Sudah Berangkat)' },
            ] 
        }
    ];

    return (
        <Layout title="Jadwal Keberangkatan (Inventory)">
             <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6 flex items-start gap-4 bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                    <UserGroupIcon className="h-6 w-6 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Manajemen Inventory</p>
                        <p>Di sini Anda mengatur tanggal keberangkatan spesifik. Pastikan Anda sudah membuat <strong>Master Paket</strong>, <strong>Hotel</strong>, dan <strong>Maskapai</strong> terlebih dahulu agar muncul di pilihan.</p>
                    </div>
                </div>

                <CrudTable
                    endpoint="/umh/v1/departures"
                    columns={columns}
                    formFields={formFields}
                    title="Daftar Keberangkatan"
                />
            </div>
        </Layout>
    );
};

export default Departures;