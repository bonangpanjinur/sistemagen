import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('locations');

    // Konfigurasi Kolom Tabel Lokasi
    const locationColumns = [
        { header: 'Nama Lokasi', accessor: 'name' },
        { header: 'Kode (IATA)', accessor: 'code' },
        { header: 'Tipe', accessor: 'type', render: (val) => val === 'airport' ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Bandara</span> : <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Kota</span> },
        { header: 'Negara', accessor: 'country' },
    ];

    // Form Fields Lokasi
    const locationFields = [
        { name: 'name', label: 'Nama Lokasi', type: 'text', required: true },
        { name: 'code', label: 'Kode (Misal: CGK/JED)', type: 'text' },
        { name: 'type', label: 'Tipe', type: 'select', options: [{ value: 'city', label: 'Kota' }, { value: 'airport', label: 'Bandara' }] },
        { name: 'country', label: 'Negara', type: 'text', defaultValue: 'Saudi Arabia' },
    ];

    // Konfigurasi Kolom Tabel Maskapai
    const airlineColumns = [
        { header: 'Nama Maskapai', accessor: 'name' },
        { header: 'Kode', accessor: 'code' },
        { header: 'Logo', accessor: 'logo_url', render: (url) => url ? <img src={url} alt="logo" className="h-8" /> : '-' },
    ];

    // Form Fields Maskapai
    const airlineFields = [
        { name: 'name', label: 'Nama Maskapai', type: 'text', required: true },
        { name: 'code', label: 'Kode (Misal: SV/GA)', type: 'text' },
        { name: 'logo_url', label: 'URL Logo', type: 'text' },
    ];

    return (
        <Layout title="Master Data Umum">
            <div className="bg-white rounded-lg shadow">
                {/* Tabs Header */}
                <div className="flex border-b">
                    <button 
                        className={`px-6 py-4 font-medium ${activeTab === 'locations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('locations')}
                    >
                        Lokasi & Bandara
                    </button>
                    <button 
                        className={`px-6 py-4 font-medium ${activeTab === 'airlines' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('airlines')}
                    >
                        Maskapai Penerbangan
                    </button>
                </div>

                {/* Tabs Content */}
                <div className="p-6">
                    {activeTab === 'locations' && (
                        <div>
                            <div className="mb-4 bg-blue-50 p-4 rounded text-sm text-blue-800">
                                💡 Masukkan data Bandara (CGK, JED, MED) dan Kota (Makkah, Madinah) di sini untuk digunakan pada Jadwal Keberangkatan.
                            </div>
                            <CrudTable
                                endpoint="/umh/v1/masters/locations"
                                columns={locationColumns}
                                formFields={locationFields}
                                title="Data Lokasi"
                            />
                        </div>
                    )}

                    {activeTab === 'airlines' && (
                        <div>
                             <div className="mb-4 bg-green-50 p-4 rounded text-sm text-green-800">
                                💡 Data Maskapai (Garuda, Saudia, Qatar) akan muncul di detail paket dan itinerary.
                            </div>
                            <CrudTable
                                endpoint="/umh/v1/masters/airlines"
                                columns={airlineColumns}
                                formFields={airlineFields}
                                title="Data Maskapai"
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Masters;