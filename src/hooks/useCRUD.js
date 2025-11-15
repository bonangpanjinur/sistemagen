import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Hook kustom untuk operasi CRUD (Create, Read, Update, Delete)
 * dengan paginasi, pencarian, dan sorting.
 * @param {string} resource - Nama endpoint API (misal: 'packages', 'jamaah').
 */
const useCRUD = (resource) => {
    const [data, setData] = useState([]); // Data item untuk halaman saat ini
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        per_page: 10
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState({ field: 'id', order: 'desc' });

    // Fungsi utama untuk mengambil data
    const fetchData = useCallback(async (page = 1, search = searchTerm, sort = sortBy) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: page,
                per_page: pagination.per_page,
                search: search,
                orderby: sort.field,
                order: sort.order,
            };
            const response = await api.get(resource, { params });
            setData(response.data.items);
            setPagination({
                total_items: response.data.total_items,
                total_pages: response.data.total_pages,
                current_page: response.data.current_page,
                per_page: response.data.per_page,
            });
        } catch (err) {
            // Error sudah ditangani oleh interceptor, tapi kita set state error lokal
            setError(err.message || 'Failed to fetch data');
            console.error(`Failed to fetch ${resource}:`, err);
        } finally {
            setLoading(false);
        }
    }, [resource, pagination.per_page, searchTerm, sortBy]); // dependensi

    // Ambil data saat komponen dimuat atau saat paginasi/search/sort berubah
    useEffect(() => {
        fetchData(pagination.current_page, searchTerm, sortBy);
    }, [fetchData, pagination.current_page, searchTerm, sortBy]);

    // Handler untuk ganti halaman
    const handlePageChange = (newPage) => {
        if (newPage !== pagination.current_page && newPage > 0 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    // Handler untuk pencarian
    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, current_page: 1 })); // Reset ke halaman 1
    };
    
    // Handler untuk sorting
    const handleSort = (field) => {
        const order = (sortBy.field === field && sortBy.order === 'asc') ? 'desc' : 'asc';
        setSortBy({ field, order });
    };

    // Fungsi untuk membuat item baru
    const createItem = async (item) => {
        try {
            const response = await api.post(resource, item);
            fetchData(1, '', sortBy); // Refresh ke halaman 1
            return response;
        } catch (err) {
            console.error(`Failed to create ${resource}:`, err);
            throw err; // Lempar error agar form bisa menangani
        }
    };

    // Fungsi untuk mengupdate item
    const updateItem = async (id, item) => {
        try {
            const response = await api.put(`${resource}/${id}`, item);
            fetchData(pagination.current_page, searchTerm, sortBy); // Refresh halaman saat ini
            return response;
        } catch (err) {
            console.error(`Failed to update ${resource}:`, err);
            throw err; // Lempar error agar form bisa menangani
        }
    };

    // Fungsi untuk menghapus item
    const deleteItem = async (id) => {
        try {
            await api.delete(`${resource}/${id}`);
            // Cek jika ini item terakhir di halaman, pindah ke halaman sebelumnya
            if (data.length === 1 && pagination.current_page > 1) {
                 fetchData(pagination.current_page - 1, searchTerm, sortBy);
            } else {
                 fetchData(pagination.current_page, searchTerm, sortBy);
            }
        } catch (err) {
            console.error(`Failed to delete ${resource}:`, err);
            throw err;
        }
    };
    
    /**
     * Fungsi untuk mengambil satu item berdasarkan ID.
     * Berguna untuk form edit yang butuh data relasi.
     */
    const fetchItemById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`${resource}/${id}`);
            return response.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch item');
            console.error(`Failed to fetch ${resource}/${id}:`, err);
        } finally {
            setLoading(false);
        }
    }, [resource]);

    return {
        data,
        loading,
        error,
        pagination,
        searchTerm,
        sortBy,
        fetchData,
        handlePageChange,
        handleSearch,
        handleSort,
        createItem,
        updateItem,
        deleteItem,
        fetchItemById
    };
};

export default useCRUD;