<?php
// File: includes/api/api-departures.php
// Mengelola CRUD untuk umroh_departures

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Jadwal Keberangkatan dengan nama Paket
 * Endpoint: GET /umroh/v1/departures
 */
function umroh_api_get_departures(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_departures';
    $table_packages = $wpdb->prefix . 'umroh_packages';

    $results = $wpdb->get_results("
        SELECT 
            d.*,
            p.package_name,
            p.duration_days
        FROM $table_name d
        LEFT JOIN $table_packages p ON d.package_id = p.id
        ORDER BY d.departure_date DESC
    ", ARRAY_A);
    
    // Tambahkan informasi kuota terpakai
    $table_jamaah = $wpdb->prefix . 'umroh_jamaah';
    foreach ($results as &$departure) {
        $jamaah_count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table_jamaah WHERE departure_id = %d",
            $departure['id']
        ));
        $departure['current_jamaah'] = absint($jamaah_count);
        $departure['available_quota'] = $departure['quota'] - $departure['current_jamaah'];
    }
    unset($departure); 

    return wp_send_json_success(['data' => $results]);
}

/**
 * Membuat Jadwal Keberangkatan Baru
 * Endpoint: POST /umroh/v1/departures
 */
function umroh_api_create_departure(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_departures';
    
    $package_id = absint($request['package_id']);
    $departure_date = sanitize_text_field($request['departure_date']);
    $quota = absint($request['quota']);
    $price_quad = sanitize_text_field($request['price_quad']);
    $price_triple = sanitize_text_field($request['price_triple']);
    $price_double = sanitize_text_field($request['price_double']);

    if (empty($package_id) || empty($departure_date) || empty($quota) || empty($price_quad)) {
        return wp_send_json_error('Data jadwal dan harga harus lengkap.', 400);
    }
    
    $data = [
        'package_id' => $package_id,
        'departure_date' => $departure_date,
        'quota' => $quota,
        'price_quad' => floatval($price_quad),
        'price_triple' => floatval($price_triple),
        'price_double' => floatval($price_double),
    ];
    $format = ['%d', '%s', '%d', '%f', '%f', '%f'];

    $result = $wpdb->insert($table_name, $data, $format);

    if ($result === false) {
        return wp_send_json_error('Gagal menyimpan jadwal keberangkatan ke database.', 500);
    }

    return wp_send_json_success(['message' => 'Jadwal berhasil dibuat.', 'id' => $wpdb->insert_id]);
}

/**
 * Menghapus Jadwal Keberangkatan
 * Endpoint: DELETE /umroh/v1/departures/(id)
 */
function umroh_api_delete_departure(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_departures';
    $departure_id = absint($request['id']);
    
    if (empty($departure_id)) {
        return wp_send_json_error('ID jadwal tidak valid.', 400);
    }

    // 1. Cek Keterkaitan Jamaah (Relational Protection)
    $table_jamaah = $wpdb->prefix . 'umroh_jamaah';
    $is_used = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_jamaah WHERE departure_id = %d", $departure_id));

    if ($is_used > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Jadwal ini sudah memiliki ' . $is_used . ' jamaah terdaftar.', 409);
    }

    // 2. Hapus Data
    $result = $wpdb->delete($table_name, ['id' => $departure_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus jadwal keberangkatan dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Jadwal berhasil dihapus.']);
}