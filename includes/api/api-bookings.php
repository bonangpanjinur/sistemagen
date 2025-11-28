<?php
/**
 * API Endpoint: Transaksi Booking (Lengkap)
 * Menangani: Create, List, Detail, Cancel
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Bookings {

    public function register_routes() {
        // GET List Bookings
        register_rest_route('umh/v1', '/bookings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // GET Single Booking Detail
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_item_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Create (Sudah ada sebelumnya)
        register_rest_route('umh/v1', '/bookings/create', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_booking'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        
        // ... (Route search_departures & search_jamaah tetap ada)
        register_rest_route('umh/v1', '/bookings/departures', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_departures'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/bookings/jamaah-search', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_jamaah'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: List Semua Transaksi (Untuk Tabel Halaman Bookings)
     */
    public function get_items($request) {
        global $wpdb;
        $table_bk = $wpdb->prefix . 'umh_bookings';
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';

        // Filter status (opsional)
        $status = $request->get_param('status');
        $where = "";
        if ($status) {
            $where = $wpdb->prepare(" WHERE b.status = %s", $status);
        }

        $query = "
            SELECT 
                b.id, b.booking_code, b.contact_name, b.contact_phone, 
                b.total_pax, b.total_price, b.total_paid, b.payment_status, b.status, b.booking_date,
                d.departure_date, p.name as package_name
            FROM $table_bk b
            LEFT JOIN $table_dep d ON b.departure_id = d.id
            LEFT JOIN $table_pkg p ON d.package_id = p.id
            $where
            ORDER BY b.booking_date DESC
        ";

        $items = $wpdb->get_results($query);
        return rest_ensure_response($items);
    }

    /**
     * GET: Detail Satu Transaksi (Header + Passengers + Payments)
     */
    public function get_item_detail($request) {
        global $wpdb;
        $booking_id = $request->get_param('id');
        
        // 1. Ambil Header
        $booking = $wpdb->get_row($wpdb->prepare(
            "SELECT b.*, d.departure_date, p.name as package_name 
             FROM {$wpdb->prefix}umh_bookings b
             JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
             JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
             WHERE b.id = %d", 
            $booking_id
        ));

        if (!$booking) return new WP_Error('not_found', 'Booking tidak ditemukan', ['status' => 404]);

        // 2. Ambil Passengers
        $passengers = $wpdb->get_results($wpdb->prepare(
            "SELECT bp.*, j.full_name, j.nik, j.passport_number, j.gender
             FROM {$wpdb->prefix}umh_booking_passengers bp
             JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id
             WHERE bp.booking_id = %d",
            $booking_id
        ));

        // 3. Ambil Riwayat Pembayaran
        $payments = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}umh_payments WHERE booking_id = %d ORDER BY transaction_date DESC",
            $booking_id
        ));

        $booking->passengers = $passengers;
        $booking->payments = $payments;

        return rest_ensure_response($booking);
    }

    // ... (Method create_booking, search_departures, search_jamaah TETAP SAMA seperti sebelumnya)
    // Pastikan kode create_booking yang saya berikan sebelumnya dicopy paste kembali ke sini agar tidak hilang.
    
    public function search_departures($request) {
        global $wpdb;
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';
        $search = $request->get_param('search');
        $query = "SELECT d.id, d.departure_date, p.name as package_name, d.price_quad, d.price_triple, d.price_double, d.available_seats FROM $table_dep d JOIN $table_pkg p ON d.package_id = p.id WHERE d.status = 'open'";
        if ($search) $query .= $wpdb->prepare(" AND p.name LIKE %s", '%' . $search . '%');
        $results = $wpdb->get_results($query . " ORDER BY d.departure_date ASC LIMIT 20");
        return rest_ensure_response($results);
    }

    public function search_jamaah($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $term = $request->get_param('term');
        if (strlen($term) < 3) return [];
        $query = $wpdb->prepare("SELECT * FROM $table WHERE full_name LIKE %s OR nik LIKE %s LIMIT 10", '%' . $term . '%', '%' . $term . '%');
        $results = $wpdb->get_results($query);
        return rest_ensure_response($results);
    }

    public function create_booking($request) {
        global $wpdb;
        $params = $request->get_json_params();
        if (empty($params['departure_id']) || empty($params['contact_name']) || empty($params['passengers'])) {
            return new WP_Error('missing_data', 'Data tidak lengkap', array('status' => 400));
        }
        $wpdb->query('START TRANSACTION');
        try {
            $date_code = date('ym');
            $rand = strtoupper(substr(md5(uniqid()), 0, 4));
            $booking_code = "TRX-{$date_code}-{$rand}";
            $total_price = 0;
            $departure_id = $params['departure_id'];
            $dep_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_departures WHERE id = %d", $departure_id));
            if (!$dep_data) throw new Exception("Jadwal tidak ditemukan");
            
            $table_booking = $wpdb->prefix . 'umh_bookings';
            $booking_data = array(
                'booking_code' => $booking_code,
                'departure_id' => $departure_id,
                'contact_name' => sanitize_text_field($params['contact_name']),
                'contact_phone' => sanitize_text_field($params['contact_phone']),
                'contact_email' => sanitize_email($params['contact_email']),
                'agent_id' => !empty($params['agent_id']) ? intval($params['agent_id']) : null,
                'total_pax' => count($params['passengers']),
                'total_price' => 0, 
                'status' => 'pending',
                'created_by' => get_current_user_id()
            );
            if ($wpdb->insert($table_booking, $booking_data) === false) throw new Exception("Gagal booking header");
            $booking_id = $wpdb->insert_id;

            $table_pax = $wpdb->prefix . 'umh_booking_passengers';
            $table_jamaah = $wpdb->prefix . 'umh_jamaah';
            foreach ($params['passengers'] as $pax) {
                $jamaah_id = 0;
                if (!empty($pax['existing_id'])) {
                    $jamaah_id = intval($pax['existing_id']);
                } else {
                    $jamaah_data = array(
                        'full_name' => sanitize_text_field($pax['full_name']),
                        'nik' => sanitize_text_field($pax['nik']),
                        'gender' => $pax['gender'],
                        'phone' => sanitize_text_field($pax['phone']),
                    );
                    $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_jamaah WHERE nik = %s", $pax['nik']));
                    if ($exist) $jamaah_id = $exist;
                    else {
                        if ($wpdb->insert($table_jamaah, $jamaah_data) === false) throw new Exception("Gagal simpan jemaah");
                        $jamaah_id = $wpdb->insert_id;
                    }
                }
                $price_pax = 0;
                switch ($pax['room_type']) {
                    case 'quad': $price_pax = $dep_data->price_quad; break;
                    case 'triple': $price_pax = $dep_data->price_triple; break;
                    case 'double': $price_pax = $dep_data->price_double; break;
                    default: $price_pax = $dep_data->price_quad;
                }
                $total_price += $price_pax;
                $pax_insert = array(
                    'booking_id' => $booking_id, 'jamaah_id' => $jamaah_id, 'room_type' => $pax['room_type'], 'price_pax' => $price_pax, 'visa_status' => 'pending', 'status' => 'active'
                );
                if ($wpdb->insert($table_pax, $pax_insert) === false) throw new Exception("Gagal simpan detail");
            }
            $wpdb->update($table_booking, array('total_price' => $total_price), array('id' => $booking_id));
            $wpdb->query('COMMIT');
            return rest_ensure_response(array('success' => true, 'booking_id' => $booking_id, 'booking_code' => $booking_code));
        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('booking_failed', $e->getMessage(), array('status' => 500));
        }
    }
}