import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setupApiErrorInterceptor } from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Default true saat pertama buka

    // Ambil data user dari localize script PHP (biar cepat)
    // Jadi tidak perlu fetch API lagi untuk data dasar user
    useEffect(() => {
        const initApp = async () => {
            setLoading(true);
            try {
                // 1. Cek data dari window object (yang dikirim PHP tadi)
                if (window.umhData && window.umhData.user) {
                    setUser(window.umhData.user);
                } else {
                    // Fallback: Jika tidak ada di window, coba fetch API
                    // Endpoint ini harus ada di backend (opsional)
                    // const res = await api.get('wp/v2/users/me');
                    // setUser(res.data);
                }

                // Setup interceptor untuk handle error 401/Logout otomatis
                setupApiErrorInterceptor(() => {
                    console.warn("Sesi habis, silakan login ulang.");
                });

            } catch (error) {
                console.error("Gagal inisialisasi aplikasi:", error);
            } finally {
                // [KUNCI] Apapun yang terjadi (sukses/error), matikan loading!
                // Agar menu tidak muter terus.
                setLoading(false);
            }
        };

        initApp();
    }, []);

    const value = {
        user,
        loading,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;