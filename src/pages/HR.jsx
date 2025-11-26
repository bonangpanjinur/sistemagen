import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Users, DollarSign, Clock, Plus, ArrowLeft } from 'lucide-react';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import CrudTable from '../components/CrudTable';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { formatCurrency, formatDate, formatDateForInput } from '../utils/formatters';

// --- Sub-Page: Data Karyawan (Profiles) ---
const Employees = ({ userCapabilities }) => {
    const { data, loading, pagination, handlePageChange, handleSearch, createItem, updateItem, deleteItem, fetchItems } = useCRUD('hr/profiles');
    const { users, refreshData } = useData(); // Ambil list user dari context untuk dropdown
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [modalMode, setModalMode] = useState('create');

    const columns = [
        { Header: 'Nama', accessor: 'full_name', sortable: true },
        { Header: 'Departemen', accessor: 'department', sortable: true },
        { Header: 'Posisi', accessor: 'position' },
        { Header: 'Gaji Pokok', accessor: 'salary', render: (val) => formatCurrency(val) },
        { Header: 'Status', accessor: 'status', render: (val) => (
            <span className={`px-2 py-1 text-xs rounded ${val === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val}</span>
        )},
        { Header: 'Bergabung', accessor: 'join_date', render: (val) => formatDate(val) },
    ];

    const handleEdit = (item) => {
        setFormData({ ...item, join_date: formatDateForInput(item.join_date) });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        modalMode === 'create' ? await createItem(formData) : await updateItem(formData.id, formData);
        setIsModalOpen(false);
        fetchItems();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Data Karyawan</h2>
                <div className="flex gap-2">
                    <SearchInput onSearch={handleSearch} />
                    <button onClick={() => { setFormData({ status: 'active' }); setModalMode('create'); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-1"/> Tambah</button>
                </div>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEdit} onDelete={deleteItem} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title={modalMode === 'create' ? "Tambah Profil Karyawan" : "Edit Profil"} show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Pilih User (Login)</label>
                        <select className="w-full border p-2 rounded" value={formData.user_id || ''} onChange={e => setFormData({...formData, user_id: e.target.value})} disabled={modalMode === 'edit'} required>
                            <option value="">-- Pilih User --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Departemen</label><input type="text" className="w-full border p-2 rounded" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} required /></div>
                        <div><label className="block text-sm">Posisi</label><input type="text" className="w-full border p-2 rounded" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Gaji Pokok</label><input type="number" className="w-full border p-2 rounded" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} required /></div>
                        <div><label className="block text-sm">Tgl Bergabung</label><input type="date" className="w-full border p-2 rounded" value={formData.join_date || ''} onChange={e => setFormData({...formData, join_date: e.target.value})} required /></div>
                    </div>
                    <div><label className="block text-sm">Info Rekening</label><textarea className="w-full border p-2 rounded" rows="2" value={formData.bank_account_info || ''} onChange={e => setFormData({...formData, bank_account_info: e.target.value})} /></div>
                    <div>
                        <label className="block text-sm">Status</label>
                        <select className="w-full border p-2 rounded" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="active">Aktif</option>
                            <option value="on_leave">Cuti</option>
                            <option value="terminated">Keluar</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

// --- Sub-Page: Absensi (Attendance) ---
const Attendance = () => {
    const { data, loading, pagination, handlePageChange, createItem, updateItem, deleteItem, fetchItems } = useCRUD('hr/attendance');
    const { users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    const columns = [
        { Header: 'Karyawan', accessor: 'full_name' },
        { Header: 'Tanggal', accessor: 'attendance_date', render: (val) => formatDate(val) },
        { Header: 'Check In', accessor: 'check_in', render: (val) => val ? val.split(' ')[1] : '-' },
        { Header: 'Check Out', accessor: 'check_out', render: (val) => val ? val.split(' ')[1] : '-' },
        { Header: 'Status', accessor: 'status', render: (val) => <span className="capitalize badge bg-gray-100 px-2 py-1 rounded">{val}</span> },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Gabungkan tanggal dan jam untuk check_in/out
        const payload = { ...formData };
        if (formData.time_in) payload.check_in = `${formData.attendance_date} ${formData.time_in}:00`;
        if (formData.time_out) payload.check_out = `${formData.attendance_date} ${formData.time_out}:00`;

        formData.id ? await updateItem(formData.id, payload) : await createItem(payload);
        setIsModalOpen(false); fetchItems();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Data Absensi</h2>
                <button onClick={() => { setFormData({ attendance_date: new Date().toISOString().split('T')[0], status: 'present' }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-1"/> Input Absen</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} 
                onEdit={(item) => { 
                    setFormData({ 
                        ...item, 
                        attendance_date: formatDateForInput(item.attendance_date),
                        time_in: item.check_in ? item.check_in.split(' ')[1].substring(0,5) : '',
                        time_out: item.check_out ? item.check_out.split(' ')[1].substring(0,5) : ''
                    }); 
                    setIsModalOpen(true); 
                }} 
            />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title="Input Absensi" show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium">Karyawan</label>
                        <select className="w-full border p-2 rounded" value={formData.user_id || ''} onChange={e => setFormData({...formData, user_id: e.target.value})} required disabled={!!formData.id}>
                            <option value="">-- Pilih Karyawan --</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                        </select>
                    </div>
                    <div><label className="block text-sm">Tanggal</label><input type="date" className="w-full border p-2 rounded" value={formData.attendance_date || ''} onChange={e => setFormData({...formData, attendance_date: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Jam Masuk</label><input type="time" className="w-full border p-2 rounded" value={formData.time_in || ''} onChange={e => setFormData({...formData, time_in: e.target.value})} /></div>
                        <div><label className="block text-sm">Jam Pulang</label><input type="time" className="w-full border p-2 rounded" value={formData.time_out || ''} onChange={e => setFormData({...formData, time_out: e.target.value})} /></div>
                    </div>
                    <div>
                        <label className="block text-sm">Status</label>
                        <select className="w-full border p-2 rounded" value={formData.status || 'present'} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="present">Hadir</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="leave">Cuti/Izin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

// --- Sub-Page: Payroll ---
const Payroll = () => {
    const { data, loading, pagination, handlePageChange, createItem, updateItem, deleteItem, fetchItems } = useCRUD('hr/payrolls');
    const { users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});

    // Auto calculate net pay
    const calculateNet = (base, bonus, deduct) => {
        return (Number(base) || 0) + (Number(bonus) || 0) - (Number(deduct) || 0);
    }

    const handleInputChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        if (['base_salary', 'bonus', 'deductions'].includes(field)) {
            newData.net_pay = calculateNet(newData.base_salary, newData.bonus, newData.deductions);
        }
        setFormData(newData);
    };

    const columns = [
        { Header: 'Karyawan', accessor: 'full_name' },
        { Header: 'Periode', accessor: 'pay_period_start', render: (val, row) => `${formatDate(val)} - ${formatDate(row.pay_period_end)}` },
        { Header: 'Gaji Bersih', accessor: 'net_pay', render: (val) => <span className="font-bold text-green-700">{formatCurrency(val)}</span> },
        { Header: 'Status', accessor: 'status' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Payroll (Penggajian)</h2>
                <button onClick={() => { setFormData({ status: 'pending', base_salary: 0, bonus: 0, deductions: 0, net_pay: 0 }); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={16} className="mr-1"/> Buat Payroll</button>
            </div>
            <CrudTable columns={columns} data={data} loading={loading} onDelete={deleteItem} onEdit={(item) => { setFormData({...item, pay_period_start: formatDateForInput(item.pay_period_start), pay_period_end: formatDateForInput(item.pay_period_end), pay_date: formatDateForInput(item.pay_date)}); setIsModalOpen(true); }} />
            <Pagination pagination={pagination} onPageChange={handlePageChange} />

            <Modal title="Input Payroll" show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={async (e) => { e.preventDefault(); formData.id ? await updateItem(formData.id, formData) : await createItem(formData); setIsModalOpen(false); fetchItems(); }} className="space-y-4">
                    <div><label className="block text-sm font-medium">Karyawan</label><select className="w-full border p-2 rounded" value={formData.user_id || ''} onChange={e => setFormData({...formData, user_id: e.target.value})} required><option value="">-- Pilih --</option>{users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Awal Periode</label><input type="date" className="w-full border p-2 rounded" value={formData.pay_period_start || ''} onChange={e => setFormData({...formData, pay_period_start: e.target.value})} required /></div>
                        <div><label className="block text-sm">Akhir Periode</label><input type="date" className="w-full border p-2 rounded" value={formData.pay_period_end || ''} onChange={e => setFormData({...formData, pay_period_end: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div><label className="block text-sm">Gaji Pokok</label><input type="number" className="w-full border p-2 rounded" value={formData.base_salary || 0} onChange={e => handleInputChange('base_salary', e.target.value)} /></div>
                        <div><label className="block text-sm">Bonus</label><input type="number" className="w-full border p-2 rounded" value={formData.bonus || 0} onChange={e => handleInputChange('bonus', e.target.value)} /></div>
                        <div><label className="block text-sm">Potongan</label><input type="number" className="w-full border p-2 rounded" value={formData.deductions || 0} onChange={e => handleInputChange('deductions', e.target.value)} /></div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded text-right font-bold text-lg">Total: {formatCurrency(formData.net_pay || 0)}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm">Tgl Bayar</label><input type="date" className="w-full border p-2 rounded" value={formData.pay_date || ''} onChange={e => setFormData({...formData, pay_date: e.target.value})} /></div>
                        <div><label className="block text-sm">Status</label><select className="w-full border p-2 rounded" value={formData.status || 'pending'} onChange={e => setFormData({...formData, status: e.target.value})}><option value="pending">Pending</option><option value="paid">Lunas</option></select></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

// --- Main HR Component ---
const HRDashboard = () => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">HR Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/hr/employees" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center mb-2"><Users className="text-blue-600 mr-2" size={24} /><h3 className="font-bold text-gray-800">Data Karyawan</h3></div>
                <p className="text-sm text-gray-500">Kelola database staff, posisi, dan gaji pokok.</p>
            </Link>
            <Link to="/hr/attendance" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center mb-2"><Clock className="text-purple-600 mr-2" size={24} /><h3 className="font-bold text-gray-800">Absensi</h3></div>
                <p className="text-sm text-gray-500">Rekap kehadiran, cuti, dan jam kerja.</p>
            </Link>
            <Link to="/hr/payroll" className="p-6 bg-white shadow rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center mb-2"><DollarSign className="text-green-600 mr-2" size={24} /><h3 className="font-bold text-gray-800">Payroll</h3></div>
                <p className="text-sm text-gray-500">Buat slip gaji dan rekap pembayaran bulanan.</p>
            </Link>
        </div>
    </div>
);

const HR = ({ userCapabilities }) => {
    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link to="/hr" className="text-sm text-blue-600 hover:underline flex items-center"><ArrowLeft size={14} className="mr-1"/> Menu HR</Link>
            </div>
            <Routes>
                <Route path="/" element={<HRDashboard />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/attendance" element={<Attendance />} />
            </Routes>
        </div>
    );
};

export default HR;