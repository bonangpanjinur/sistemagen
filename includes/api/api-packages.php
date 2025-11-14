<?php
// File: includes/api/api-packages.php
// Mengelola CRUD untuk umroh_packages dan relasinya

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Paket beserta relasinya (Kategori, Hotel, Flight)
 * Endpoint: GET /umroh/v1/packages
 */
function umroh_api_get_packages(WP_REST_Request $request) {
    global $wpdb;
    $table_packages = $wpdb->prefix . 'umroh_packages';
    $table_categories = $wpdb->prefix . 'umroh_categories';
    $table_pkg_hotels = $wpdb->prefix . 'umroh_package_hotels';
    $table_pkg_flights = $wpdb->prefix . 'umroh_package_flights';

    // Query utama untuk mendapatkan data paket dan nama kategori
    $packages = $wpdb->get_results("
        SELECT 
            p.*, 
            c.name as category_name
        FROM $table_packages p
        LEFT JOIN $table_categories c ON p.category_id = c.id
        ORDER BY p.id DESC
    ", ARRAY_A);

    if (empty($packages)) {
        return wp_send_json_success(['data' => []]);
    }
    
    $package_ids = array_column($packages, 'id');
    
    // 1. Ambil relasi Hotel
    $package_hotels = $wpdb->get_results("
        SELECT package_id, hotel_id 
        FROM $table_pkg_hotels 
        WHERE package_id IN (" . implode(',', array_map('absint', $package_ids)) . ")
    ", ARRAY_A);

    // 2. Ambil relasi Penerbangan
    $package_flights = $wpdb->get_results("
        SELECT package_id, flight_id 
        FROM $table_pkg_flights 
        WHERE package_id IN (" . implode(',', array_map('absint', $package_ids)) . ")
    ", ARRAY_A);

    // 3. Gabungkan data
    foreach ($packages as &$package) {
        $pkg_id = $package['id'];
        $package['hotel_ids'] = array_column(array_filter($package_hotels, fn($item) => $item['package_id'] == $pkg_id), 'hotel_id');
        $package['flight_ids'] = array_column(array_filter($package_flights, fn($item) => $item['package_id'] == $pkg_id), 'flight_id');
    }
    unset($package);

    return wp_send_json_success(['data' => $packages]);
}

/**
 * Membuat Paket Baru dan Relasinya
 * Endpoint: POST /umroh/v1/packages
 */
function umroh_api_create_package(WP_REST_Request $request) {
    global $wpdb;
    $table_packages = $wpdb->prefix . 'umroh_packages';
    $table_pkg_hotels = $wpdb->prefix . 'umroh_package_hotels';
    $table_pkg_flights = $wpdb->prefix . 'umroh_package_flights';

    $name = sanitize_text_field($request['package_name']);
    $category_id = absint($request['category_id']);
    $duration = absint($request['duration_days']);
    $description = sanitize_textarea_field($request['description']);
    $hotel_ids = array_map('absint', (array)$request['hotel_ids']);
    $flight_ids = array_map('absint', (array)$request['flight_ids']);

    if (empty($name) || empty($category_id) || empty($duration)) {
        return wp_send_json_error('Nama Paket, Kategori, dan Durasi harus diisi.', 400);
    }
    
    // 1. Simpan Data Paket Utama
    $package_data = [
        'package_name' => $name,
        'category_id' => $category_id,
        'duration_days' => $duration,
        'description' => $description,
    ];
    $result = $wpdb->insert($table_packages, $package_data, ['%s', '%d', '%d', '%s']);
    
    if ($result === false) {
        return wp_send_json_error('Gagal menyimpan paket utama ke database.', 500);
    }
    $package_id = $wpdb->insert_id;

    // 2. Simpan Relasi Hotel
    if (!empty($hotel_ids)) {
        foreach (array_unique($hotel_ids) as $hotel_id) {
            $wpdb->insert($table_pkg_hotels, ['package_id' => $package_id, 'hotel_id' => $hotel_id], ['%d', '%d']);
        }
    }

    // 3. Simpan Relasi Penerbangan
    if (!empty($flight_ids)) {
        foreach (array_unique($flight_ids) as $flight_id) {
            $wpdb->insert($table_pkg_flights, ['package_id' => $package_id, 'flight_id' => $flight_id], ['%d', '%d']);
        }
    }

    return wp_send_json_success(['message' => 'Paket Umroh berhasil dibuat.', 'id' => $package_id]);
}

/**
 * Menghapus Paket dan Relasinya
 * Endpoint: DELETE /umroh/v1/packages/(id)
 */
function umroh_api_delete_package(WP_REST_Request $request) {
    global $wpdb;
    $package_id = absint($request['id']);
    
    if (empty($package_id)) {
        return wp_send_json_error('ID paket tidak valid.', 400);
    }
    
    // 1. Cek Keterkaitan Jadwal (Relational Protection)
    $table_departures = $wpdb->prefix . 'umroh_departures';
    $is_used = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_departures WHERE package_id = %d", $package_id));

    if ($is_used > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Paket ini sudah memiliki ' . $is_used . ' jadwal keberangkatan.', 409);
    }

    // 2. Hapus Relasi
    $wpdb->delete($wpdb->prefix . 'umroh_package_hotels', ['package_id' => $package_id], ['%d']);
    $wpdb->delete($wpdb->prefix . 'umroh_package_flights', ['package_id' => $package_id], ['%d']);
    
    // 3. Hapus Paket Utama
    $result = $wpdb->delete($wpdb->prefix . 'umroh_packages', ['id' => $package_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus paket dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Paket berhasil dihapus.']);
}