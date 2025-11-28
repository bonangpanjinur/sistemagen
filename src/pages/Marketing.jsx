import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import CrudTable from '../components/CrudTable';

const Marketing = () => {
    // Kita gunakan CrudTable untuk kemudahan, karena ini master data leads
    const columns = [
        { header: 'Nama Prospek', accessor: 'name' },
        { header: 'No. WA', accessor: 'phone' },
        { header: 'Sumber', accessor: 'source', render: (val) => <span className="bg-gray-200 px-2 py-1 rounded text-xs">{val}</span> },
        { 
            header: 'Minat', 
            accessor: 'interest_level', 
            render: (val) => {
                const colors = { hot: 'bg-red-100 text-red-800', warm: 'bg-yellow-100 text-yellow-800', cold: 'bg-blue-100 text-blue-800' };
                return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[val]}`}>{val}</span>;
            }
        },
        { header: 'Status', accessor: 'status' },
        { header: 'Follow Up', accessor: 'next_follow_up' },
    ];

    const fields = [
        { name: 'name', label: 'Nama Calon Jemaah', type: 'text', required: true },
        { name: 'phone', label: 'No. WhatsApp', type: 'text', required: true },
        { name: 'source', label: 'Sumber Info', type: 'select', options: [{value:'ig', label:'Instagram'}, {value:'fb', label:'Facebook Ads'}, {value:'wa', label:'WhatsApp'}, {value:'walkin', label:'Datang Langsung'}] },
        { name: 'interest_level', label: 'Tingkat Minat', type: 'select', options: [{value:'cold', label:'Cold (Tanya-tanya)'}, {value:'warm', label:'Warm (Tertarik)'}, {value:'hot', label:'Hot (Siap Bayar)'}] },
        { name: 'status', label: 'Status', type: 'select', options: [{value:'new', label:'Baru'}, {value:'contacted', label:'Sudah Dihubungi'}, {value:'converted', label:'Closing (Booking)'}, {value:'lost', label:'Batal'}] },
        { name: 'next_follow_up', label: 'Jadwal Follow Up', type: 'date' },
        { name: 'notes', label: 'Catatan', type: 'textarea' },
    ];

    return (
        <Layout title="Marketing Pipeline (Leads)">
            <div className="bg-white p-6 rounded shadow">
                <div className="mb-4 bg-purple-50 p-4 border-l-4 border-purple-500 text-purple-800 text-sm">
                    <p><strong>Database Calon Jemaah:</strong> Catat semua orang yang menghubungi travel Anda di sini. Jangan biarkan prospek hilang tanpa di-follow up.</p>
                </div>
                <CrudTable 
                    endpoint="/umh/v1/marketing/leads"
                    columns={columns}
                    formFields={fields}
                    title="Daftar Prospek"
                />
            </div>
        </Layout>
    );
};

export default Marketing;