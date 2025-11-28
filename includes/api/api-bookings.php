<?php
/**
 * API Endpoint: Transaksi Booking (Updated V3)
 * Fitur: Create Booking + Auto Calculate Agent Commission
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Bookings {

    public function register_routes() {
        // ... (Route GET List & Detail tetap sama, tidak saya tulis ulang agar hemat tempat) ...
        register_rest_route('umh/v1', '/bookings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_item_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        
        // POST Create (LOGIC BARU ADA DI SINI)
        register_rest_route('umh/v1', '/bookings/create', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_booking'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // Helper Routes
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
        
        // NEW: Get Active Agents for Dropdown
        register_rest_route('umh/v1', '/bookings/agents-list', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_agents_list'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    // ... (Method get_items, get_item_detail, search_departures, search_jamaah TETAP SAMA) ...
    public function get_items($request) {
        global $wpdb;
        $table_bk = $wpdb->prefix . 'umh_bookings';
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';
        $status = $request->get_param('status');
        $where = "";
        if ($status) $where = $wpdb->prepare(" WHERE b.status = %s", $status);
        $query = "SELECT b.id, b.booking_code, b.contact_name, b.contact_phone, b.total_pax, b.total_price, b.total_paid, b.payment_status, b.status, b.booking_date, d.departure_date, p.name as package_name FROM $table_bk b LEFT JOIN $table_dep d ON b.departure_id = d.id LEFT JOIN $table_pkg p ON d.package_id = p.id $where ORDER BY b.booking_date DESC";
        return rest_ensure_response($wpdb->get_results($query));
    }

    public function get_item_detail($request) {
        global $wpdb;
        $booking_id = $request->get_param('id');
        $booking = $wpdb->get_row($wpdb->prepare("SELECT b.*, d.departure_date, p.name as package_name FROM {$wpdb->prefix}umh_bookings b JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id WHERE b.id = %d", $booking_id));
        if (!$booking) return new WP_Error('not_found', 'Booking tidak ditemukan', ['status' => 404]);
        $passengers = $wpdb->get_results($wpdb->prepare("SELECT bp.*, j.full_name, j.nik, j.passport_number, j.gender FROM {$wpdb->prefix}umh_booking_passengers bp JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id WHERE bp.booking_id = %d", $booking_id));
        $payments = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_payments WHERE booking_id = %d ORDER BY transaction_date DESC", $booking_id));
        $booking->passengers = $passengers;
        $booking->payments = $payments;
        return rest_ensure_response($booking);
    }

    public function search_departures($request) {
        global $wpdb;
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';
        $search = $request->get_param('search');
        $query = "SELECT d.id, d.departure_date, p.name as package_name, d.price_quad, d.price_triple, d.price_double, d.available_seats FROM $table_dep d JOIN $table_pkg p ON d.package_id = p.id WHERE d.status = 'open'";
        if ($search) $query .= $wpdb->prepare(" AND p.name LIKE %s", '%' . $search . '%');
        return rest_ensure_response($wpdb->get_results($query . " ORDER BY d.departure_date ASC LIMIT 20"));
    }

    public function search_jamaah($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $term = $request->get_param('term');
        if (strlen($term) < 3) return [];
        $query = $wpdb->prepare("SELECT * FROM $table WHERE full_name LIKE %s OR nik LIKE %s LIMIT 10", '%' . $term . '%', '%' . $term . '%');
        return rest_ensure_response($wpdb->get_results($query));
    }

    public function get_agents_list() {
        global $wpdb;
        $query = "SELECT a.id, a.agent_code, u.display_name FROM {$wpdb->prefix}umh_agents a JOIN {$wpdb->users} u ON a.user_id = u.ID WHERE a.status = 'active'";
        return rest_ensure_response($wpdb->get_results($query));
    }

    /**
     * INTI FITUR: Create Booking Transaction + COMMISSION
     */
    public function create_booking($request) {
        global $wpdb;
        $params = $request->get_json_params();

        if (empty($params['departure_id']) || empty($params['contact_name']) || empty($params['passengers'])) {
            return new WP_Error('missing_data', 'Data tidak lengkap', array('status' => 400));
        }

        $wpdb->query('START TRANSACTION');

        try {
            // 1. Generate Code
            $date_code = date('ym');
            $rand = strtoupper(substr(md5(uniqid()), 0, 4));
            $booking_code = "TRX-{$date_code}-{$rand}";

            // 2. Get Inventory Price
            $departure_id = $params['departure_id'];
            $dep_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_departures WHERE id = %d", $departure_id));
            if (!$dep_data) throw new Exception("Jadwal tidak ditemukan");

            // 3. Insert Header
            $table_booking = $wpdb->prefix . 'umh_bookings';
            $agent_id = !empty($params['agent_id']) ? intval($params['agent_id']) : null;

            $booking_data = array(
                'booking_code' => $booking_code,
                'departure_id' => $departure_id,
                'contact_name' => sanitize_text_field($params['contact_name']),
                'contact_phone' => sanitize_text_field($params['contact_phone']),
                'contact_email' => sanitize_email($params['contact_email']),
                'agent_id' => $agent_id,
                'total_pax' => count($params['passengers']),
                'total_price' => 0, 
                'status' => 'pending',
                'created_by' => get_current_user_id()
            );

            if ($wpdb->insert($table_booking, $booking_data) === false) {
                throw new Exception("Gagal membuat booking header: " . $wpdb->last_error);
            }
            $booking_id = $wpdb->insert_id;

            // 4. Insert Passengers & Calculate Total
            $total_price = 0;
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
                        if ($wpdb->insert($table_jamaah, $jamaah_data) === false) throw new Exception("Gagal simpan data jemaah");
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
                    'booking_id' => $booking_id,
                    'jamaah_id' => $jamaah_id,
                    'room_type' => $pax['room_type'],
                    'price_pax' => $price_pax,
                    'status' => 'active'
                );
                if ($wpdb->insert($table_pax, $pax_insert) === false) throw new Exception("Gagal simpan detail penumpang");
            }

            // 5. Update Total Price
            $wpdb->update($table_booking, array('total_price' => $total_price), array('id' => $booking_id));

            // --- [INTEGRASI BARU] HITUNG KOMISI AGEN ---
            if ($agent_id) {
                // Ambil settingan komisi agen
                $agent = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_agents WHERE id = %d", $agent_id));
                
                if ($agent) {
                    $commission_amount = 0;
                    
                    // Rumus 1: Komisi Tetap per Jemaah
                    if ($agent->fixed_commission > 0) {
                        $commission_amount += ($agent->fixed_commission * count($params['passengers']));
                    }
                    
                    // Rumus 2: Komisi Persentase dari Total Harga
                    if ($agent->commission_rate > 0) {
                        $commission_amount += ($total_price * ($agent->commission_rate / 100));
                    }

                    if ($commission_amount > 0) {
                        $wpdb->insert($wpdb->prefix . 'umh_commissions', [
                            'agent_id' => $agent_id,
                            'booking_id' => $booking_id,
                            'amount' => $commission_amount,
                            'description' => "Komisi Booking $booking_code (" . count($params['passengers']) . " Pax)",
                            'status' => 'pending', // Pending sampai dibayar admin
                            'created_at' => current_time('mysql')
                        ]);
                    }
                }
            }
            // --- END INTEGRASI ---

            $wpdb->query('COMMIT');

            return rest_ensure_response(array(
                'success' => true,
                'booking_id' => $booking_id,
                'booking_code' => $booking_code,
                'message' => 'Booking berhasil! Komisi agen (jika ada) telah tercatat.'
            ));

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('booking_failed', $e->getMessage(), array('status' => 500));
        }
    }
}