import React, { useState, useEffect } from 'react';
import { createRoot } from '@wordpress/element';

// ==========================================
// 1. UTILITIES & COMPONENTS
// ==========================================

/**
 * Wrapper API Fetch (Otomatis menangani Nonce & URL)
 */
const apiFetch = async (path, options = {}) => {
    const { root, nonce } = window.wpApiSettings || { root: '/wp-json/', nonce: '' };
    const defaultHeaders = { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce };
    
    const mergedOptions = {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
    };

    const urlPath = path.startsWith('/') ? path.substring(1) : path;
    const response = await fetch(`${root}${urlPath}`, mergedOptions);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.data?.message || 'Terjadi kesalahan server.');
    }

    if (options.method === 'DELETE' || response.status === 204) return { success: true };
    return await response.json();
};

/**
 * Komponen Modal Konfirmasi
 */
const Modal = ({ show, title, message, onConfirm, onCancel }) => {
    if (!show) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                backgroundColor: 'white', padding: '25px', borderRadius: '8px',
                minWidth: '350px', maxWidth: '500px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginTop: 0 }}>{title}</h3>
                <p>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button onClick={onCancel} className="button">Batal</button>
                    <button onClick={onConfirm} className="button button-primary button-hero" style={{ backgroundColor: '#d63638' }}>Ya, Hapus</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Komponen Notifikasi Sederhana
 */
const Notification = ({ message, type }) => {
    if (!message) return null;
    const style = {
        padding: '10px 15px', marginBottom: '20px', borderRadius: '4px',
        backgroundColor: type === 'error' ? '#f8d7da' : (type === 'success' ? '#d4edda' : '#fff3cd'),
        color: type === 'error' ? '#721c24' : (type === 'success' ? '#155724' : '#856404'),
        border: `1px solid ${type === 'error' ? '#f5c6cb' : (type === 'success' ? '#c3e6cb' : '#ffeeba')}`
    };
    return <div style={style}>{message}</div>;
};

// ==========================================
// 2. MODULE MANAGERS
// ==========================================

// --- KATEGORI MANAGER ---
const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({ name: '', parent_id: '0' });
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = async () => {
        try { setLoading(true); const res = await apiFetch('umroh/v1/categories'); setCategories(res.data); } 
        catch (e) { setMsg({ text: e.message, type: 'error' }); } 
        finally { setLoading(false); }
    };
    useEffect(() => { loadData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg({});
        try {
            await apiFetch('umroh/v1/categories', { method: 'POST', body: JSON.stringify(formData) });
            setMsg({ text: 'Kategori berhasil ditambah!', type: 'success' });
            setFormData({ name: '', parent_id: '0' });
            loadData();
        } catch (e) { setMsg({ text: e.message, type: 'error' }); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await apiFetch(`umroh/v1/categories/${deleteTarget.id}`, { method: 'DELETE' });
            setMsg({ text: res.message || 'Kategori dihapus.', type: 'success' });
            loadData();
        } catch (e) { setMsg({ text: e.message, type: 'error' }); }
        setDeleteTarget(null);
    };

    const renderOptions = (cats, level = 0) => cats.flatMap(c => [
        <option key={c.id} value={c.id}>{'— '.repeat(level) + c.name}</option>,
        ...renderOptions(c.children || [], level + 1)
    ]);

    const renderRows = (cats, level = 0) => cats.map(c => (
        <React.Fragment key={c.id}>
            <tr>
                <td style={{ paddingLeft: `${level * 20 + 10}px` }}>{level > 0 ? '↳ ' : ''}<strong>{c.name}</strong></td>
                <td><button className="button-link delete" onClick={() => setDeleteTarget(c)}>Hapus</button></td>
            </tr>
            {c.children && renderRows(c.children, level + 1)}
        </React.Fragment>
    ));

    return (
        <div className="tab-content">
            <h2>Manajemen Kategori & Sub-Kategori</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!deleteTarget} title="Hapus Kategori" message={`Anda yakin ingin menghapus "${deleteTarget?.name}"? Penghapusan akan gagal jika kategori ini digunakan oleh Paket lain atau memiliki Sub-Kategori.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px', padding: '15px', background: '#fff', border: '1px solid #ccd0d4' }}>
                    <h3>Tambah Kategori Baru</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontWeight: 'bold' }}>Nama Kategori</label>
                            <input type="text" className="widefat" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontWeight: 'bold' }}>Induk Kategori (Sub-Kategori)</label>
                            <select className="widefat" value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})}>
                                <option value="0">Tidak Ada (Top Level)</option>
                                {renderOptions(categories)}
                            </select>
                        </div>
                        <button type="submit" className="button button-primary">Simpan Kategori</button>
                    </form>
                </div>
                <div style={{ flex: '2', minWidth: '300px' }}>
                    <table className="wp-list-table widefat fixed striped">
                        <thead><tr><th>Nama</th><th style={{ width: '80px' }}>Aksi</th></tr></thead>
                        <tbody>{loading ? <tr><td colSpan="2">Memuat data...</td></tr> : renderRows(categories)}</tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- HOTEL MANAGER ---
const HotelManager = () => {
    const [hotels, setHotels] = useState([]);
    const [msg, setMsg] = useState({});
    const [form, setForm] = useState({ name: '', city: 'Makkah', stars: '3', address: '' });
    const [delItem, setDelItem] = useState(null);

    const load = async () => { try { const res = await apiFetch('umroh/v1/hotels'); setHotels(res.data.data); } catch(e){ setMsg({text:e.message, type:'error'}); } };
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try { await apiFetch('umroh/v1/hotels', { method: 'POST', body: JSON.stringify(form) }); setMsg({text:'Hotel disimpan', type:'success'}); setForm({name:'', city:'Makkah', stars:'3', address:''}); load(); } 
        catch (e) { setMsg({text:e.message, type:'error'}); }
    };
    const remove = async () => {
        try { 
            const res = await apiFetch(`umroh/v1/hotels/${delItem.id}`, { method: 'DELETE' }); 
            load(); setDelItem(null); 
            setMsg({text: res.message || 'Hotel dihapus.', type:'success'}); 
        } catch(e) { setMsg({text:e.message, type:'error'}); setDelItem(null); }
    };

    return (
        <div className="tab-content">
            <h2>Manajemen Data Hotel</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!delItem} title="Hapus Hotel" message={`Anda yakin ingin menghapus hotel "${delItem?.name}"? Penghapusan akan gagal jika hotel ini digunakan oleh Paket manapun.`} onConfirm={remove} onCancel={() => setDelItem(null)} />
            
            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3>Input Data Hotel Baru</h3>
                <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Nama Hotel</label><input type="text" className="widefat" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Kota</label>
                        <select className="widefat" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}>
                            <option value="Makkah">Makkah</option><option value="Madinah">Madinah</option><option value="Jeddah">Jeddah</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontWeight: 'bold' }}>Bintang</label>
                        <select className="widefat" value={form.stars} onChange={e=>setForm({...form, stars:e.target.value})}>
                            <option value="3">3 ⭐</option><option value="4">4 ⭐</option><option value="5">5 ⭐</option>
                        </select>
                    </div>
                    <button className="button button-primary" style={{ height: '32px' }}>+ Tambah</button>
                </form>
            </div>

            <table className="wp-list-table widefat fixed striped">
                <thead><tr><th>Nama Hotel</th><th>Kota</th><th>Bintang</th><th style={{width: '80px'}}>Aksi</th></tr></thead>
                <tbody>
                    {hotels.map(h => (
                        <tr key={h.id}><td>{h.name}</td><td>{h.city}</td><td>{'⭐'.repeat(h.stars)}</td>
                        <td><button className="button-link delete" onClick={()=>setDelItem(h)}>Hapus</button></td></tr>
                    ))}
                    {hotels.length === 0 && <tr><td colSpan="4">Belum ada data Hotel.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- FLIGHT MANAGER ---
const FlightManager = () => {
    const [flights, setFlights] = useState([]);
    const [msg, setMsg] = useState({});
    const [form, setForm] = useState({ airline_name: '', flight_number: '', origin: 'CGK', destination: 'JED' });
    const [delItem, setDelItem] = useState(null);

    const load = async () => { try { const res = await apiFetch('umroh/v1/flights'); setFlights(res.data.data); } catch(e){ setMsg({text:e.message, type:'error'}); } };
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try { await apiFetch('umroh/v1/flights', { method: 'POST', body: JSON.stringify(form) }); setMsg({text:'Penerbangan disimpan', type:'success'}); setForm({airline_name: '', flight_number: '', origin: 'CGK', destination: 'JED'}); load(); } 
        catch (e) { setMsg({text:e.message, type:'error'}); }
    };
    const remove = async () => {
        try { 
            const res = await apiFetch(`umroh/v1/flights/${delItem.id}`, { method: 'DELETE' }); 
            load(); setDelItem(null); 
            setMsg({text: res.message || 'Penerbangan dihapus.', type:'success'});
        } catch(e) { setMsg({text:e.message, type:'error'}); setDelItem(null); }
    };

    return (
        <div className="tab-content">
            <h2>Manajemen Data Penerbangan</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!delItem} title="Hapus Penerbangan" message={`Anda yakin ingin menghapus penerbangan "${delItem?.airline_name} ${delItem?.flight_number}"? Penghapusan akan gagal jika digunakan oleh Paket manapun.`} onConfirm={remove} onCancel={() => setDelItem(null)} />
            
            <div style={{ background: '#fff', padding: '15px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3>Input Data Penerbangan Baru</h3>
                <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <div><label style={{ fontWeight: 'bold' }}>Maskapai</label><input type="text" className="widefat" value={form.airline_name} onChange={e=>setForm({...form, airline_name:e.target.value})} placeholder="Contoh: Garuda Indonesia" required /></div>
                    <div><label style={{ fontWeight: 'bold' }}>No. Penerbangan</label><input type="text" className="widefat" value={form.flight_number} onChange={e=>setForm({...form, flight_number:e.target.value})} placeholder="GA-980" /></div>
                    <div><label style={{ fontWeight: 'bold' }}>Asal</label><input type="text" className="widefat" value={form.origin} onChange={e=>setForm({...form, origin:e.target.value})} /></div>
                    <div><label style={{ fontWeight: 'bold' }}>Tujuan</label><input type="text" className="widefat" value={form.destination} onChange={e=>setForm({...form, destination:e.target.value})} /></div>
                    <button className="button button-primary" style={{ height: '32px' }}>+ Tambah</button>
                </form>
            </div>

            <table className="wp-list-table widefat fixed striped">
                <thead><tr><th>Maskapai</th><th>Kode</th><th>Rute</th><th style={{width: '80px'}}>Aksi</th></tr></thead>
                <tbody>
                    {flights.map(f => (
                        <tr key={f.id}><td>{f.airline_name}</td><td>{f.flight_number}</td><td>{f.origin} ➝ {f.destination}</td>
                        <td><button className="button-link delete" onClick={()=>setDelItem(f)}>Hapus</button></td></tr>
                    ))}
                    {flights.length === 0 && <tr><td colSpan="4">Belum ada data Penerbangan.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- PACKAGE MANAGER (CORE) ---
const PackageManager = () => {
    const [packages, setPackages] = useState([]);
    const [meta, setMeta] = useState({ categories: [], hotels: [], flights: [] }); // Data master untuk dropdown
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({});
    
    // Form State
    const [form, setForm] = useState({ 
        package_name: '', category_id: '', duration_days: '9', description: '', 
        hotel_ids: [], flight_ids: [] 
    });
    const [delItem, setDelItem] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, hRes, fRes] = await Promise.all([
                apiFetch('umroh/v1/packages'),
                apiFetch('umroh/v1/categories'),
                apiFetch('umroh/v1/hotels'),
                apiFetch('umroh/v1/flights')
            ]);
            setPackages(pRes.data.data);
            setMeta({ categories: cRes.data, hotels: hRes.data.data, flights: fRes.data.data });
        } catch (e) { setMsg({ text: 'Gagal memuat data: ' + e.message, type: 'error' }); }
        setLoading(false);
    };
    useEffect(() => { loadAll(); }, []);

    const handleMultiSelect = (e, field) => {
        const values = Array.from(e.target.selectedOptions, option => option.value);
        setForm({ ...form, [field]: values });
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiFetch('umroh/v1/packages', { method: 'POST', body: JSON.stringify(form) });
            setMsg({ text: res.message || 'Paket berhasil dibuat!', type: 'success' });
            setIsFormOpen(false);
            setForm({ package_name: '', category_id: '', duration_days: '9', description: '', hotel_ids: [], flight_ids: [] });
            loadAll();
        } catch (e) { setMsg({ text: e.message, type: 'error' }); }
    };

    const remove = async () => {
        try { 
            const res = await apiFetch(`umroh/v1/packages/${delItem.id}`, { method: 'DELETE' }); 
            loadAll(); setDelItem(null); 
            setMsg({ text: res.message || 'Paket dihapus.', type: 'success' });
        } catch (e) { setMsg({ text: e.message, type: 'error' }); setDelItem(null); }
    };

    // Helper untuk render kategori dropdown (flatten)
    const renderCatOpts = (cats, level=0) => cats.flatMap(c => [<option key={c.id} value={c.id}>{'— '.repeat(level) + c.name}</option>, ...renderCatOpts(c.children||[], level+1)]);

    return (
        <div className="tab-content">
            <h2>Manajemen Paket Umroh (Jantung Sistem)</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!delItem} title="Hapus Paket" message="Anda yakin? Penghapusan akan gagal jika paket ini sudah memiliki Jadwal Keberangkatan." onConfirm={remove} onCancel={() => setDelItem(null)} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Daftar Paket</h3>
                <button className="button button-primary button-large" onClick={() => setIsFormOpen(!isFormOpen)}>
                    {isFormOpen ? 'Tutup Form' : '+ Buat Paket Baru'}
                </button>
            </div>

            {isFormOpen && (
                <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ marginTop: 0 }}>Form Paket Baru</h2>
                    <form onSubmit={submit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold' }}>Nama Paket</label>
                                    <input type="text" className="widefat" value={form.package_name} onChange={e=>setForm({...form, package_name:e.target.value})} placeholder="Misal: Umroh Akbar 2025" required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold' }}>Kategori</label>
                                    <select className="widefat" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})} required>
                                        <option value="">-- Pilih Kategori --</option>
                                        {renderCatOpts(meta.categories)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold' }}>Durasi (Hari)</label>
                                    <input type="number" className="widefat" value={form.duration_days} onChange={e=>setForm({...form, duration_days:e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold' }}>Pilih Hotel (Tahan Ctrl/Cmd untuk pilih banyak)</label>
                                    <select multiple className="widefat" style={{ height: '100px' }} onChange={e => handleMultiSelect(e, 'hotel_ids')}>
                                        {meta.hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.city}) - {h.stars}*</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold' }}>Pilih Maskapai (Tahan Ctrl/Cmd untuk pilih banyak)</label>
                                    <select multiple className="widefat" style={{ height: '100px' }} onChange={e => handleMultiSelect(e, 'flight_ids')}>
                                        {meta.flights.map(f => <option key={f.id} value={f.id}>{f.airline_name} ({f.origin}-{f.destination})</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'right' }}>
                             <button type="submit" className="button button-primary button-large">Simpan Paket Lengkap</button>
                        </div>
                    </form>
                </div>
            )}

            <table className="wp-list-table widefat fixed striped">
                <thead><tr><th>Nama Paket</th><th>Kategori</th><th>Durasi</th><th>Data Master</th><th style={{width: '80px'}}>Aksi</th></tr></thead>
                <tbody>
                    {loading ? <tr><td colSpan="5">Memuat data...</td></tr> : packages.map(p => (
                        <tr key={p.id}>
                            <td><strong>{p.package_name}</strong></td>
                            <td>{p.category_name}</td>
                            <td>{p.duration_days} Hari</td>
                            <td>
                                <small>
                                    🏠 {p.hotel_ids?.length || 0} Hotel<br/>
                                    ✈️ {p.flight_ids?.length || 0} Pesawat
                                </small>
                            </td>
                            <td><button className="button-link delete" onClick={()=>setDelItem(p)}>Hapus</button></td>
                        </tr>
                    ))}
                    {!loading && packages.length === 0 && <tr><td colSpan="5">Belum ada paket. Silakan buat baru.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- DEPARTURE MANAGER (JADWAL & HARGA) ---
const DepartureManager = () => {
    const [departures, setDepartures] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({});
    const [delItem, setDelItem] = useState(null);

    const [form, setForm] = useState({
        package_id: '', departure_date: '', quota: '45',
        price_quad: '', price_triple: '', price_double: ''
    });

    const load = async () => {
        setLoading(true);
        try {
            const [dRes, pRes] = await Promise.all([apiFetch('umroh/v1/departures'), apiFetch('umroh/v1/packages')]);
            setDepartures(dRes.data.data); setPackages(pRes.data.data);
        } catch(e){ setMsg({text:e.message, type:'error'}); }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try { 
            const res = await apiFetch('umroh/v1/departures', { method: 'POST', body: JSON.stringify(form) }); 
            setMsg({text: res.message || 'Jadwal berhasil ditambahkan!', type:'success'}); 
            load(); 
        } 
        catch(e) { setMsg({text:e.message, type:'error'}); }
    };

    const remove = async () => {
        try { 
            const res = await apiFetch(`umroh/v1/departures/${delItem.id}`, { method: 'DELETE' }); 
            load(); setDelItem(null); 
            setMsg({ text: res.message || 'Jadwal berhasil dihapus.', type: 'success' });
        } 
        catch (e) { setMsg({ text: e.message, type: 'error' }); setDelItem(null); }
    };

    const formatMoney = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="tab-content">
            <h2>Manajemen Jadwal Keberangkatan & Harga</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!delItem} title="Hapus Jadwal" message="Anda yakin? Penghapusan akan gagal jika jadwal ini sudah memiliki Jamaah terdaftar." onConfirm={remove} onCancel={() => setDelItem(null)} />

            <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Tambah Jadwal Baru</h3>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', alignItems: 'flex-end' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: 'bold' }}>Pilih Paket</label>
                            <select className="widefat" value={form.package_id} onChange={e=>setForm({...form, package_id:e.target.value})} required>
                                <option value="">-- Pilih Paket --</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.package_name} ({p.duration_days} Hari)</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>Tanggal Berangkat</label>
                            <input type="date" className="widefat" value={form.departure_date} onChange={e=>setForm({...form, departure_date:e.target.value})} required />
                        </div>
                         <div>
                            <label style={{ fontWeight: 'bold' }}>Kuota Kursi</label>
                            <input type="number" className="widefat" value={form.quota} onChange={e=>setForm({...form, quota:e.target.value})} required />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>Harga Quad (Ber-4)</label>
                            <input type="number" className="widefat" placeholder="Rp" value={form.price_quad} onChange={e=>setForm({...form, price_quad:e.target.value})} required />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>Harga Triple (Ber-3)</label>
                            <input type="number" className="widefat" placeholder="Rp" value={form.price_triple} onChange={e=>setForm({...form, price_triple:e.target.value})} required />
                        </div>
                        <div>
                            <label style={{ fontWeight: 'bold' }}>Harga Double (Ber-2)</label>
                            <input type="number" className="widefat" placeholder="Rp" value={form.price_double} onChange={e=>setForm({...form, price_double:e.target.value})} required />
                        </div>
                        <button className="button button-primary" style={{ height: '32px' }}>Simpan Jadwal</button>
                    </div>
                </form>
            </div>

            <table className="wp-list-table widefat fixed striped">
                <thead><tr><th>Tgl Berangkat</th><th>Paket</th><th>Harga (Q/T/D)</th><th>Kuota (Tersedia)</th><th style={{width: '80px'}}>Aksi</th></tr></thead>
                <tbody>
                    {departures.map(d => (
                        <tr key={d.id}>
                            <td><strong>{d.departure_date}</strong></td>
                            <td>{d.package_name} ({d.duration_days} Hari)</td>
                            <td>
                                <small>
                                    Q: {formatMoney(d.price_quad)} | 
                                    T: {formatMoney(d.price_triple)} | 
                                    D: {formatMoney(d.price_double)}
                                </small>
                            </td>
                            <td>{d.quota} ({d.available_quota})</td>
                            <td><button className="button-link delete" onClick={()=>setDelItem(d)}>Hapus</button></td>
                        </tr>
                    ))}
                    {departures.length === 0 && <tr><td colSpan="5">Belum ada Jadwal Keberangkatan.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- JAMAAH MANAGER ---
const JamaahManager = () => {
    const [jamaah, setJamaah] = useState([]);
    const [departures, setDepartures] = useState([]);
    const [msg, setMsg] = useState({});
    const [delItem, setDelItem] = useState(null);

    const [form, setForm] = useState({
        departure_id: '', full_name: '', ktp_number: '', passport_number: '',
        phone_number: '', email: '', address: '', status: 'registered'
    });

    const load = async () => {
        try {
            const [jRes, dRes] = await Promise.all([apiFetch('umroh/v1/jamaah'), apiFetch('umroh/v1/departures')]);
            setJamaah(jRes.data.data); setDepartures(dRes.data.data.filter(d => d.available_quota > 0)); // Hanya tampilkan jadwal yang kuotanya > 0
        } catch(e){ setMsg({text:e.message, type:'error'}); }
    };
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try { 
            const res = await apiFetch('umroh/v1/jamaah', { method: 'POST', body: JSON.stringify(form) }); 
            setMsg({text: res.message || 'Jamaah terdaftar!', type:'success'}); 
            load(); 
        } 
        catch(e) { setMsg({text:e.message, type:'error'}); }
    };

    const remove = async () => {
        try { 
            const res = await apiFetch(`umroh/v1/jamaah/${delItem.id}`, { method: 'DELETE' }); 
            load(); setDelItem(null); 
            setMsg({ text: res.message || 'Data jamaah dihapus.', type: 'success' });
        } 
        catch (e) { setMsg({ text: e.message, type: 'error' }); setDelItem(null); }
    };

    return (
        <div className="tab-content">
            <h2>Manajemen Data Jamaah</h2>
            <Notification message={msg.text} type={msg.type} />
            <Modal show={!!delItem} title="Hapus Jamaah" message="Anda yakin ingin menghapus data jamaah ini secara permanen?" onConfirm={remove} onCancel={() => setDelItem(null)} />

            <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Registrasi Jamaah Baru</h3>
                <form onSubmit={submit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontWeight: 'bold' }}>Pilih Keberangkatan (Paket & Tanggal)</label>
                            <select className="widefat" value={form.departure_id} onChange={e=>setForm({...form, departure_id:e.target.value})} required>
                                <option value="">-- Pilih Jadwal (Tersedia: {departures.length}) --</option>
                                {departures.map(d => <option key={d.id} value={d.id}>{d.departure_date} - {d.package_name} (Sisa: {d.available_quota})</option>)}
                            </select>
                            {departures.length === 0 && <p style={{color: 'red'}}>Tidak ada jadwal tersedia dengan kuota kosong.</p>}
                        </div>
                        <div><label style={{ fontWeight: 'bold' }}>Nama Lengkap (Sesuai KTP/Paspor)</label><input type="text" className="widefat" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} required /></div>
                        <div><label style={{ fontWeight: 'bold' }}>Nomor HP (WA)</label><input type="text" className="widefat" value={form.phone_number} onChange={e=>setForm({...form, phone_number:e.target.value})} required /></div>
                        <div><label style={{ fontWeight: 'bold' }}>No. KTP</label><input type="text" className="widefat" value={form.ktp_number} onChange={e=>setForm({...form, ktp_number:e.target.value})} /></div>
                        <div><label style={{ fontWeight: 'bold' }}>No. Paspor</label><input type="text" className="widefat" value={form.passport_number} onChange={e=>setForm({...form, passport_number:e.target.value})} /></div>
                    </div>
                    <div style={{ gridColumn: 'span 2', marginTop: '15px' }}>
                        <label style={{ fontWeight: 'bold' }}>Alamat Lengkap</label>
                        <textarea className="widefat" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} rows="3"></textarea>
                    </div>
                    <div style={{ marginTop: '15px', textAlign: 'right' }}>
                        <button className="button button-primary">Daftarkan Jamaah</button>
                    </div>
                </form>
            </div>

            <table className="wp-list-table widefat fixed striped">
                <thead><tr><th>Nama Jamaah</th><th>Keberangkatan</th><th>Kontak</th><th>Status</th><th style={{width: '80px'}}>Aksi</th></tr></thead>
                <tbody>
                    {jamaah.map(j => (
                        <tr key={j.id}>
                            <td><strong>{j.full_name}</strong><br/><small>KTP: {j.ktp_number}</small></td>
                            <td>{j.departure_date}<br/><small>{j.package_name}</small></td>
                            <td>{j.phone_number}</td>
                            <td><span className={`badge status-${j.status}`}>{j.status.toUpperCase()}</span></td>
                            <td><button className="button-link delete" onClick={()=>setDelItem(j)}>Hapus</button></td>
                        </tr>
                    ))}
                    {jamaah.length === 0 && <tr><td colSpan="5">Belum ada data Jamaah.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- PERMISSION MANAGER (HAK AKSES) ---
const PermissionManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [customPermissions, setCustomPermissions] = useState({});

    // Daftar Kunci Izin yang TERSSEDIA
    const PERM_KEYS = [
        { key: 'manage_categories', label: 'Manajemen Kategori (CRUD)' },
        { key: 'manage_hotels', label: 'Manajemen Hotel (CRUD)' },
        { key: 'manage_flights', label: 'Manajemen Pesawat (CRUD)' },
        { key: 'manage_packages', label: 'Manajemen Paket (CRUD)' },
        { key: 'manage_departures', label: 'Manajemen Jadwal/Harga (CRUD)' },
        { key: 'manage_jamaah', label: 'Manajemen Jamaah (CRUD)' },
        { key: 'view_jamaah', label: 'Hanya Lihat Data Jamaah' },
    ];

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('umroh/v1/users');
            setUsers(res.data);
            setMsg({});
        } catch (e) {
            setMsg({ text: 'Gagal memuat data pengguna: ' + e.message, type: 'error' });
        }
        setLoading(false);
    };
    useEffect(() => { loadUsers(); }, []);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        // Set state permissions dari data user yang dipilih
        const initialPerms = {};
        PERM_KEYS.forEach(p => {
            // Default ke FALSE jika tidak ada setting kustom
            initialPerms[p.key] = user.permissions[p.key] !== undefined ? user.permissions[p.key] : false;
        });
        setCustomPermissions(initialPerms);
    };

    const handlePermChange = (key, value) => {
        setCustomPermissions(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePermissions = async () => {
        if (!selectedUser) return;
        setMsg({});
        try {
            const payload = customPermissions;
            const res = await apiFetch(`umroh/v1/users/${selectedUser.id}/permissions`, { 
                method: 'POST', 
                body: JSON.stringify(payload) 
            });
            setMsg({ text: `Hak akses untuk ${selectedUser.name} berhasil disimpan.`, type: 'success' });
            loadUsers();
        } catch (e) {
            setMsg({ text: e.message, type: 'error' });
        }
    };

    return (
        <div className="tab-content">
            <h2>Manajemen Hak Akses Karyawan</h2>
            <p>Super Admin dapat memberikan hak akses kustom kepada setiap pengguna (karyawan) di bawah ini.</p>
            <Notification message={msg.text} type={msg.type} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* Panel Kiri: Daftar Pengguna */}
                <div style={{ background: '#fff', border: '1px solid #ccc', maxHeight: '600px', overflowY: 'auto' }}>
                    <h3 style={{ margin: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Pilih Karyawan</h3>
                    <table className="wp-list-table widefat striped">
                        <tbody>
                            {loading ? <tr><td>Loading...</td></tr> : users.map(user => (
                                <tr 
                                    key={user.id} 
                                    onClick={() => handleUserSelect(user)}
                                    style={{ cursor: 'pointer', background: selectedUser?.id === user.id ? '#f0f6fc' : 'white' }}
                                >
                                    <td>
                                        <strong>{user.name}</strong><br/>
                                        <small>{user.email}</small>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && <tr><td>Tidak ada pengguna.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* Panel Kanan: Pengaturan Izin */}
                <div style={{ background: '#fff', padding: '20px', border: '1px solid #ccc' }}>
                    {selectedUser ? (
                        <>
                            <h3>Pengaturan Izin untuk: {selectedUser.name}</h3>
                            <p style={{borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Atur setiap modul yang boleh diakses/diubah oleh pengguna ini.</p>
                            
                            <table className="wp-list-table widefat striped">
                                <thead>
                                    <tr><th>Fitur</th><th style={{width: '100px'}}>Akses</th></tr>
                                </thead>
                                <tbody>
                                    {PERM_KEYS.map(p => (
                                        <tr key={p.key}>
                                            <td>{p.label}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={!!customPermissions[p.key]}
                                                    onChange={(e) => handlePermChange(p.key, e.target.checked)}
                                                    style={{ transform: 'scale(1.3)' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <button 
                                onClick={handleSavePermissions} 
                                className="button button-primary button-large" 
                                style={{ marginTop: '20px' }}
                            >
                                Simpan Hak Akses
                            </button>
                        </>
                    ) : (
                        <p style={{textAlign: 'center', padding: '50px'}}>Pilih karyawan dari daftar di samping untuk mulai mengatur hak akses mereka.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 3. MAIN APP & NAVIGATION
// ==========================================

const App = () => {
    const [view, setView] = useState('dashboard');

    const NavButton = ({ id, label, icon }) => (
        <button 
            onClick={() => setView(id)} 
            style={{ 
                padding: '12px 20px', border: 'none', background: view === id ? '#2271b1' : 'transparent', 
                color: view === id ? '#fff' : '#2c3338', cursor: 'pointer', borderRadius: '4px', 
                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
            }}
        >
            <span>{icon}</span> {label}
        </button>
    );

    const DashboardHome = () => (
        <div style={{ padding: '20px', background: '#fff', border: '1px solid #ccc' }}>
            <h2>👋 Selamat Datang di Sistem Manajemen Travel Umroh</h2>
            <p>Sistem ini telah disempurnakan dengan fitur relasional, keamanan, dan manajemen hak akses karyawan.</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#f0f6fc', padding: '20px', flex: 1, borderRadius: '8px' }}>
                    <h3>Master Data (Master)</h3>
                    <p>Siapkan data dasar: Kategori, Hotel, dan Penerbangan.</p>
                </div>
                <div style={{ background: '#f0f6fc', padding: '20px', flex: 1, borderRadius: '8px' }}>
                    <h3>Paket & Jadwal (Core)</h3>
                    <p>Rakit Paket dari Master Data, lalu tentukan Jadwal Keberangkatan dan Harga.</p>
                </div>
                <div style={{ background: '#f0f6fc', padding: '20px', flex: 1, borderRadius: '8px' }}>
                    <h3>Jamaah & Akses (Manajemen)</h3>
                    <p>Daftarkan Jamaah dan atur Hak Akses untuk setiap Karyawan.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="wrap">
            <h1 className="wp-heading-inline" style={{ marginBottom: '20px' }}>Sistem Manajemen Travel Umroh</h1>
            
            {/* Navigation Bar */}
            <div style={{ 
                background: '#fff', padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px', 
                display: 'flex', gap: '10px', flexWrap: 'wrap', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
                <NavButton id="dashboard" label="Dashboard" icon="🏠" />
                <div style={{ width: '1px', background: '#ddd', margin: '0 5px' }}></div>
                <NavButton id="categories" label="Kategori" icon="📂" />
                <NavButton id="hotels" label="Hotel" icon="🏨" />
                <NavButton id="flights" label="Pesawat" icon="✈️" />
                <div style={{ width: '1px', background: '#ddd', margin: '0 5px' }}></div>
                <NavButton id="packages" label="Paket Umroh" icon="📦" />
                <NavButton id="departures" label="Jadwal & Harga" icon="📅" />
                <NavButton id="jamaah" label="Data Jamaah" icon="👥" />
                <div style={{ width: '1px', background: '#ddd', margin: '0 5px' }}></div>
                <NavButton id="permissions" label="Pengaturan Akses" icon="🔑" />
            </div>

            {/* View Content */}
            <div style={{ minHeight: '400px' }}>
                {view === 'dashboard' && <DashboardHome />}
                {view === 'categories' && <CategoryManager />}
                {view === 'hotels' && <HotelManager />}
                {view === 'flights' && <FlightManager />}
                {view === 'packages' && <PackageManager />}
                {view === 'departures' && <DepartureManager />}
                {view === 'jamaah' && <JamaahManager />}
                {view === 'permissions' && <PermissionManager />}
            </div>
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const rootEl = document.getElementById('umroh-manager-react-root');
    if (rootEl) createRoot(rootEl).render(<App />);
});