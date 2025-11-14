<?php
// File: includes/utils.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Fungsi utilitas umum
function umh_get_package_details($package_id) {
    global $wpdb;
    $package_table = $wpdb->prefix . 'umh_packages';
    $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $package_table WHERE package_id = %d", $package_id));
    return $package;
}

function umh_log_activity($user_id, $action, $details) {
    global $wpdb;
    $log_table = $wpdb->prefix . 'umh_activity_logs';
    
    $wpdb->insert(
        $log_table,
        [
            'user_id' => $user_id,
            'action' => $action,
            'details' => $details,
            'log_time' => current_time('mysql', 1)
        ],
        ['%d', '%s', '%s', '%s']
    );
}

// **PERBAIKAN BARU: (Poin 1, 2, 4) Pemeriksa Izin API Global**
function umh_check_api_permission(WP_REST_Request $request) {
    
    // 1. Izinkan jika ini adalah Admin WP yang diautentikasi melalui cookie
    // Ini penting untuk panggilan dari React saat auto-login (Poin 1 & 2)
    // dan juga untuk endpoint /wp-login
    if (is_super_admin() || current_user_can('manage_options')) {
        // Verifikasi nonce untuk keamanan tambahan terhadap CSRF
        $nonce = $request->get_header('X-WP-Nonce');
        if (wp_verify_nonce($nonce, 'wp_rest')) {
            return true;
        }
        // Jika tidak ada nonce (mungkin dari login kustom), lanjutkan ke pemeriksaan token
    }

    // 2. Izinkan jika ada Token Bearer yang valid (Poin 4)
    $auth_header = $request->get_header('Authorization');
    
    if (empty($auth_header)) {
        return new WP_Error('rest_unauthorized', 'Header otorisasi tidak ditemukan.', ['status' => 401]);
    }

    // Harapkan format "Bearer <token>"
    // Periksa apakah ada spasi sebelum meledak
    if (strpos($auth_header, ' ') === false) {
        return new WP_Error('rest_unauthorized', 'Format header otorisasi tidak valid.', ['status' => 401]);
    }
    
    list($type, $token) = explode(' ', $auth_header, 2);
    
    if (strcasecmp($type, 'Bearer') !== 0 || empty($token)) {
        return new WP_Error('rest_unauthorized', 'Skema otorisasi tidak valid atau token kosong.', ['status' => 401]);
    }

    // 3. Verifikasi token di database
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    // Cari user berdasarkan auth_token
    $user = $wpdb->get_row($wpdb->prepare("SELECT user_id, role FROM $table_name WHERE auth_token = %s", $token));

    if (empty($user)) {
        return new WP_Error('rest_invalid_token', 'Token tidak valid atau kedaluwarsa.', ['status' => 401]);
    }

    // (Opsional) Di sini Anda dapat menambahkan pemeriksaan role
    // if ($user->role !== 'owner' && $user->role !== 'karyawan') {
    //     return new WP_Error('rest_forbidden_role', 'Peran Anda tidak diizinkan.', ['status' => 403]);
    // }

    // Jika token valid, izinkan akses
    return true;
}

?>