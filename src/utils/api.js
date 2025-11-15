/*
 * Lokasi File: /src/utils/api.js
 * File: api.js
 */

import axios from 'axios';
import { DataContext } from '../contexts/DataContext.jsx'; // PERBAIKAN: Tambah ekstensi .jsx

// Ambil data yang di-localize dari WordPress (diset di umroh-manager-hybrid.php)
const umhData = window.umhData || { apiUrl: '', nonce: '', currentUser: {} };

const api = axios.create({
    baseURL: umhData.apiUrl,
    headers: {
        'X-WP-Nonce': umhData.nonce // Kirim nonce untuk otentikasi
    }
});

/**
 * Fungsi untuk menghubungkan interceptor dengan state global.
 * Ini harus dipanggil di dalam komponen React (misal: di DataContext.jsx)
 *
 * @param {function} setGlobalError - Fungsi untuk mengatur pesan error global.
 */
export const setupApiErrorInterceptor = (setGlobalError) => {
    // Interceptor untuk menangani error API secara global
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
            
            // PERBAIKAN: Hapus alert()
            // alert(message); 
            
            // PERBAIKAN BARU: Set error global
            if (setGlobalError) {
                setGlobalError(message);
            }
            
            return Promise.reject(error);
        }
    );
};


export default api;