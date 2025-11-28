import axios from 'axios';

// 1. Ambil setting dari WordPress (jika ada)
const settings = window.umrohManagerSettings || {};

// 2. Fungsi Cerdas untuk menentukan Base URL API
const getBaseURL = () => {
    // A. Jika setting dari PHP tersedia (Skenario Ideal)
    if (settings.root) {
        return settings.root + 'umroh-manager/v1';
    }

    // B. Jika setting hilang, lakukan deteksi otomatis berdasarkan URL Browser
    // Ini memperbaiki masalah 404 jika WP diinstall di subfolder (misal: localhost/folder-project)
    const currentPath = window.location.pathname; // misal: /sistemagen/wp-admin/admin.php
    
    if (currentPath.includes('/wp-admin/')) {
        // Ambil path sebelum /wp-admin/ (misal: /sistemagen/)
        const rootPath = currentPath.split('/wp-admin/')[0];
        // Susun URL lengkap
        return `${window.location.origin}${rootPath}/wp-json/umroh-manager/v1`;
    }

    // C. Fallback terakhir
    return '/wp-json/umroh-manager/v1';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': settings.nonce || '' // Nonce tetap kosong jika setting tidak ada, tapi URL sudah benar
    }
});

// 3. Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Debugging: Bantu cek URL mana yang salah
            console.error(`Gagal akses API di: ${error.config.baseURL}/${error.config.url}`, error.response.status);
            
            if (error.response.status === 401 || error.response.status === 403) {
                console.error("Izin ditolak. Cek Nonce atau Login.");
            }
        }
        return Promise.reject(error);
    }
);

export default api;