import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setupApiErrorInterceptor } from '../utils/api';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({}); // Inisialisasi object kosong agar tidak error saat destructuring
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalError, setGlobalError] = useState(null); // Tambahan untuk GlobalErrorAlert

    useEffect(() => {
        const initApp = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Cek data user dari window object (PHP)
                if (window.umhData && window.umhData.user) {
                    setUser(window.umhData.user);
                }

                // 2. Setup interceptor untuk handle 401/Logout
                setupApiErrorInterceptor(() => {
                    setGlobalError("Sesi habis, silakan refresh halaman untuk login kembali.");
                });

                // 3. Fetch Statistik Dashboard (Paralel agar cepat)
                // Kita butuh: Total Stats & Upcoming Departures
                const [statsRes, departuresRes] = await Promise.all([
                    api.get('umh/v1/stats/totals').catch(err => ({ data: {} })), // Handle error per request agar tidak memblokir semua
                    api.get('umh/v1/departures', { params: { per_page: 5, status: 'scheduled', orderby: 'departure_date', order: 'asc' } }).catch(err => ({ data: { items: [] } }))
                ]);

                const totalStats = statsRes.data || {};
                const departures = departuresRes.data.items || [];

                // Format data agar sesuai dengan yang diharapkan Dashboard.jsx
                setStats({
                    total_jamaah: totalStats.total_jamaah || 0,
                    active_packages: totalStats.total_packages || 0,
                    total_revenue: totalStats.total_revenue || 0,
                    upcoming_departures: departures.map(d => ({
                        name: d.package_name,
                        date: d.departure_date,
                        booked: d.slots_filled || d.total_seats - d.available_seats, // Hitung manual jika field booked tidak ada
                        quota: d.total_seats
                    }))
                });

            } catch (err) {
                console.error("Gagal inisialisasi aplikasi:", err);
                setError("Gagal memuat data dashboard. Periksa koneksi internet Anda.");
            } finally {
                setLoading(false);
            }
        };

        initApp();
    }, []);

    const clearGlobalError = () => setGlobalError(null);

    const value = {
        user,
        stats, // Expose stats ke komponen
        loading,
        error,
        globalError,
        clearGlobalError
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;