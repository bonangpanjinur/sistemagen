import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';

// Komponen Login Kustom
const CustomLoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState(''); // [PERBAIKAN] Diubah dari username
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const wpData = window.umh_wp_data || { api_url: '/wp-json/umh/v1/' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${wpData.api_url}users/login`, {
                method: 'POST',
                headers: { // [PERBAIKAN] Menambahkan header yang hilang
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }), // [PERBAIKAN] Mengirim 'email'
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login gagal.');
            }
            onLoginSuccess(data);

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginBox}>
                <h2 style={styles.loginTitle}>Login Aplikasi</h2>
                <p style={styles.loginSubtitle}>Silakan masuk (Owner/Karyawan)</p>
                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>Email</label> {/* [PERBAIKAN] Label diubah */}
                        <input
                            type="email" // [PERBAIKAN] Tipe diubah
                            id="email"
                            style={styles.input}
                            value={email} // [PERBAIKAN] Value diubah
                            onChange={(e) => setEmail(e.target.value)} // [PERBAIKAN] Handler diubah
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- (Poin 1, 2, 4) Logika Autentikasi ---

// 1. Buat API Client (Helper)
const createApiClient = (getToken) => {
    const request = async (endpoint, options = {}) => {
        const token = getToken();
        const wpData = window.umh_wp_data || { api_url: '/wp-json/umh/v1/' };
        const headers = {
            'Content-Type': 'application/json',
        };

        // Tambahkan token jika ada
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // [PERBAIKAN] Selalu kirim Nonce jika ini admin WP
        if (window.umh_wp_data?.is_wp_admin && window.umh_wp_data?.api_nonce) {
             headers['X-WP-Nonce'] = window.umh_wp_data.api_nonce;
        }


        const response = await fetch(`${wpData.api_url}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error ${response.status}`);
        }
        
        if (response.status === 204) {
            return null;
        }
        return response.json();
    };

    return {
        get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
        post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
        put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
        del: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
    };
};

// 2. Buat Konteks Autentikasi
const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('umh_auth_token'));
    const [isLoading, setIsLoading] = useState(true);
    const apiClient = createApiClient(() => token);

    // Efek untuk memuat user saat startup (Poin 1, 2, 4)
    useEffect(() => {
        const bootstrapAuth = async () => {
            const wpData = window.umh_wp_data;
            const existingToken = localStorage.getItem('umh_auth_token');
            try {
                // Skenario 1: Ini adalah Admin WP (Poin 1 & 2)
                if (wpData && wpData.is_wp_admin) {
                    console.log('Admin WP terdeteksi, mencoba auto-login...');
                    try {
                        const response = await fetch(`${wpData.api_url}auth/wp-login`, {
                            method: 'POST',
                            headers: {
                                'X-WP-Nonce': wpData.api_nonce, 
                                'Content-Type': 'application/json',
                            },
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'WP Admin auto-login gagal.');
                        }
                        
                        const data = await response.json(); // { token, user }
                        console.log('WP Admin auto-login berhasil.');
                        setToken(data.token);
                        setUser(data.user);
                        localStorage.setItem('umh_auth_token', data.token);
                        
                    } catch (adminLoginError) {
                        console.error('WP Admin auto-login error:', adminLoginError);
                        // Hapus token yang mungkin rusak
                        localStorage.removeItem('umh_auth_token');
                        setToken(null);
                        setUser(null);
                    }
                
                // Skenario 2: Bukan Admin WP, tapi ada token di localStorage
                } else if (existingToken) {
                    console.log('Token lokal ditemukan, memverifikasi...');
                    try {
                        // Set token sementara agar apiClient bisa menggunakannya
                        const apiClientForVerify = createApiClient(() => existingToken);
                        const userData = await apiClientForVerify.get('users/me');
                        
                        console.log('Verifikasi token berhasil.');
                        setUser(userData);
                        setToken(existingToken); // Konfirmasi token
                    
                    } catch (verifyError) {
                        // Token tidak valid atau kedaluwarsa
                        console.warn('Verifikasi token gagal:', verifyError);
                        localStorage.removeItem('umh_auth_token');
                        setToken(null);
                        setUser(null);
                    }

                // Skenario 3: Bukan Admin WP & tidak ada token (Poin 4)
                } else {
                    console.log('Bukan admin & tidak ada token. Tampilkan login.');
                }

            } catch (error) {
                console.error('Bootstrap auth error:', error);
                localStorage.removeItem('umh_auth_token');
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAuth();
    }, []); // Hanya jalankan sekali

    // Fungsi yang dipanggil oleh CustomLoginForm
    const handleLoginSuccess = (data) => {
        console.log('Login kustom berhasil.');
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('umh_auth_token', data.token);
    };

    // Fungsi Logout
    const logout = () => {
        console.log('Logout.');
        setToken(null);
        setUser(null);
        localStorage.removeItem('umh_auth_token');
        // Kita tidak perlu "logout" dari WP, hanya dari app React
    };
    const authContextValue = {
        user,
        token,
        isLoading,
        api: apiClient, // Berikan API client ke seluruh app
        logout,
        login: handleLoginSuccess, // Berikan ini ke CustomLoginForm
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook kustom untuk menggunakan konteks
const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
};
// --- Komponen Aplikasi Utama ---

const DashboardComponent = () => {
    const { user, logout, api } = useAuth();
    const [jamaah, setJamaah] = useState(null);
    const [loadingData, setLoadingData] = useState(false);
    
    const loadJamaah = async () => {
        setLoadingData(true);
        try {
            const data = await api.get('jamaah');
            setJamaah(data);
        } catch (error) {
            console.error("Gagal mengambil data jamaah:", error);
            if (error.message.includes('401') || error.message.includes('Token') || error.message.includes('403')) {
                logout(); // Token mungkin tidak valid, paksa logout
            }
        } finally {
            setLoadingData(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h1>Dashboard React</h1>
                <div>
                    <span>Halo, <strong>{user?.full_name || user?.username}</strong> ({user?.role})</span>
                    <button onClick={logout} style={{ marginLeft: '15px' }}>Logout</button>
                </div>
            </header>
            
            <main style={{ marginTop: '20px' }}>
                <h2>Konten Dashboard</h2>
                <p>Ini adalah area dashboard yang aman.</p>
                
                <button onClick={loadJamaah} disabled={loadingData}>
                    {loadingData ? "Memuat..." : "Test Ambil Data Jamaah (Aman)"}
                </button>
                
                {jamaah && (
                    <div style={{ marginTop: '15px' }}>
                        <h3>Data Jamaah (Contoh):</h3>
                        <pre style={{ background: '#f4f4f4', padding: '10px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                            {JSON.stringify(jamaah, null, 2)}
                        </pre>
                    </div>
                )}
            </main>
        </div>
    );
};

// Komponen App Utama (Router)
const App = () => {
    const { user, isLoading, login } = useAuth();
    if (isLoading) {
        return <div style={styles.loading}>Memuat Autentikasi...</div>;
    }

    // (Poin 4) Jika tidak ada user, tampilkan login kustom
    if (!user) {
        return <CustomLoginForm onLoginSuccess={login} />;
    }
    // (Poin 1 & 4) Jika ada user, tampilkan dashboard
    return <DashboardComponent />;
};
// Render Aplikasi
const rootElement = document.getElementById('umh-react-app-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}

// --- Styles untuk Login & Loading ---
const styles = {
    loginContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        backgroundColor: '#f9f9f9',
    },
    loginBox: {
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    loginTitle: {
        fontSize: '24px',
        fontWeight: '600',
        margin: '0 0 10px',
    },
    loginSubtitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '30px',
    },
    inputGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box', // Penting
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '15px',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#007cba', // Warna biru WP
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    error: {
        color: '#d93030',
        fontSize: '13px',
        marginBottom: '15px',
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        fontSize: '18px',
        fontWeight: '500',
    }
};