import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const PackageCategories = () => {
  const { 
    items: categories, 
    loading, 
    error, 
    createItem, 
    updateItem, 
    deleteItem,
    fetchItems 
  } = useCRUD('package-categories');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({});

  // Filter hanya kategori yang parent_id = 0 untuk dijadikan opsi Induk
  const parentOptions = categories.filter(c => c.parent_id === '0' || c.parent_id === 0);

  const columns = [
    { header: 'Nama Kategori', accessor: 'name', className: 'font-bold' },
    { 
        header: 'Induk (Parent)', 
        accessor: 'parent_name',
        render: (row) => row.parent_name ? (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {row.parent_name}
            </span>
        ) : (
            <span className="text-gray-400 italic">Main Category</span>
        )
    },
    { header: 'Deskripsi', accessor: 'description' },
  ];

  const handleCreate = () => {
    setFormData({
        name: '',
        slug: '',
        parent_id: '0',
        description: ''
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Auto generate slug simple
    const payload = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    };

    let result;
    if (modalMode === 'create') {
      result = await createItem(payload);
    } else {
      result = await updateItem(formData.id, payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      fetchItems();
    }
  };

  if (loading && categories.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kategori Paket</h1>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + Kategori Baru
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CrudTable 
          columns={columns}
          data={categories}
          onEdit={handleEdit}
          onDelete={deleteItem}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                <input 
                    type="text" 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Paket Milad"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Induk Kategori</label>
                <select 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    value={formData.parent_id || '0'}
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value})}
                >
                    <option value="0">-- Jadikan Kategori Utama --</option>
                    {parentOptions.map(cat => (
                        // Jangan tampilkan diri sendiri sebagai parent saat edit
                        formData.id !== cat.id && (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        )
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih induk jika ini adalah sub-kategori.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    rows="3"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
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
                    Simpan
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default PackageCategories; 