<?php
/**
 * API Endpoint: Jadwal Keberangkatan (Inventory)
 * Menghubungkan Paket, Hotel, dan Maskapai
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Departures {

    public function register_routes() {
        register_rest_route('umh/v1', '/departures', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        register_rest_route('umh/v1', '/departures', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        register_rest_route('umh/v1', '/departures/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        register_rest_route('umh/v1', '/departures/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: List Departures (Join dengan Paket & Hotel)
     */
    public function get_items($request) {
        global $wpdb;
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';
        $table_hotel = $wpdb->prefix . 'umh_master_hotels';
        $table_air = $wpdb->prefix . 'umh_master_airlines';

        // Query Kompleks dengan JOIN
        $query = "
            SELECT 
                d.*,
                p.name as package_name,
                h_mk.name as hotel_makkah_name,
                h_md.name as hotel_madinah_name,
                a.name as airline_name,
                a.logo_url as airline_logo
            FROM $table_dep d
            LEFT JOIN $table_pkg p ON d.package_id = p.id
            LEFT JOIN $table_hotel h_mk ON d.hotel_makkah_id = h_mk.id
            LEFT JOIN $table_hotel h_md ON d.hotel_madinah_id = h_md.id
            LEFT JOIN $table_air a ON d.airline_id = a.id
            ORDER BY d.departure_date ASC
        ";

        $items = $wpdb->get_results($query);
        return rest_ensure_response($items);
    }

    /**
     * POST: Buat Jadwal Baru
     */
    public function create_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_departures';
        $params = $request->get_json_params();

        // Validasi Dasar
        if (empty($params['package_id']) || empty($params['departure_date'])) {
            return new WP_Error('missing_data', 'Paket dan Tanggal wajib diisi', ['status' => 400]);
        }

        $data = [
            'package_id' => intval($params['package_id']),
            'departure_date' => sanitize_text_field($params['departure_date']),
            'return_date' => sanitize_text_field($params['return_date']),
            'airline_id' => !empty($params['airline_id']) ? intval($params['airline_id']) : null,
            'origin_airport_id' => !empty($params['origin_airport_id']) ? intval($params['origin_airport_id']) : null,
            
            'hotel_makkah_id' => !empty($params['hotel_makkah_id']) ? intval($params['hotel_makkah_id']) : null,
            'hotel_madinah_id' => !empty($params['hotel_madinah_id']) ? intval($params['hotel_madinah_id']) : null,

            'quota' => intval($params['quota'] ?? 45),
            'available_seats' => intval($params['quota'] ?? 45),
            
            'price_quad' => floatval($params['price_quad']),
            'price_triple' => floatval($params['price_triple']),
            'price_double' => floatval($params['price_double']),
            'currency' => sanitize_text_field($params['currency'] ?? 'IDR'),

            'status' => 'open'
        ];

        if ($wpdb->insert($table, $data)) {
            return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Jadwal berhasil dibuat']);
        }

        return new WP_Error('db_error', 'Gagal menyimpan data: ' . $wpdb->last_error, ['status' => 500]);
    }

    /**
     * PUT: Update Jadwal
     */
    public function update_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_departures';
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $data = [
            'package_id' => intval($params['package_id']),
            'departure_date' => sanitize_text_field($params['departure_date']),
            'return_date' => sanitize_text_field($params['return_date']),
            'airline_id' => intval($params['airline_id']),
            'hotel_makkah_id' => intval($params['hotel_makkah_id']),
            'hotel_madinah_id' => intval($params['hotel_madinah_id']),
            'quota' => intval($params['quota']),
            'price_quad' => floatval($params['price_quad']),
            'price_triple' => floatval($params['price_triple']),
            'price_double' => floatval($params['price_double']),
            'status' => sanitize_text_field($params['status'])
        ];

        if ($wpdb->update($table, $data, ['id' => $id]) !== false) {
            return rest_ensure_response(['success' => true, 'message' => 'Jadwal berhasil diupdate']);
        }
        return new WP_Error('db_error', 'Gagal update data', ['status' => 500]);
    }

    public function delete_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_departures';
        $id = $request->get_param('id');
        $wpdb->delete($table, ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Jadwal dihapus']);
    }
}