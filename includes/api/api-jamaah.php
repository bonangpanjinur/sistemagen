<?php
/**
 * API Endpoint: Manajemen Data Jemaah (CRM)
 * Menangani: CRUD Profil, Cek Duplikat NIK, History Perjalanan
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Jamaah {

    public function register_routes() {
        // GET List Jemaah (Pagination + Search)
        register_rest_route('umh/v1', '/jamaah', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // GET Single Detail + History Booking
        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_item_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Create
        register_rest_route('umh/v1', '/jamaah', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // PUT Update
        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // DELETE
        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET List Jemaah
     */
    public function get_items($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        
        $search = $request->get_param('search');
        $page = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $where = "WHERE 1=1";
        if ($search) {
            $where .= $wpdb->prepare(" AND (full_name LIKE %s OR nik LIKE %s OR passport_number LIKE %s)", "%$search%", "%$search%", "%$search%");
        }

        // Get Data
        $items = $wpdb->get_results("SELECT id, full_name, nik, passport_number, gender, city, phone FROM $table $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
        
        // Get Total Count (Untuk Pagination)
        $total = $wpdb->get_var("SELECT COUNT(id) FROM $table $where");

        return rest_ensure_response([
            'data' => $items,
            'total' => intval($total),
            'page' => $page,
            'total_pages' => ceil($total / $limit)
        ]);
    }

    /**
     * GET Single Detail
     */
    public function get_item_detail($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $table_j = $wpdb->prefix . 'umh_jamaah';
        $table_pax = $wpdb->prefix . 'umh_booking_passengers';
        $table_bk = $wpdb->prefix . 'umh_bookings';
        $table_dep = $wpdb->prefix . 'umh_departures';
        $table_pkg = $wpdb->prefix . 'umh_packages';

        // 1. Profil Utama
        $jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_j WHERE id = %d", $id));
        if (!$jamaah) return new WP_Error('not_found', 'Jemaah tidak ditemukan', ['status' => 404]);

        // 2. History Perjalanan
        $history = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                bp.id as passenger_id, bp.status, 
                b.booking_code, 
                d.departure_date, 
                p.name as package_name
             FROM $table_pax bp
             JOIN $table_bk b ON bp.booking_id = b.id
             JOIN $table_dep d ON b.departure_id = d.id
             JOIN $table_pkg p ON d.package_id = p.id
             WHERE bp.jamaah_id = %d
             ORDER BY d.departure_date DESC",
            $id
        ));

        $jamaah->history = $history;
        return rest_ensure_response($jamaah);
    }

    /**
     * POST Create
     */
    public function create_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $params = $request->get_json_params();

        // Validasi
        if (empty($params['full_name']) || empty($params['gender'])) {
            return new WP_Error('missing_data', 'Nama Lengkap dan Gender wajib diisi', ['status' => 400]);
        }

        // Cek Duplikat NIK
        if (!empty($params['nik'])) {
            $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE nik = %s", $params['nik']));
            if ($exist) return new WP_Error('duplicate_nik', 'NIK sudah terdaftar di sistem', ['status' => 409]);
        }

        $data = [
            'full_name' => sanitize_text_field($params['full_name']),
            'full_name_ar' => sanitize_text_field($params['full_name_ar'] ?? ''),
            'nik' => sanitize_text_field($params['nik'] ?? ''),
            'passport_number' => sanitize_text_field($params['passport_number'] ?? ''),
            'gender' => sanitize_text_field($params['gender']),
            'birth_place' => sanitize_text_field($params['birth_place'] ?? ''),
            'birth_date' => !empty($params['birth_date']) ? $params['birth_date'] : null,
            'phone' => sanitize_text_field($params['phone'] ?? ''),
            'email' => sanitize_email($params['email'] ?? ''),
            'address' => sanitize_textarea_field($params['address'] ?? ''),
            'city' => sanitize_text_field($params['city'] ?? ''),
            'job_title' => sanitize_text_field($params['job_title'] ?? ''),
            'disease_history' => sanitize_textarea_field($params['disease_history'] ?? ''),
            'clothing_size' => sanitize_text_field($params['clothing_size'] ?? ''),
            'father_name' => sanitize_text_field($params['father_name'] ?? ''),
        ];

        if ($wpdb->insert($table, $data)) {
            return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Data Jemaah Tersimpan']);
        }
        return new WP_Error('db_error', 'Gagal menyimpan data', ['status' => 500]);
    }

    /**
     * PUT Update
     */
    public function update_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $data = [
            'full_name' => sanitize_text_field($params['full_name']),
            'full_name_ar' => sanitize_text_field($params['full_name_ar'] ?? ''),
            'nik' => sanitize_text_field($params['nik'] ?? ''),
            'passport_number' => sanitize_text_field($params['passport_number'] ?? ''),
            'gender' => sanitize_text_field($params['gender']),
            'birth_place' => sanitize_text_field($params['birth_place'] ?? ''),
            'birth_date' => !empty($params['birth_date']) ? $params['birth_date'] : null,
            'phone' => sanitize_text_field($params['phone'] ?? ''),
            'email' => sanitize_email($params['email'] ?? ''),
            'address' => sanitize_textarea_field($params['address'] ?? ''),
            'city' => sanitize_text_field($params['city'] ?? ''),
            'job_title' => sanitize_text_field($params['job_title'] ?? ''),
            'disease_history' => sanitize_textarea_field($params['disease_history'] ?? ''),
            'clothing_size' => sanitize_text_field($params['clothing_size'] ?? ''),
            'father_name' => sanitize_text_field($params['father_name'] ?? ''),
        ];

        if ($wpdb->update($table, $data, ['id' => $id]) !== false) {
            return rest_ensure_response(['success' => true, 'message' => 'Data Jemaah Diupdate']);
        }
        return new WP_Error('db_error', 'Gagal update data', ['status' => 500]);
    }

    public function delete_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request->get_param('id');
        // Bisa tambahkan cek apakah jemaah ini punya history transaksi
        $wpdb->delete($table, ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Data Jemaah Dihapus']);
    }
}