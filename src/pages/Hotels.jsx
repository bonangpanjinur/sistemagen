import React from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import { StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';

const Hotels = () => {
    
    // Helper untuk render bintang
    const renderStars = (count) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(parseInt(count))].map((_, i) => (
                    <StarIcon key={i} className="h-4 w-4" />
                ))}
            </div>
        );
    };

    // Konfigurasi Kolom Tabel
    const columns = [
        { 
            header: 'Nama Hotel', 
            accessor: 'name',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    {row.map_url && (
                        <a href={row.map_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center hover:underline">
                            <MapPinIcon className="h-3 w-3 mr-1" /> Lihat Peta
                        </a>
                    )}
                </div>
            )
        },
        { 
            header: 'Kota', 
            accessor: 'city',
            render: (val) => val === 'Makkah' 
                ? <span className="bg-black text-white px-2 py-1 rounded text-xs">Makkah</span> 
                : <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Madinah</span>
        },
        { header: 'Bintang', accessor: 'star_rating', render: (val) => renderStars(val) },
        { 
            header: 'Jarak ke Haram', 
            accessor: 'distance_to_haram', 
            render: (val) => val > 0 ? `${val} meter` : '-' 
        },
    ];

    // Konfigurasi Form Input
    const formFields = [
        { 
            name: 'name', 
            label: 'Nama Hotel', 
            type: 'text', 
            required: true,
            placeholder: 'Contoh: Anjum Hotel Makkah' 
        },
        { 
            name: 'city', 
            label: 'Lokasi Kota', 
            type: 'select', 
            options: [
                { value: 'Makkah', label: 'Makkah' },
                { value: 'Madinah', label: 'Madinah' },
                { value: 'Jeddah', label: 'Jeddah' },
                { value: 'Lainnya', label: 'Lainnya' },
            ],
            required: true
        },
        { 
            name: 'star_rating', 
            label: 'Rating Bintang', 
            type: 'select', 
            options: [
                { value: '5', label: '⭐⭐⭐⭐⭐ (5 Bintang)' },
                { value: '4', label: '⭐⭐⭐⭐ (4 Bintang)' },
                { value: '3', label: '⭐⭐⭐ (3 Bintang)' },
            ]
        },
        { 
            name: 'distance_to_haram', 
            label: 'Jarak ke Masjid (Meter)', 
            type: 'number',
            placeholder: '0'
        },
        { 
            name: 'map_url', 
            label: 'Link Google Maps (Opsional)', 
            type: 'text',
            placeholder: 'https://maps.google.com/...'
        },
    ];

    return (
        <Layout title="Data Hotel Rekanan">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-800">
                    <p className="font-bold">Tips:</p>
                    <p>Masukkan data hotel dengan lengkap (termasuk jarak). Data ini akan otomatis muncul saat Anda membuat Paket Umrah atau Jadwal Keberangkatan.</p>
                </div>

                <CrudTable
                    endpoint="/umh/v1/hotels"
                    columns={columns}
                    formFields={formFields}
                    title="Daftar Hotel"
                />
            </div>
        </Layout>
    );
};

export default Hotels;