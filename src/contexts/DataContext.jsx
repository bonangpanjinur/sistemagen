import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api.js'; // Import API yang sebenarnya

// 1. Buat Context
const DataContext = createContext(null);

// 2. Buat Provider Component
export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [dataCache, setDataCache] = useState({});

    // Fungsi untuk mengambil data (dengan caching)
    const fetchData = useCallback(async (resource, forceRefresh = false) => {
        if (!forceRefresh && dataCache[resource]) {
            return dataCache[resource];
        }

        try {
            const response = await api.get(resource, { params: { per_page: -1 } }); // Ambil semua data
            const items = response.data.items || [];
            setDataCache(prev => ({ ...prev, [resource]: items }));
            return items;
        } catch (error) {
            console.error(`Gagal mengambil data untuk ${resource}:`, error);
            return []; // Kembalikan array kosong jika gagal
        }
    }, [dataCache]);

    // Fungsi untuk memuat data awal
    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([
            fetchData('categories'),
            fetchData('users'),
            fetchData('packages'),
            fetchData('jamaah'),
            fetchData('flights'),
            fetchData('hotels')
        ]);
        setLoading(false);
    };

    // Muat data awal saat komponen pertama kali di-mount
    useEffect(() => {
        fetchInitialData();
    }, []); // Hanya sekali

    // Fungsi untuk me-refresh data tertentu
    const refreshData = async (resource) => {
        await fetchData(resource, true); // Paksa refresh
    };

    // Nilai yang akan dibagikan
    const value = {
        loading,
        ...dataCache, // Sebarkan semua data yang di-cache (categories, users, etc.)
        fetchData,   // Bagikan fungsi fetch jika komponen perlu data on-demand
        refreshData // Bagikan fungsi refresh
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

// 3. Buat Custom Hook untuk menggunakan context
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData harus digunakan di dalam DataProvider');
    }
    return context;
};