import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Save, Building, Globe, Mail, Phone, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    // State form (Nanti bisa dihubungkan ke API settings jika ada)
    // Untuk MVP kita simpan di LocalStorage dulu agar persisten di browser
    const [formData, setFormData] = useState({
        company_name: 'Al-Kautsar Tour & Travel',
        address: 'Jl. Jendral Sudirman No. 123, Jakarta Selatan',
        phone: '0812-3456-7890',
        email: 'info@alkautsar.com',
        website: 'www.alkautsar-tour.com',
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        logo_url: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedSettings = localStorage.getItem('umh_general_settings');
        if (savedSettings) {
            setFormData(JSON.parse(savedSettings));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulasi Save (Nanti ganti dengan API Call)
        setTimeout(() => {
            localStorage.setItem('umh_general_settings', JSON.stringify(formData));
            toast.success('Pengaturan berhasil disimpan!');
            setLoading(false);
        }, 800);
    };

    return (
        <Layout title="Pengaturan Umum">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Identitas Perusahaan</h2>
                            <p className="text-sm text-gray-500">Informasi ini akan tampil di kop surat, invoice, dan manifest.</p>
                        </div>
                        <Building className="text-gray-300" size={48} />
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        
                        {/* Logo & Branding */}
                        <div className="flex items-start gap-6 pb-6 border-b border-gray-100">
                            <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <>
                                        <Upload size={24} className="mb-2"/>
                                        <span className="text-xs">Upload Logo</span>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Travel / Perusahaan</label>
                                    <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Slogan / Tagline</label>
                                    <input type="text" name="tagline" placeholder="Mitra Ibadah Terpercaya Anda" 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Kontak */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Phone size={14}/> Nomor Telepon / WhatsApp
                                </label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Mail size={14}/> Email Resmi
                                </label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe size={14}/> Website
                            </label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                            <textarea name="address" rows="3" value={formData.address} onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
                        </div>

                        {/* System Preference */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-md font-semibold text-gray-800 mb-4">Preferensi Sistem</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mata Uang Default</label>
                                    <select name="currency" value={formData.currency} onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                        <option value="IDR">Rupiah (IDR)</option>
                                        <option value="USD">US Dollar (USD)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Zona Waktu</label>
                                    <select name="timezone" value={formData.timezone} onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                                        <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                        <option value="Asia/Makassar">WITA (Makassar)</option>
                                        <option value="Asia/Jayapura">WIT (Jayapura)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button type="submit" disabled={loading} 
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-50">
                                <Save size={18} />
                                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;