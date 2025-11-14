<?php
// File: includes/api/api-jamaah.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Registrasi endpoint untuk jamaah
function umh_register_jamaah_api_routes() {
    
    // GET all jamaah (dengan filter)
    register_rest_route('umh/v1', '/jamaah', [
        'methods' => 'GET',
        'callback' => 'umh_get_all_jamaah',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // POST create new jamaah
    register_rest_route('umh/v1', '/jamaah', [
        'methods' => 'POST',
        'callback' => 'umh_create_jamaah',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // GET specific jamaah by ID
    register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'umh_get_jamaah_by_id',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // PUT update jamaah by ID
    register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'umh_update_jamaah',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // DELETE jamaah by ID
    register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'umh_delete_jamaah',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // GET jamaah by package ID
    register_rest_route('umh/v1', '/packages/(?P<package_id>\d+)/jamaah', [
        'methods' => 'GET',
        'callback' => 'umh_get_jamaah_by_package',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);
}
add_action('rest_api_init', 'umh_register_jamaah_api_routes');


// --- Implementasi Callback ---
// (Tetap sama seperti sebelumnya, karena keamanan ditangani oleh permission_callback)

function umh_get_all_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $package_id = $request->get_param('package_id');

    $query = "SELECT * FROM $table_name";
    if (!empty($package_id)) {
        $query .= $wpdb->prepare(" WHERE package_id = %d", (int)$package_id);
    }

    $results = $wpdb->get_results($query);
    return new WP_REST_Response($results, 200);
}

function umh_create_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $params = $request->get_json_params();

    // Validasi data (contoh sederhana)
    if (empty($params['full_name']) || empty($params['package_id'])) {
        return new WP_Error('missing_params', 'Nama lengkap dan ID Paket tidak boleh kosong.', ['status' => 400]);
    }

    $data = [
        'package_id' => (int)$params['package_id'],
        'full_name' => sanitize_text_field($params['full_name']),
        'passport_no' => sanitize_text_field($params['passport_no'] ?? ''),
        'ktp_no' => sanitize_text_field($params['ktp_no'] ?? ''),
        'birth_date' => sanitize_text_field($params['birth_date'] ?? null),
        'gender' => sanitize_text_field($params['gender'] ?? 'Laki-laki'),
        'phone_number' => sanitize_text_field($params['phone_number'] ?? ''),
        'address' => sanitize_textarea_field($params['address'] ?? ''),
        'status' => sanitize_text_field($params['status'] ?? 'Pending'),
        // tambahkan field lain sesuai kebutuhan
    ];
    
    // Hapus null values agar default database bisa diterapkan
    $data = array_filter($data, function($value) { return $value !== null; });

    $wpdb->insert($table_name, $data);
    $new_id = $wpdb->insert_id;

    if ($new_id) {
        $new_jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE jamaah_id = %d", $new_id));
        return new WP_REST_Response($new_jamaah, 201);
    } else {
        return new WP_Error('create_failed', 'Gagal menambahkan jamaah.', ['status' => 500]);
    }
}

function umh_get_jamaah_by_id(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $jamaah_id = (int) $request['id'];

    $jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE jamaah_id = %d", $jamaah_id));

    if (!$jamaah) {
        return new WP_Error('not_found', 'Jamaah tidak ditemukan.', ['status' => 404]);
    }

    return new WP_REST_Response($jamaah, 200);
}

function umh_update_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $jamaah_id = (int) $request['id'];

    $jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE jamaah_id = %d", $jamaah_id));
    if (!$jamaah) {
        return new WP_Error('not_found', 'Jamaah tidak ditemukan.', ['status' => 404]);
    }

    $params = $request->get_json_params();
    $update_data = [];

    // Daftar field yang diizinkan untuk diupdate
    $allowed_fields = ['package_id', 'full_name', 'passport_no', 'ktp_no', 'birth_date', 'gender', 'phone_number', 'address', 'status'];
    
    foreach ($allowed_fields as $field) {
        if (isset($params[$field])) {
            if ($field === 'package_id') {
                $update_data[$field] = (int)$params[$field];
            } elseif ($field === 'address') {
                 $update_data[$field] = sanitize_textarea_field($params[$field]);
            } else {
                $update_data[$field] = sanitize_text_field($params[$field]);
            }
        }
    }

    if (empty($update_data)) {
        return new WP_Error('no_data', 'Tidak ada data untuk diupdate.', ['status' => 400]);
    }

    $wpdb->update($table_name, $update_data, ['jamaah_id' => $jamaah_id]);

    $updated_jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE jamaah_id = %d", $jamaah_id));
    return new WP_REST_Response($updated_jamaah, 200);
}

function umh_delete_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $jamaah_id = (int) $request['id'];

    $result = $wpdb->delete($table_name, ['jamaah_id' => $jamaah_id], ['%d']);

    if ($result === false) {
        return new WP_Error('delete_failed', 'Gagal menghapus jamaah.', ['status' => 500]);
    }
    if ($result === 0) {
        return new WP_Error('not_found', 'Jamaah tidak ditemukan untuk dihapus.', ['status' => 404]);
    }

    return new WP_REST_Response(['message' => 'Jamaah berhasil dihapus.'], 200);
}


function umh_get_jamaah_by_package(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $package_id = (int) $request['package_id'];

    $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE package_id = %d", $package_id));
    
    if (is_null($results)) {
         return new WP_Error('db_error', 'Gagal mengambil data jamaah.', ['status' => 500]);
    }
    
    return new WP_REST_Response($results, 200);
}
?>