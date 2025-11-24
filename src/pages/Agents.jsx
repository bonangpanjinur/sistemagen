import React, { useState } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const Agents = () => {
  const { 
    items: agents, 
    loading, 
    error, 
    createItem, 
    updateItem, 
    deleteItem,
    pagination,
    fetchItems 
  } = useCRUD('agents');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

  const columns = [
    { header: 'Kode Agen', accessor: 'agent_code', className: 'font-mono text-sm font-bold text-blue-600' },
    { header: 'Nama Lengkap', accessor: 'full_name', className: 'font-medium' },
    { header: 'No HP', accessor: 'phone' },
    { header: 'Kota/Alamat', accessor: 'address', render: (row) => row.address ? row.address.substring(0, 20) + '...' : '-' },
    { header: 'Status', accessor: 'status', render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {row.status}
        </span>
    )},
    { header: 'Keterangan', accessor: 'notes' },
  ];

  const handleCreate = () => {
    setFormData({
        agent_code: '',
        full_name: '',
        phone: '',
        address: '',
        status: 'active',
        notes: '',
        ktp_number: '',
        bank_account: ''
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let result;
    if (modalMode === 'create') {
      result = await createItem(formData);
    } else {
      result = await updateItem(formData.id, formData);
    }
    
    if (result.success) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus agen ini? Data jamaah terkait mungkin akan kehilangan referensi agen.')) {
      await deleteItem(id);
    }
  };

  if (loading && agents.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Data Sub Agen</h1>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm"
        >
          + Tambah Agen
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CrudTable 
          columns={columns}
          data={agents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={pagination}
          onPageChange={(page) => fetchItems({ page })}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Agen Baru' : 'Edit Data Agen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Agen (No ID)</label>
                    <input 
                        type="text" 
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.agent_code || ''}
                        onChange={(e) => setFormData({...formData, agent_code: e.target.value})}
                        placeholder="Contoh: 001-AGBTN"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input 
                        type="text" 
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">No HP / WA</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">No KTP</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.ktp_number || ''}
                        onChange={(e) => setFormData({...formData, ktp_number: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    rows="2"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Keterangan (Owner/Freelance)</label>
                    <input 
                        type="text" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
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
                    {modalMode === 'create' ? 'Simpan' : 'Update'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Agents;