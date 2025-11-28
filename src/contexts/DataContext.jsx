import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Fungsi untuk memuat data awal
    const initData = async () => {
        setLoading(true);
        try {
            // Cek apakah settings dari WP tersedia
            if (!window.umrohManagerSettings) {
                console.warn('umrohManagerSettings not found, using mock/dev mode or fallback');
            }

            // Panggil API User Me
            // Kita gunakan try-catch terpisah untuk user agar app tidak crash total jika user gagal load
            try {
                const userResponse = await api.get('/user/me');
                if (userResponse.data && userResponse.data.success) {
                    setCurrentUser(userResponse.data.data);
                } else {
                    // Fallback jika API response structure berbeda
                    console.log("User data not standard format:", userResponse);
                    setCurrentUser(userResponse.data || { name: 'Admin', role: 'administrator' });
                }
            } catch (userErr) {
                console.error("Error fetching user:", userErr);
                setError("Gagal memuat data pengguna.");
                // Tetap set user null atau default agar menu tetap bisa muncul (opsional)
            }

        } catch (err) {
            console.error("Critical Init Error:", err);
            setError(err.message);
        } finally {
            // PENTING: Loading HARUS dimatikan apapun yang terjadi
            setLoading(false);
        }
    };

    useEffect(() => {
        initData();
    }, []);

    const refreshStats = async () => {
        try {
            const response = await api.get('/stats/dashboard');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        stats,
        refreshStats,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.roles?.includes('administrator') || true // Default true for debugging if needed
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};