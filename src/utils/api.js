/*
 * Lokasi File: /src/utils/api.js
 * File: api.js
 */

import axios from 'axios';

// [PERBAIKAN] Pastikan mengambil umhData, bukan umhSettings
// Karena di PHP kita sudah ubah wp_localize_script menjadi 'umhData'
const umhData = window.umhData || { apiUrl: '', nonce: '', currentUser: {} };

const api = axios.create({
    baseURL: umhData.apiUrl, // Gunakan apiUrl yang kita set di PHP
    headers: {
        'X-WP-Nonce': umhData.nonce // Kirim nonce untuk otentikasi WordPress REST API
    }
});

/**
 * Fungsi untuk menghubungkan interceptor dengan state global.
 * Ini harus dipanggil di dalam komponen React (misal: di DataContext.jsx)
 *
 * @param {function} setGlobalError - Fungsi untuk mengatur pesan error global.
 */
export const setupApiErrorInterceptor = (setGlobalError) => {
    api.interceptors.response.use(
        response => response,
        error => {
            let message = 'Terjadi kesalahan. Silakan coba lagi.';
            if (error.response) {
                console.error("API Error Response:", error.response.data);
                // Ambil pesan error dari WordPress
                message = error.response.data.message || 'Error pada server.';
            } else if (error.request) {
                console.error("API Error Request:", error.request);
                message = 'Error: Tidak dapat terhubung ke server.';
            } else {
                console.error("API Error:", error.message);
                message = error.message;
            }
            
            if (setGlobalError) {
                setGlobalError(message);
            }
            
            return Promise.reject(error);
        }
    );
};

export default api;