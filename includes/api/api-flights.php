<?php
// File: includes/api/api-flights.php
// Mengelola CRUD untuk umroh_flights

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Penerbangan
 * Endpoint: GET /umroh/v1/flights
 */
function umroh_api_get_flights(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_flights';
    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY airline_name ASC", ARRAY_A);
    return wp_send_json_success(['data' => $results]);
}

/**
 * Membuat Penerbangan Baru
 * Endpoint: POST /umroh/v1/flights
 */
function umroh_api_create_flight(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_flights';
    
    $airline_name = sanitize_text_field($request['airline_name']);
    $flight_number = sanitize_text_field(strtoupper($request['flight_number']));
    $origin = sanitize_text_field(strtoupper($request['origin']));
    $destination = sanitize_text_field(strtoupper($request['destination']));

    if (empty($airline_name) || empty($flight_number) || empty($origin) || empty($destination)) {
        return wp_send_json_error('Semua kolom penerbangan harus diisi.', 400);
    }

    // Cek duplikasi nomor penerbangan
    $existing = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE flight_number = %s", $flight_number));
    if ($existing > 0) {
        return wp_send_json_error('Nomor penerbangan sudah ada.', 409);
    }

    $data = [
        'airline_name' => $airline_name,
        'flight_number' => $flight_number,
        'origin' => $origin,
        'destination' => $destination,
    ];
    $format = ['%s', '%s', '%s', '%s'];

    $result = $wpdb->insert($table_name, $data, $format);

    if ($result === false) {
        return wp_send_json_error('Gagal menyimpan penerbangan ke database.', 500);
    }

    return wp_send_json_success(['message' => 'Penerbangan berhasil dibuat.', 'id' => $wpdb->insert_id]);
}

/**
 * Menghapus Penerbangan
 * Endpoint: DELETE /umroh/v1/flights/(id)
 */
function umroh_api_delete_flight(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_flights';
    $flight_id = absint($request['id']);
    
    if (empty($flight_id)) {
        return wp_send_json_error('ID penerbangan tidak valid.', 400);
    }

    // 1. Cek Keterkaitan (Relational Protection)
    $table_pkg_flights = $wpdb->prefix . 'umroh_package_flights';
    $is_used = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_pkg_flights WHERE flight_id = %d", $flight_id));

    if ($is_used > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Penerbangan ini digunakan oleh ' . $is_used . ' paket.', 409);
    }

    // 2. Hapus Data
    $result = $wpdb->delete($table_name, ['id' => $flight_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus penerbangan dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Penerbangan berhasil dihapus.']);
}