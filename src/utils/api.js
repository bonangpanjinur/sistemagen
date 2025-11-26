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

// Interceptor untuk menangani error global
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 403) {
            console.error('Akses ditolak. Coba logout dan login kembali ke WordPress.');
        }
        return Promise.reject(error);
    }
);

export default api;