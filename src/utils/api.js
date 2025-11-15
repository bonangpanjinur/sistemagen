import axios from 'axios';

// Ambil data yang di-localize dari WordPress (diset di umroh-manager-hybrid.php)
const umhData = window.umhData || { apiUrl: '', nonce: '', currentUser: {} };

const api = axios.create({
    baseURL: umhData.apiUrl,
    headers: {
        'X-WP-Nonce': umhData.nonce // Kirim nonce untuk otentikasi
    }
});

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
        
        // Tampilkan alert. Ganti ini dengan sistem notifikasi yang lebih baik jika ada.
        alert(message); 
        
        return Promise.reject(error);
    }
);

export default api;