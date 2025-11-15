// Lokasi File: bonangpanjinur/travelmanajemen/travelmanajemen-f41c18137ac73c115e031d3f61ac18797af42e9f/src/contexts/
// Nama File: DataContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

// --- STUB UNTUK API ---
// Membuat objek api tiruan (stub) untuk menggantikan file ../utils/api yang hilang
// Ini akan mengembalikan data kosong agar aplikasi bisa berjalan tanpa error.
const api = {
    get: (resource, config) => {
        console.log(`[STUB API] GET: ${resource}`, config);
        // Mensimulasikan penundaan jaringan
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    data: {
                        items: [], // Selalu kembalikan array kosong
                        total: 0
                    }
                });
            }, 500); // Tunda 0.5 detik
        });
    }
    // Anda bisa menambahkan method .post, .put, .delete di sini jika diperlukan
};
// --- AKHIR DARI STUB API ---

// 1. Buat Context
const DataContext = createContext(null);

// 2. Buat Provider Component
export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [packages, setPackages] = useState([]);
    // Tambahkan state lain sesuai kebutuhan...

    // Fungsi untuk memuat data awal
    const fetchData = async () => {
        setLoading(true);
        try {
            // Gunakan Promise.all untuk mengambil data secara paralel
            const [categoriesRes, usersRes, packagesRes] = await Promise.all([
                api.get('categories'),
                api.get('users'),
                api.get('packages')
            ]);
            
            setCategories(categoriesRes.data.items);
            setUsers(usersRes.data.items);
            setPackages(packagesRes.data.items);

        } catch (error) {
            console.error("Gagal mengambil data awal:", error);
        } finally {
            // Setelah semua selesai, matikan loading
            setLoading(false);
        }
    };

    // Muat data saat komponen pertama kali di-mount
    useEffect(() => {
        fetchData();
    }, []);

    // Nilai yang akan dibagikan ke komponen anak
    const value = {
        loading,
        categories,
        users,
        packages,
        // Tambahkan fungsi untuk memuat ulang data jika perlu
        refetch: fetchData 
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