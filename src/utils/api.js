import axios from 'axios';

// Ambil URL dasar REST API dan Nonce dari objek global WordPress
// Biasanya dilokalisasi via wp_localize_script di PHP
const apiUrl = window.umhData?.root_url || '/wp-json/';
const nonce = window.umhData?.nonce || '';

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce, // Header Wajib untuk keamanan WP
    },
});

// Interceptor Default (Logging)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log jika terjadi Forbidden (biasanya masalah Nonce)
        if (error.response && error.response.status === 403) {
            console.error('Akses ditolak (403). Coba refresh halaman atau login ulang.');
        }
        return Promise.reject(error);
    }
);

/**
 * PERBAIKAN: Menambahkan export fungsi setupApiErrorInterceptor
 * Fungsi ini dipanggil oleh DataContext.jsx untuk menangani 401 (Unauthorized)
 */
export const setupApiErrorInterceptor = (onUnauthenticated) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Panggil fungsi logout/state change dari Context jika ada
                if (onUnauthenticated && typeof onUnauthenticated === 'function') {
                    onUnauthenticated();
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;