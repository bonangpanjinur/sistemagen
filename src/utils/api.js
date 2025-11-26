import axios from 'axios';

// Mengambil konfigurasi dari wp_localize_script
// Jika development lokal (npm start), gunakan fallback
const config = window.umrohManagerData || {
    root: 'http://localhost/wp-json/umroh-manager/v1/',
    nonce: '',
};

const api = axios.create({
    baseURL: config.root,
    headers: {
        'X-WP-Nonce': config.nonce,
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menangani error response secara global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Error dari server (404, 500, 403)
            console.error('API Error:', error.response.status, error.response.data);
            
            if (error.response.status === 404) {
                console.error(`Route not found: ${error.config.url}. Pastikan file API dimuat di backend.`);
                // Bisa throw error khusus biar UI tau kalau ini masalah koneksi
                throw new Error("Koneksi API Gagal: Rute tidak ditemukan (404).");
            }
            
            if (error.response.status === 403) {
                console.error('Permission denied. Cek nonce atau capability.');
            }
        } else if (error.request) {
            // Tidak ada respon dari server
            console.error('Network Error: Tidak ada respon dari server.');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;