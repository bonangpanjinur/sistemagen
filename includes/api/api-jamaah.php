<?php
// File: includes/api/api-jamaah.php
// Mengelola CRUD untuk umroh_jamaah

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Data Jamaah
 * Endpoint: GET /umroh/v1/jamaah
 */
function umroh_api_get_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_jamaah';
    $table_departures = $wpdb->prefix . 'umroh_departures';
    $table_packages = $wpdb->prefix . 'umroh_packages';

    $results = $wpdb->get_results("
        SELECT 
            j.*,
            d.departure_date,
            p.package_name
        FROM $table_name j
        LEFT JOIN $table_departures d ON j.departure_id = d.id
        LEFT JOIN $table_packages p ON d.package_id = p.id
        ORDER BY j.id DESC
    ", ARRAY_A);

    return wp_send_json_success(['data' => $results]);
}

/**
 * Membuat Data Jamaah Baru
 * Endpoint: POST /umroh/v1/jamaah
 */
function umroh_api_create_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_jamaah';
    
    $departure_id = absint($request['departure_id']);
    $full_name = sanitize_text_field($request['full_name']);
    $ktp_number = sanitize_text_field($request['ktp_number']);
    $passport_number = sanitize_text_field($request['passport_number']);
    $phone_number = sanitize_text_field($request['phone_number']);
    $email = sanitize_email($request['email']);
    $address = sanitize_textarea_field($request['address']);
    $status = sanitize_text_field($request['status']);

    if (empty($departure_id) || empty($full_name) || empty($phone_number)) {
        return wp_send_json_error('Jadwal, Nama Lengkap, dan Nomor HP wajib diisi.', 400);
    }

    // Cek kuota sebelum insert
    $table_departures = $wpdb->prefix . 'umroh_departures';
    $quota = $wpdb->get_row($wpdb->prepare("SELECT quota FROM $table_departures WHERE id = %d", $departure_id), ARRAY_A);
    
    if (empty($quota)) {
        return wp_send_json_error('Jadwal keberangkatan tidak ditemukan.', 404);
    }
    
    $current_jamaah = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE departure_id = %d AND status != 'cancelled'", $departure_id));
    
    if (absint($current_jamaah) >= absint($quota['quota'])) {
        return wp_send_json_error('Kuota untuk jadwal ini sudah penuh.', 409);
    }
    
    $data = [
        'departure_id' => $departure_id,
        'full_name' => $full_name,
        'ktp_number' => $ktp_number,
        'passport_number' => $passport_number,
        'phone_number' => $phone_number,
        'email' => $email,
        'address' => $address,
        'status' => $status,
    ];
    $format = ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s'];

    $result = $wpdb->insert($table_name, $data, $format);

    if ($result === false) {
        return wp_send_json_error('Gagal mendaftarkan jamaah ke database.', 500);
    }

    return wp_send_json_success(['message' => 'Jamaah berhasil didaftarkan.', 'id' => $wpdb->insert_id]);
}

/**
 * Menghapus Data Jamaah
 * Endpoint: DELETE /umroh/v1/jamaah/(id)
 */
function umroh_api_delete_jamaah(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_jamaah';
    $jamaah_id = absint($request['id']);
    
    if (empty($jamaah_id)) {
        return wp_send_json_error('ID jamaah tidak valid.', 400);
    }

    // Hapus Data
    $result = $wpdb->delete($table_name, ['id' => $jamaah_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus data jamaah dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Data jamaah berhasil dihapus.']);
}