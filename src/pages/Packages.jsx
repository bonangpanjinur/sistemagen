import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';
// Pastikan path ini sesuai dengan struktur project Anda, biasanya di ../utils/api
import api from '../utils/api'; 

const Packages = () => {
  const { 
    items: packages, 
    loading, 
    error, 
    createItem, 
    updateItem, 
    deleteItem,
    pagination,
    fetchItems 
  } = useCRUD('packages');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  // State untuk menyimpan list kategori dari API
  const [categories, setCategories] = useState([]);

  // State form data dasar paket
  const [formData, setFormData] = useState({});
  
  // State khusus untuk variasi harga (Quad, Triple, Double)
  const [priceVariants, setPriceVariants] = useState({
    Quad: { price: 0, currency: 'IDR' },
    Triple: { price: 0, currency: 'IDR' },
    Double: { price: 0, currency: 'IDR' },
  });

  // Fetch Kategori saat komponen dimuat
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Menggunakan helper api.get jika tersedia, atau fetch bawaan
        // Path sesuai dengan namespace API WordPress yang kita buat
        const response = await api.get('/umh/v1/package-categories'); 
        if (response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  // Definisi Kolom Tabel
  const columns = [
    { 
        header: 'Kategori', 
        accessor: 'category_name', 
        className: 'text-xs text-gray-500 uppercase font-semibold tracking-wide',
        render: (row) => row.category_name || '-'
    },
    { 
        header: 'Nama Paket', 
        accessor: 'package_name', 
        className: 'font-bold text-blue-900 text-sm' 
    },
    { 
        header: 'Keberangkatan', 
        accessor: 'departure_date',
        className: 'text-sm'
    },
    { 
        header: 'Harga (Quad)', 
        accessor: 'prices', 
        render: (row) => {
            // Mencari harga Quad dari array prices yang dikembalikan API
            if (row.prices && Array.isArray(row.prices)) {
                const quad = row.prices.find(p => p.room_type === 'Quad');
                return quad ? formatCurrency(quad.price, quad.currency) : '-';
            }
            return '-';
        }
    },
    { 
        header: 'Kuota', 
        accessor: 'slots_available', 
        render: (row) => (
            <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(((row.slots_filled || 0) / row.slots_available) * 100, 100)}%` }}
                    ></div>
                </div>
                <span className="text-xs text-gray-600">
                    {row.slots_filled || 0}/{row.slots_available}
                </span>
            </div>
        )
    },
    { 
        header: 'Status', 
        accessor: 'status',
        render: (row) => (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
                row.status === 'published' ? 'bg-green-100 text-green-800' : 
                row.status === 'archived' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
                {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Draft'}
            </span>
        )
    },
  ];

  // Handler Buka Modal Create
  const handleCreate = () => {
    setFormData({
        category_id: '',
        package_name: '',
        description: '',
        departure_date: '',
        return_date: '',
        duration: 9,
        slots_available: 45,
        hotel_makkah: '',
        hotel_madinah: '',
        status: 'draft'
    });
    // Reset harga ke default
    setPriceVariants({
        Quad: { price: 30000000, currency: 'IDR' },
        Triple: { price: 32000000, currency: 'IDR' },
        Double: { price: 35000000, currency: 'IDR' },
    });
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Handler Buka Modal Edit
  const handleEdit = (item) => {
    setFormData(item);
    
    // Mapping harga dari API (array) ke State Form (object)
    const newPrices = {
        Quad: { price: 0, currency: 'IDR' },
        Triple: { price: 0, currency: 'IDR' },
        Double: { price: 0, currency: 'IDR' },
    };
    
    if (item.prices && Array.isArray(item.prices)) {
        item.prices.forEach(p => {
            if (newPrices[p.room_type]) {
                newPrices[p.room_type] = { price: p.price, currency: p.currency };
            }
        });
    }
    
    setPriceVariants(newPrices);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handler Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Konversi state prices variant kembali ke format API array
    const pricesPayload = Object.keys(priceVariants).map(type => ({
        room_type: type,
        price: priceVariants[type].price,
        currency: priceVariants[type].currency
    }));

    const payload = {
        ...formData,
        prices: pricesPayload
    };

    let result;
    if (modalMode === 'create') {
      result = await createItem(payload);
    } else {
      result = await updateItem(formData.id, payload);
    }
    
    if (result.success) {
      setIsModalOpen(false);
      // Opsional: fetchItems() dipanggil otomatis oleh hook jika logicnya mendukung, 
      // jika tidak, bisa panggil manual: fetchItems();
    }
  };

  // Helper untuk update state harga nested
  const handlePriceChange = (type, field, value) => {
    setPriceVariants(prev => ({
        ...prev,
        [type]: {
            ...prev[type],
            [field]: value
        }
    }));
  };

  // Render Loading
  if (loading && packages.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Paket Umroh & Haji</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola paket perjalanan, harga, dan kuota.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center transition-colors"
        >
          <span className="mr-2 text-xl font-bold">+</span> Buat Paket Baru
        </button>
      </div>

      {/* Alert Error Global */}
      {error && <Alert type="error" message={error} />}

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CrudTable 
          columns={columns}
          data={packages}
          onEdit={handleEdit}
          onDelete={deleteItem}
          pagination={pagination}
          onPageChange={(page) => fetchItems({ page })}
        />
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Buat Paket Baru' : 'Edit Paket'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Informasi Dasar & Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Paket</label>
                    <select 
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.category_id || ''}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.parent_name ? `${cat.parent_name} > ${cat.name}` : cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
                    <input 
                        type="text" 
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.package_name || ''}
                        onChange={(e) => setFormData({...formData, package_name: e.target.value})}
                        placeholder="Contoh: Paket Milad 2025 (9 Hari)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Keberangkatan</label>
                    <input 
                        type="date" 
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.departure_date || ''}
                        onChange={(e) => setFormData({...formData, departure_date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Kepulangan</label>
                    <input 
                        type="date" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.return_date || ''}
                        onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                    />
                </div>
            </div>

            {/* 2. Harga Paket (Section Khusus) */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Varian Harga & Tipe Kamar</h3>
                
                {['Quad', 'Triple', 'Double'].map((type) => (
                    <div key={type} className="flex items-center gap-3 mb-3 last:mb-0">
                        <div className="w-24 font-medium text-gray-700 text-sm">{type}</div>
                        
                        {/* Mata Uang */}
                        <select
                            className="w-24 rounded-md border-gray-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={priceVariants[type].currency}
                            onChange={(e) => handlePriceChange(type, 'currency', e.target.value)}
                        >
                            <option value="IDR">IDR</option>
                            <option value="USD">USD</option>
                        </select>
                        
                        {/* Input Harga */}
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                                {priceVariants[type].currency === 'IDR' ? 'Rp' : '$'}
                            </span>
                            <input 
                                type="number" 
                                className="block w-full pl-10 rounded-md border-gray-300 border p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                                value={priceVariants[type].price}
                                onChange={(e) => handlePriceChange(type, 'price', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. Fasilitas & Hotel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Makkah</label>
                    <input 
                        type="text" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.hotel_makkah || ''}
                        onChange={(e) => setFormData({...formData, hotel_makkah: e.target.value})}
                        placeholder="Contoh: Hilton Suites"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Madinah</label>
                    <input 
                        type="text" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.hotel_madinah || ''}
                        onChange={(e) => setFormData({...formData, hotel_madinah: e.target.value})}
                        placeholder="Contoh: Ruve Al Madinah"
                    />
                </div>
            </div>

            {/* 4. Kuota & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Hari)</label>
                    <input 
                        type="number" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Seat (Kuota)</label>
                    <input 
                        type="number" 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.slots_available || ''}
                        onChange={(e) => setFormData({...formData, slots_available: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Publikasi</label>
                    <select 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={formData.status || 'draft'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Deskripsi Tambahan */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan</label>
                <textarea 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    rows="3"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Tuliskan detail penerbangan atau catatan khusus..."
                ></textarea>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                >
                    {modalMode === 'create' ? 'Simpan Paket' : 'Update Paket'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Packages;