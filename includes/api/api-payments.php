<?php
/**
 * API Endpoint: Manajemen Keuangan & Pembayaran
 * Fitur: Input Bayar, Update Status Lunas Otomatis
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Payments {

    public function register_routes() {
        // GET: List Pembayaran (Laporan)
        register_rest_route('umh/v1', '/payments', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST: Input Pembayaran Baru
        register_rest_route('umh/v1', '/payments', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_payment'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        
        // GET: Cari Booking untuk Dropdown Pembayaran
        register_rest_route('umh/v1', '/payments/search-booking', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_booking'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options'); // Nanti sesuaikan role 'Finance'
    }

    /**
     * GET: Laporan Pembayaran
     */
    public function get_items($request) {
        global $wpdb;
        $table_pay = $wpdb->prefix . 'umh_payments';
        $table_bk = $wpdb->prefix . 'umh_bookings';
        
        $query = "
            SELECT p.*, b.booking_code, b.contact_name 
            FROM $table_pay p
            JOIN $table_bk b ON p.booking_id = b.id
            ORDER BY p.transaction_date DESC
        ";
        
        $items = $wpdb->get_results($query);
        return rest_ensure_response($items);
    }

    /**
     * Cari Booking (Untuk form input pembayaran)
     * Hanya tampilkan booking yang BELUM lunas (unpaid/partial)
     */
    public function search_booking($request) {
        global $wpdb;
        $term = $request->get_param('term');
        $table = $wpdb->prefix . 'umh_bookings';
        
        $query = "SELECT id, booking_code, contact_name, total_price, total_paid 
                  FROM $table 
                  WHERE (booking_code LIKE %s OR contact_name LIKE %s)
                  AND payment_status != 'paid' 
                  LIMIT 10";
                  
        $results = $wpdb->get_results($wpdb->prepare($query, '%'.$term.'%', '%'.$term.'%'));
        
        // Tambahkan info sisa tagihan
        foreach ($results as $row) {
            $row->remaining = $row->total_price - $row->total_paid;
        }
        
        return rest_ensure_response($results);
    }

    /**
     * POST: Input Pembayaran & Auto Update Booking
     */
    public function create_payment($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // 1. Validasi
        if (empty($params['booking_id']) || empty($params['amount']) || empty($params['transaction_date'])) {
            return new WP_Error('missing_data', 'Data pembayaran tidak lengkap', ['status' => 400]);
        }

        $wpdb->query('START TRANSACTION');

        try {
            $table_pay = $wpdb->prefix . 'umh_payments';
            $table_bk = $wpdb->prefix . 'umh_bookings';
            
            $booking_id = intval($params['booking_id']);
            $amount = floatval($params['amount']);

            // 2. Insert ke Tabel Payments
            $data_pay = [
                'booking_id' => $booking_id,
                'transaction_date' => sanitize_text_field($params['transaction_date']),
                'amount' => $amount,
                'method' => sanitize_text_field($params['method']),
                'bank_name' => sanitize_text_field($params['bank_name'] ?? ''),
                'status' => 'verified', // Anggap admin yang input sudah verifikasi
                'notes' => sanitize_textarea_field($params['notes'] ?? ''),
                'verified_by' => get_current_user_id()
            ];

            if ($wpdb->insert($table_pay, $data_pay) === false) {
                throw new Exception('Gagal menyimpan data pembayaran');
            }

            // 3. Update Saldo di Booking (LOGIKA PENTING)
            // Ambil data booking terbaru
            $booking = $wpdb->get_row($wpdb->prepare("SELECT total_price, total_paid FROM $table_bk WHERE id = %d", $booking_id));
            
            $new_paid = $booking->total_paid + $amount;
            $new_status = 'partial';

            if ($new_paid >= $booking->total_price) {
                $new_status = 'paid';
            } elseif ($new_paid > 0) {
                $new_status = 'partial';
            }

            // Update Booking Header
            $wpdb->update($table_bk, 
                ['total_paid' => $new_paid, 'payment_status' => $new_status], 
                ['id' => $booking_id]
            );

            // Jika Lunas, update status operasional jadi 'confirmed' jika masih pending
            if ($new_status === 'paid') {
                $wpdb->query($wpdb->prepare("UPDATE $table_bk SET status = 'confirmed' WHERE id = %d AND status = 'pending'", $booking_id));
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'message' => 'Pembayaran diterima. Status booking diperbarui.']);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('payment_failed', $e->getMessage(), ['status' => 500]);
        }
    }
}