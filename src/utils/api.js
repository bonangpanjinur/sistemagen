import axios from 'axios';

// Mengambil konfigurasi dari wp_localize_script
const umhData = window.umhData || { apiUrl: '', nonce: '', currentUser: {} };

const api = axios.create({
    baseURL: umhData.apiUrl || '/wp-json/umh/v1/', // Fallback jika umhData belum siap
    headers: {
        'X-WP-Nonce': umhData.nonce,
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor Response
 * Menangani error global (seperti 401 Unauthorized, 403 Forbidden, 500 Server Error)
 * Dan mem-parsing pesan error dari WordPress REST API
 */
export const setupApiErrorInterceptor = (setGlobalError) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            let message = 'Terjadi kesalahan yang tidak diketahui.';

            if (error.response) {
                // Error dari server (status code di luar 2xx)
                console.error('API Error Response:', error.response.status, error.response.data);
                
                // Coba ambil pesan error dari body response WordPress
                if (error.response.data && error.response.data.message) {
                    message = error.response.data.message;
                } else if (error.response.status === 403) {
                    message = 'Anda tidak memiliki izin untuk melakukan aksi ini (403).';
                } else if (error.response.status === 404) {
                    message = 'Data atau endpoint tidak ditemukan (404).';
                } else if (error.response.status === 500) {
                    message = 'Terjadi kesalahan pada server (500).';
                }
            } else if (error.request) {
                // Request dibuat tapi tidak ada respon (masalah koneksi)
                console.error('API Error Request:', error.request);
                message = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
            } else {
                // Error saat setup request
                console.error('API Error Message:', error.message);
                message = error.message;
            }

            // Set error ke state global jika fungsi tersedia
            if (setGlobalError) {
                setGlobalError(message);
            }

            return Promise.reject(error);
        }
    );
};

export default api;