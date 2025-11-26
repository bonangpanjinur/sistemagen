import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Hook kustom untuk operasi CRUD yang AMAN (Anti-Blank Page).
 */
const useCRUD = (resource) => {
    const [data, setData] = useState([]); // Default array kosong
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
            
            // PERBAIKAN UTAMA: Gunakan Optional Chaining (?.) dan Default Value (|| [])
            // Ini mencegah crash jika response.data atau response.data.items tidak ada
            const items = response.data?.items || []; 
            
            setData(items);

            setPagination({
                total_items: parseInt(response.data?.total_items || 0),
                total_pages: parseInt(response.data?.total_pages || 1),
                current_page: parseInt(response.data?.current_page || 1),
                per_page: parseInt(response.data?.per_page || 10),
            });

        } catch (err) {
            // Tangani error dengan anggun, jangan biarkan app crash
            console.error(`Failed to fetch ${resource}:`, err);
            setError(err.message || 'Gagal memuat data');
            setData([]); // Pastikan data kembali ke array kosong saat error
        } finally {
            setLoading(false);
        }
    }, [resource, pagination.per_page, searchTerm, sortBy]);

    useEffect(() => {
        fetchData(pagination.current_page, searchTerm, sortBy);
    }, [fetchData, pagination.current_page, searchTerm, sortBy]);

    const handlePageChange = (newPage) => {
        if (newPage !== pagination.current_page && newPage > 0 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };
    
    const handleSort = (field) => {
        const order = (sortBy.field === field && sortBy.order === 'asc') ? 'desc' : 'asc';
        setSortBy({ field, order });
    };

    const createItem = async (item) => {
        try {
            const response = await api.post(resource, item);
            fetchData(1, '', sortBy);
            return { success: true, data: response.data };
        } catch (err) {
            console.error(`Failed to create in ${resource}:`, err);
            throw err;
        }
    };

    const updateItem = async (id, item) => {
        try {
            const response = await api.put(`${resource}/${id}`, item);
            fetchData(pagination.current_page, searchTerm, sortBy);
            return { success: true, data: response.data };
        } catch (err) {
            console.error(`Failed to update in ${resource}:`, err);
            throw err;
        }
    };

    const deleteItem = async (id) => {
        try {
            await api.delete(`${resource}/${id}`);
            if (data.length === 1 && pagination.current_page > 1) {
                 fetchData(pagination.current_page - 1, searchTerm, sortBy);
            } else {
                 fetchData(pagination.current_page, searchTerm, sortBy);
            }
            return { success: true };
        } catch (err) {
            console.error(`Failed to delete in ${resource}:`, err);
            throw err;
        }
    };
    
    const fetchItemById = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`${resource}/${id}`);
            return response.data;
        } catch (err) {
            setError(err.message || 'Failed to fetch item');
            return null;
        } finally {
            setLoading(false);
        }
    }, [resource]);

    // Mengembalikan 'items' sebagai alias untuk 'data' agar konsisten dengan penggunaan di page lain
    return {
        data,        // Untuk backward compatibility
        items: data, // Nama yang lebih deskriptif
        loading,
        error,
        pagination,
        searchTerm,
        sortBy,
        fetchData, // alias untuk fetchItems
        fetchItems: fetchData,
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