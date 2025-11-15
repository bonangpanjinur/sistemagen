import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale'; // Import locale Indonesia

/**
 * Format angka menjadi mata uang Rupiah (IDR).
 * @param {number|string} amount - Jumlah uang.
 * @returns {string} - String mata uang (misal: "Rp 1.500.000").
 */
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

/**
 * Format string tanggal (misal: "2025-11-15") menjadi format "15 Nov 2025".
 * @param {string} dateString - String tanggal dari database (ISO 8601).
 * @returns {string} - Tanggal yang diformat.
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = parseISO(dateString);
        return format(date, 'd MMM yyyy', { locale: id });
    } catch (error) {
        console.error("Invalid date format for formatDate:", dateString, error);
        return dateString; // fallback
    }
};

/**
 * Format string tanggal (misal: "2025-11-15T10:00:00") menjadi format "yyyy-MM-dd".
 * Berguna untuk mengisi nilai default <input type="date">.
 * @param {string} dateString - String tanggal dari database (ISO 8601).
 * @returns {string} - Tanggal yang diformat (yyyy-MM-dd).
 */
export const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        console.error("Invalid date format for formatDateForInput:", dateString, error);
        return ''; // fallback
    }
};