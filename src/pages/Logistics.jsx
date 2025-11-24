import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const Logistics = () => {
  // Menggunakan API logistics yang sudah dibuat
  const { 
    items: logisticsData, 
    loading, 
    error, 
    updateItem, 
    fetchItems 
  } = useCRUD('logistics');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  // Definisi Kolom Tabel
  const columns = [
    { 
        header: 'Kode Reg', 
        accessor: 'registration_code',
        className: 'font-mono text-xs text-gray-500'
    },
    { 
        header: 'Nama Jamaah', 
        accessor: 'jamaah_name', // field join dari API
        className: 'font-bold' 
    },
    { 
        header: 'Status Koper', 
        accessor: 'suitcase_status',
        render: (row) => (
            <span className={`px-2 py-1 rounded text-xs ${row.suitcase_status === 'Sudah Ambil' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {row.suitcase_status || 'Belum'}
            </span>
        )
    },
    { header: 'Pengambil', accessor: 'taken_by' },
    { 
        header: 'Dokumen', 
        accessor: 'passport_status',
        render: (row) => (
            <div className="text-xs">
                <div>Paspor: <span className="font-semibold">{row.passport_status}</span></div>
                <div>Meningitis: <span className="font-semibold">{row.meningitis_status}</span></div>
            </div>
        )
    },
  ];

  const handleEdit = (item) => {
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Hanya update, tidak ada create/delete di halaman ini (karena create by trigger jamaah)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateItem(formData.id, formData);
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  if (loading && logisticsData.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Logistik & Dokumen Jamaah</h1>
        <div className="text-sm text-gray-500">
            Monitor status koper dan kelengkapan dokumen.
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CrudTable 
          columns={columns}
          data={logisticsData}
          onEdit={handleEdit}
          // Tidak ada onDelete disini karena logistik terikat jamaah
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Status Logistik"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-gray-700 bg-gray-50 p-2 rounded">{formData.jamaah_name}</h3>
            
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="col-span-2 font-semibold text-blue-600">Perlengkapan</div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status Koper</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.suitcase_status || 'Belum'}
                        onChange={(e) => setFormData({...formData, suitcase_status: e.target.value})}
                    >
                        <option value="Belum">Belum Ambil</option>
                        <option value="Sudah Ambil">Sudah Ambil</option>
                        <option value="Dikirim">Dikirim</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Diambil Oleh</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.taken_by || ''}
                        onChange={(e) => setFormData({...formData, taken_by: e.target.value})}
                        placeholder="Nama Pengambil"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Alamat Pengiriman (Jika Dikirim)</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.delivery_address || ''}
                        onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="col-span-2 font-semibold text-blue-600">Dokumen</div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status Paspor</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.passport_status || 'Belum'}
                        onChange={(e) => setFormData({...formData, passport_status: e.target.value})}
                    >
                        <option value="Belum">Belum Ada</option>
                        <option value="Ada">Ada (Dipegang Jamaah)</option>
                        <option value="Di Kantor">Di Kantor</option>
                        <option value="Di Kedutaan">Di Kedutaan</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Meningitis</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.meningitis_status || 'Belum'}
                        onChange={(e) => setFormData({...formData, meningitis_status: e.target.value})}
                    >
                        <option value="Belum">Belum</option>
                        <option value="Sudah">Sudah</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    Update Status
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Logistics;