// Mengambil data dari variabel global yang di-localize oleh WordPress
const umhData = window.umhData || window.umh_data || {};

const API_ROOT = umhData.root || '/wp-json/umh/v1/';
const NONCE = umhData.nonce || '';

/**
 * Melakukan request API ke backend WordPress
 * @param {string} endpoint - Endpoint API (misal: 'agents')
 * @param {object} options - Opsi fetch (method, body, dll)
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_ROOT}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-WP-Nonce': NONCE,
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        
        // Handle 401/403 (Unauthorized/Forbidden)
        if (response.status === 401 || response.status === 403) {
            console.error('Sesi berakhir atau tidak memiliki izin.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan pada server');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Helper methods untuk CRUD
export const api = {
    get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
    post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: data }),
    put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: data }),
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

// Tambahkan default export untuk menangani import api from '...'
export default api;