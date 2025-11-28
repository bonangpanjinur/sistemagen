<?php
/**
 * API Endpoint: Manajemen Logistik & Perlengkapan
 * Fitur: Checklist pengambilan barang (Koper, Batik, dll) per jemaah
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Logistics {

    public function register_routes() {
        // GET Data Logistik per Keberangkatan
        register_rest_route('umh/v1', '/logistics/(?P<departure_id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_logistics_data'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Update Status Barang (Ambil/Belum)
        register_rest_route('umh/v1', '/logistics/update', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_item_status'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: Ambil Manifest + Status Barang
     */
    public function get_logistics_data($request) {
        global $wpdb;
        $dep_id = $request->get_param('departure_id');
        
        $table_pax = $wpdb->prefix . 'umh_booking_passengers';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        $table_log = $wpdb->prefix . 'umh_logistics_distribution';
        $table_bk = $wpdb->prefix . 'umh_bookings';

        // 1. Ambil Semua Jemaah di Keberangkatan Ini
        $passengers = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                bp.id as passenger_id, 
                j.full_name, j.gender, j.clothing_size,
                b.booking_code
             FROM $table_pax bp
             JOIN $table_jamaah j ON bp.jamaah_id = j.id
             JOIN $table_bk b ON bp.booking_id = b.id
             WHERE b.departure_id = %d AND bp.status = 'active'
             ORDER BY j.full_name ASC",
            $dep_id
        ));

        // 2. Ambil Data Logistik yang SUDAH diambil
        $log_data = $wpdb->get_results($wpdb->prepare(
            "SELECT passenger_id, item_name, status, taken_date 
             FROM $table_log 
             WHERE passenger_id IN (
                SELECT bp.id FROM $table_pax bp 
                JOIN $table_bk b ON bp.booking_id = b.id 
                WHERE b.departure_id = %d
             )",
            $dep_id
        ));

        // 3. Gabungkan Data (Mapping)
        // Format: pax_id => ['Koper' => {status: 'taken'}, 'Batik' => {...}]
        $log_map = [];
        foreach ($log_data as $log) {
            $log_map[$log->passenger_id][$log->item_name] = $log;
        }

        foreach ($passengers as $pax) {
            $pax->items = isset($log_map[$pax->passenger_id]) ? $log_map[$pax->passenger_id] : [];
        }

        return rest_ensure_response($passengers);
    }

    /**
     * POST: Update Status Barang (Toggle)
     */
    public function update_item_status($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_logistics_distribution';

        $passenger_id = intval($params['passenger_id']);
        $item_name = sanitize_text_field($params['item_name']);
        $action = sanitize_text_field($params['action']); // 'take' or 'return'

        if ($action === 'take') {
            // Insert or Update to 'taken'
            // Cek dulu apakah sudah ada row-nya
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table WHERE passenger_id = %d AND item_name = %s",
                $passenger_id, $item_name
            ));

            if ($exists) {
                $wpdb->update($table, 
                    ['status' => 'taken', 'taken_date' => current_time('mysql'), 'taken_by' => get_current_user_id()], 
                    ['id' => $exists]
                );
            } else {
                $wpdb->insert($table, [
                    'passenger_id' => $passenger_id,
                    'item_name' => $item_name,
                    'status' => 'taken',
                    'taken_date' => current_time('mysql'),
                    'qty' => 1,
                    'taken_by' => get_current_user_id()
                ]);
            }
        } else {
            // Hapus atau set pending (Kita hapus saja biar bersih)
            $wpdb->query($wpdb->prepare(
                "DELETE FROM $table WHERE passenger_id = %d AND item_name = %s",
                $passenger_id, $item_name
            ));
        }

        return rest_ensure_response(['success' => true]);
    }
}