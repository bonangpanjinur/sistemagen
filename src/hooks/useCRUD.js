import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast'; 

const useCRUD = (endpoint) => {
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch Data
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(endpoint, { params });
            
            // PERBAIKAN UTAMA: Handle struktur response dari Controller PHP
            // Controller mengembalikan { items: [], total_items: 10, ... }
            
            if (response.data && Array.isArray(response.data.items)) {
                // Jika formatnya object dengan property items (Pagination aktif)
                setData(response.data.items);
                setPagination({
                    current_page: response.data.current_page || 1,
                    total_pages: response.data.total_pages || 1,
                    total_items: response.data.total_items || 0
                });
            } else if (Array.isArray(response.data)) {
                // Jika formatnya langsung array (tanpa pagination)
                setData(response.data);
            } else {
                // Fallback jika format tidak dikenali
                console.warn("Format data API tidak sesuai ekspektasi:", response.data);
                setData([]); 
            }

        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data';
            setError(errMsg);
            console.error("Fetch Error:", err);
            setData([]); // Pastikan data kosong saat error untuk mencegah layar putih
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    // 2. Create Item
    const createItem = async (newItem) => {
        setLoading(true);
        const toastId = toast.loading('Menyimpan data...');
        try {
            await api.post(endpoint, newItem);
            await fetchData(); // Refresh data otomatis
            toast.success('Data berhasil disimpan!', { id: toastId });
            return true;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal menyimpan data';
            setError(errMsg);
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 3. Update Item
    const updateItem = async (id, updatedItem) => {
        setLoading(true);
        const toastId = toast.loading('Memperbarui data...');
        try {
            await api.post(`${endpoint}/${id}`, updatedItem); 
            await fetchData();
            toast.success('Data berhasil diperbarui!', { id: toastId });
            return true;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal memperbarui data';
            setError(errMsg);
            toast.error(errMsg, { id: toastId });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 4. Delete Item
    const deleteItem = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return false;
        
        setLoading(true);
        const toastId = toast.loading('Menghapus data...');
        try {
            await api.delete(`${endpoint}/${id}`);
            
            // Optimistic update
            setData((prev) => prev.filter((item) => item.id !== id));
            
            toast.success('Data dihapus', { id: toastId });
            
            // Refetch untuk memastikan pagination update
            fetchData(); 
            return true;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal menghapus data';
            setError(errMsg);
            toast.error(errMsg, { id: toastId });
            fetchData(); // Rollback jika gagal
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        pagination, // Export pagination info
        loading,
        error,
        fetchData,
        createItem,
        updateItem,
        deleteItem
    };
};

export default useCRUD;