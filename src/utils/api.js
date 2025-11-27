/**
 * Utility untuk menangani request ke WordPress REST API
 * Menggunakan global variable 'umhData' yang di-inject dari PHP
 */

// Pastikan object global tersedia untuk mencegah error saat build/test
const umhConfig = window.umhData || {
    root: '',
    nonce: '',
    user: null
};

/**
 * Helper untuk melakukan fetch dengan Header WP Nonce otomatis
 */
const apiFetch = async (endpoint, options = {}) => {
    const { root, nonce } = umhConfig;
    
    // Hapus slash di awal endpoint jika ada, agar url rapi
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${root}umroh-manager/v1/${cleanEndpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce, // KUNCI KEAMANAN: Wajib ada untuk metode POST/PUT/DELETE
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.code || 'Terjadi kesalahan pada server.');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

export default {
    // GET Requests
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    
    // POST Requests (Create)
    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    
    // PUT Requests (Update)
    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    
    // DELETE Requests
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
    
    // Helper untuk Upload File (Multipart)
    upload: async (endpoint, formData) => {
        const { root, nonce } = umhConfig;
        const url = `${root}umroh-manager/v1/${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-WP-Nonce': nonce,
                // Content-Type jangan di-set manual untuk FormData, browser akan menanganinya
            },
            body: formData
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal mengupload file');
        return data;
    },

    // Getter untuk info user saat ini
    getCurrentUser: () => umhConfig.user
};