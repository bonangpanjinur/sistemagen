import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatDate, formatDateForInput } from '../utils/formatters';

const Tasks = ({ userCapabilities }) => {
    const {
        data: tasks,
        loading,
        pagination,
        handlePageChange,
        handleSearch,
        handleSort,
        sortBy,
        createItem,
        updateItem,
        deleteItem
    } = useCRUD('tasks');
    
    const { users, jamaah, refreshData } = useData();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'ID', accessor: 'id', sortable: true },
        { Header: 'Tugas', accessor: 'title', sortable: true },
        { Header: 'Ditugaskan Ke', accessor: 'assignee_name', sortable: true }, // Asumsi ada JOIN
        { Header: 'Terkait Jamaah', accessor: 'jamaah_name', sortable: true }, // Asumsi ada JOIN
        { Header: 'Batas Waktu', accessor: 'due_date', sortable: true, render: (val) => formatDate(val) },
        { Header: 'Status', accessor: 'status', sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'completed' ? 'bg-green-100 text-green-800' :
                    val === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    val === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {val}
                </span>
            )
        },
    ];

    const openModal = (item = null) => {
        setCurrentItem(item);
        const defaultData = {
            title: '', description: '', assigned_to_user_id: '',
            jamaah_id: '', due_date: '', status: 'pending', priority: 'medium'
        };
        
        setFormData(item ? {
            ...defaultData, ...item,
            due_date: formatDateForInput(item.due_date),
        } : defaultData);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentItem) {
            await updateItem(currentItem.id, formData);
        } else {
            await createItem(formData);
        }
        await refreshData('tasks');
        closeModal();
    };

    const handleDelete = async (item) => {
        if (true) { // Hapus window.confirm
            await deleteItem(item.id);
            await refreshData('tasks');
        }
    };

    const getFormValue = (key) => formData[key] || '';
    const canManage = userCapabilities.includes('manage_tasks') || userCapabilities.includes('manage_options');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <SearchInput onSearch={handleSearch} placeholder="Cari tugas..." />
                {canManage && (
                    <button
                        onClick={() => openModal(null)}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-1" />
                        Tambah Tugas
                    </button>
                )}
            </div>

            <CrudTable
                columns={columns}
                data={tasks}
                loading={loading}
                sortBy={sortBy}
                onSort={(field) => handleSort(field)}
                onEdit={canManage ? openModal : null}
                onDelete={canManage ? handleDelete : null}
                userCapabilities={userCapabilities}
                editCapability="manage_tasks"
                deleteCapability="manage_tasks"
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={currentItem ? 'Edit Tugas' : 'Tambah Tugas'} show={isModalOpen} onClose={closeModal} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Tugas</label>
                        <input type="text" value={getFormValue('title')} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1 block w-full" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tugaskan Ke (Staff)</label>
                            <select value={getFormValue('assigned_to_user_id')} onChange={(e) => setFormData({ ...formData, assigned_to_user_id: e.target.value })} className="mt-1 block w-full">
                                <option value="">Pilih Staff</option>
                                {(users || []).map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Terkait Jamaah</label>
                            <select value={getFormValue('jamaah_id')} onChange={(e) => setFormData({ ...formData, jamaah_id: e.target.value })} className="mt-1 block w-full">
                                <option value="">Pilih Jamaah (Opsional)</option>
                                {(jamaah || []).map(j => <option key={j.id} value={j.id}>{j.full_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batas Waktu</label>
                            <input type="date" value={getFormValue('due_date')} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="mt-1 block w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={getFormValue('status')} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="mt-1 block w-full">
                                <option value="pending">Pending</option>
                                <option value="in_progress">Proses</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Prioritas</label>
                            <select value={getFormValue('priority')} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="mt-1 block w-full">
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                        <textarea rows="3" value={getFormValue('description')} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan Tugas</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;