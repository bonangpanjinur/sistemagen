import axios from 'axios';

// Konfigurasi Base URL dari variable global WordPress (wp_localize_script)
const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.umhData && window.umhData.root) {
        return window.umhData.root;
    }
    return '/wp-json/'; // Fallback default
};

const getNonce = () => {
    if (typeof window !== 'undefined' && window.umhData && window.umhData.nonce) {
        return window.umhData.nonce;
    }
    return '';
};

// Instance Axios
const api = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': getNonce()
    }
});

// Interceptor untuk menangani error global (misal sesi habis)
export const setupApiErrorInterceptor = (onSessionExpired) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response ? error.response.status : null;
            
            // Cek jika nonce invalid atau unauthorized (401/403)
            if (status === 401 || status === 403) {
                const errorCode = error.response?.data?.code;
                if (errorCode === 'rest_cookie_invalid_nonce' && onSessionExpired) {
                    onSessionExpired();
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;