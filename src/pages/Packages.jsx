import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';
import api from '../utils/api'; // Import API untuk relasi

const Packages = ({ userCapabilities }) => {
    const {
        data: packages,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem,
        fetchItemById
    } = useCRUD('packages');
    
    const { categories, flights, hotels, refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});
    
    const [packagePrices, setPackagePrices] = useState([{ room_type: 'QUAD', price: '' }]);
    const [packageFlights, setPackageFlights] = useState([]);
    const [packageHotels, setPackageHotels] = useState([]);

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Nama Paket', accessor: 'name', sortable: true },
        { Header: 'Kategori', accessor: 'category_name', sortable: true },
        { Header: 'Harga Dasar', accessor: 'base_price', sortable: true, render: (val) => formatCurrency(val) },
        { Header: 'Durasi (hari)', accessor: 'duration', sortable: true },
        { Header: 'Status', accessor: 'status', sortable: true },
        { Header: 'Tgl Mulai', accessor: 'start_date', sortable: true, render: (val) => formatDate(val) },
    ];

    const openModal = async (item = null) => {
        if (item) {
            const fullItem = await fetchItemById(item.id);
            setCurrentItem(fullItem);
            setFormData({
                ...fullItem,
                start_date: formatDateForInput(fullItem.start_date),
                end_date: formatDateForInput(fullItem.end_date),
            });
            setPackagePrices(fullItem.package_prices.length > 0 ? fullItem.package_prices : [{ room_type: 'QUAD', price: '' }]);
            setPackageFlights((fullItem.package_flights || []).map(f => f.id));
            setPackageHotels((fullItem.package_hotels || []).map(h => h.id));
        } else {
            setCurrentItem(null);
            setFormData({
                name: '', description: '', category_id: '', base_price: '',
                duration: '', status: 'draft', start_date: '', end_date: '',
                capacity: ''
            });
            setPackagePrices([{ room_type: 'QUAD', price: '' }]);
            setPackageFlights([]);
            setPackageHotels([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const saveRelations = async (packageId) => {
        try {
            await api.put(`packages/${packageId}/relations`, {
                package_prices: packagePrices.filter(p => p.price),
                package_flights: packageFlights,
                package_hotels: packageHotels,
            });
        } catch (error) {
            console.error("Gagal menyimpan relasi paket:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            await updateItem(currentItem.id, formData);
            await saveRelations(currentItem.id);
        } else {
            const response = await createItem(formData);
            if (response && response.data && response.data.id) {
                await saveRelations(response.data.id);
            }
        }
        await refreshData('packages');
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('packages');
        }
    };
    
    const handlePriceChange = (index, field, value) => {
        const newPrices = [...packagePrices];
        newPrices[index][field] = value;
        setPackagePrices(newPrices);
    };
    const addPriceRow = () => setPackagePrices([...packagePrices, { room_type: '', price: '' }]);
    const removePriceRow = (index) => setPackagePrices(packagePrices.filter((_, i) => i !== index));

    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_packages') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari paket..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Paket
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={packages}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_packages"
                deleteCapability="manage_packages"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Paket' : 'Tambah Paket'} show={isModalOpen} onClose={closeModal} size="max-w-6xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-medium text-gray-800 px-2">Info Dasar</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Paket</label>
                                <input type="text" value={getFormValue('name')} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                                <select value={getFormValue('category_id')} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="mt-1 block w-full" required>
                                    <option value="">Pilih Kategori</option>
                                    {(categories || []).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                    <option value="draft">Draft</option>
                                    <option value="publish">Publish</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Harga Dasar (IDR)</label>
                                <input type="number" value={getFormValue('base_price')} onChange={(e) => setFormData({ ...formData, base_price: e.target.value })} className="mt-1 block w-full" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Durasi (hari)</label>
                                <input type="number" value={getFormValue('duration')} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="mt-1 block w-full" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Kapasitas (Pax)</label>
                                <input type="number" value={getFormValue('capacity')} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="mt-1 block w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tgl Mulai</label>
                                <input type="date" value={getFormValue('start_date')} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="mt-1 block w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tgl Selesai</label>
                                <input type="date" value={getFormValue('end_date')} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="mt-1 block w-full" />
                            </div>
                             <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <textarea rows="3" value={getFormValue('description')} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full"></textarea>
                            </div>
                        </div>
                    </fieldset>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Harga Kamar</legend>
                            {packagePrices.map((price, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <select value={price.room_type} onChange={(e) => handlePriceChange(index, 'room_type', e.target.value)} className="mt-1 block w-1/2">
                                        <option value="QUAD">QUAD</option>
                                        <option value="TRIPLE">TRIPLE</option>
                                        <option value="DOUBLE">DOUBLE</option>
                                    </select>
                                    <input type="number" placeholder="Harga" value={price.price || ''} onChange={(e) => handlePriceChange(index, 'price', e.target.value)} className="mt-1 block w-1/2" />
                                    <button type="button" onClick={() => removePriceRow(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addPriceRow} className="text-sm text-blue-600 hover:text-blue-800">+ Tambah Harga</button>
                        </fieldset>

                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Penerbangan</legend>
                            <select multiple value={packageFlights} onChange={(e) => setPackageFlights(Array.from(e.target.selectedOptions, option => parseInt(option.value, 10)))} className="mt-1 block w-full h-32">
                                {(flights || []).map(f => <option key={f.id} value={f.id}>{f.airline} ({f.flight_number})</option>)}
                            </select>
                            <small className="text-gray-500">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</small>
                        </fieldset>

                        <fieldset className="border p-4 rounded-md lg:col-span-1">
                            <legend className="text-lg font-medium text-gray-800 px-2">Hotel</legend>
                            <select multiple value={packageHotels} onChange={(e) => setPackageHotels(Array.from(e.target.selectedOptions, option => parseInt(option.value, 10)))} className="mt-1 block w-full h-32">
                                {(hotels || []).map(h => <option key={h.id} value={h.id}>{h.name} ({h.city})</option>)}
                            </select>
                            <small className="text-gray-500">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</small>
                        </fieldset>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Paket</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Packages;