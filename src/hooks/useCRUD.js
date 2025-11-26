import { useState, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast'; // Optional: Gunakan jika sudah install react-hot-toast

const useCRUD = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch Data
    const fetchData = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(endpoint, { params });
            // Sesuaikan dengan struktur return API Anda (misal response.data atau response.data.data)
            const result = response.data || []; 
            setData(Array.isArray(result) ? result : []);
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Gagal memuat data';
            setError(errMsg);
            console.error("Fetch Error:", err);
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
            // Menggunakan POST ke endpoint ID biasanya standar di WP REST API jika PUT bermasalah
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
        setLoading(true);
        const toastId = toast.loading('Menghapus data...');
        try {
            await api.delete(`${endpoint}/${id}`);
            // Optimistic Update: Hapus dari UI dulu biar cepat
            setData((prev) => prev.filter((item) => item.id !== id));
            toast.success('Data dihapus', { id: toastId });
            return true;
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Gagal menghapus data';
            setError(errMsg);
            toast.error(errMsg, { id: toastId });
            fetchData(); // Rollback/Refresh jika gagal
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        fetchData,
        createItem,
        updateItem,
        deleteItem
    };
};

export default useCRUD;