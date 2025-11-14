<?php
// File: includes/api/api-hotels.php
// Mengelola CRUD untuk umroh_hotels

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Hotel
 * Endpoint: GET /umroh/v1/hotels
 */
function umroh_api_get_hotels(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_hotels';
    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY city ASC, stars DESC, name ASC", ARRAY_A);
    return wp_send_json_success(['data' => $results]);
}

/**
 * Membuat Hotel Baru
 * Endpoint: POST /umroh/v1/hotels
 */
function umroh_api_create_hotel(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_hotels';
    
    $name = sanitize_text_field($request['name']);
    $city = sanitize_text_field($request['city']);
    $stars = absint($request['stars']);
    $address = sanitize_textarea_field($request['address']);

    if (empty($name) || empty($city) || $stars < 1 || $stars > 5) {
        return wp_send_json_error('Data Hotel tidak lengkap atau tidak valid.', 400);
    }

    $data = [
        'name' => $name,
        'city' => $city,
        'stars' => $stars,
        'address' => $address
    ];
    $format = ['%s', '%s', '%d', '%s'];

    $result = $wpdb->insert($table_name, $data, $format);

    if ($result === false) {
        return wp_send_json_error('Gagal menyimpan hotel ke database.', 500);
    }

    return wp_send_json_success(['message' => 'Hotel berhasil dibuat.', 'id' => $wpdb->insert_id]);
}

/**
 * Menghapus Hotel
 * Endpoint: DELETE /umroh/v1/hotels/(id)
 */
function umroh_api_delete_hotel(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_hotels';
    $hotel_id = absint($request['id']);
    
    if (empty($hotel_id)) {
        return wp_send_json_error('ID hotel tidak valid.', 400);
    }

    // 1. Cek Keterkaitan (Relational Protection)
    $table_pkg_hotels = $wpdb->prefix . 'umroh_package_hotels';
    $is_used = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_pkg_hotels WHERE hotel_id = %d", $hotel_id));

    if ($is_used > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Hotel ini digunakan oleh ' . $is_used . ' paket.', 409);
    }

    // 2. Hapus Data
    $result = $wpdb->delete($table_name, ['id' => $hotel_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus hotel dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Hotel berhasil dihapus.']);
}