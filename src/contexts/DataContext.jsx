import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

export const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);

    // Load initial data jika diperlukan
    const loadInitialData = async () => {
        setLoading(true);
        try {
            // Contoh: Load current user atau stats dasar
            // const userData = await api.get('users/me');
            // setUser(userData);
        } catch (err) {
            console.error("Gagal memuat data awal:", err);
            // Jangan set global error jika hanya data optional
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const value = {
        loading,
        setLoading,
        error,
        setError,
        stats,
        setStats,
        user,
        setUser
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};