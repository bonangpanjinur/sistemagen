import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Memformat angka menjadi format mata uang Rupiah.
 * @param {number | string} amount - Jumlah angka.
 * @returns {string} String mata uang (e.g., "Rp 1.500.000").
 */
export const formatCurrency = (amount) => {
    const number = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

/**
 * Memformat string tanggal (dari DB) menjadi format yang mudah dibaca.
 * @param {string} dateString - String tanggal (e.g., "2025-11-15 14:30:00" or "2025-11-15").
 * @returns {string} String tanggal yang diformat (e.g., "15 Nov 2025").
 */
export const formatDate = (dateString) => {
    if (!dateString) {
        return 'N/A';
    }
    try {
        const date = parseISO(dateString);
        // Cek apakah tanggal valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return format(date, 'd MMM yyyy', { locale: id });
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Invalid Date';
    }
};

/**
 * Memformat string tanggal (dari DB) menjadi format input HTML <input type="date">.
 * @param {string} dateString - String tanggal (e.g., "2025-11-15 14:30:00").
 * @returns {string} String tanggal format "yyyy-MM-dd".
 */
export const formatDateForInput = (dateString) => {
    if (!dateString) {
        return '';
    }
    try {
        const date = parseISO(dateString);
         // Cek apakah tanggal valid
        if (isNaN(date.getTime())) {
            return '';
        }
        return format(date, 'yyyy-MM-dd');
    } catch (error) {
        return '';
    }
};