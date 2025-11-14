<?php
// FILE BARU: untuk menangani autentikasi dan izin

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * ======================================================================
 * FUNGSI KEAMANAN UTAMA (PERBAIKAN KRITIS)
 * ======================================================================
 * Ini adalah fungsi inti untuk memperbaiki masalah "Guest".
 * Kita akan menggunakannya di 'permission_callback' di semua endpoint.
 *
 * @return bool
 */
function umroh_rest_permission_check() {
    // 'manage_options' adalah kapabilitas default untuk Administrator.
    // Ganti ini dengan kapabilitas kustom jika perlu, misal 'manage_umroh_travel'
    // Ini MEMASTIKAN hanya pengguna yang login dengan role tepat yang bisa akses API.
    return current_user_can( 'manage_options' );
}

/**
 * ======================================================================
 * ENDPOINT PENGGUNA SAAT INI (/users/me)
 * ======================================================================
 * Endpoint ini akan dipanggil React saat load untuk mendapatkan data pengguna.
 */
function umroh_register_user_me_routes() {
    register_rest_route( 'umroh/v1', '/users/me', [
        'methods'             => 'GET',
        'callback'            => 'umroh_get_current_user_data',
        'permission_callback' => 'is_user_logged_in', // Cukup cek apakah user login
    ] );
}
add_action( 'rest_api_init', 'umroh_register_user_me_routes' );

/**
 * Callback untuk mendapatkan data pengguna yang sedang login.
 *
 * @return WP_REST_Response
 */
function umroh_get_current_user_data() {
    $user = wp_get_current_user();

    if ( ! $user->ID ) {
        return new WP_Error( 'not_logged_in', 'Anda tidak login.', [ 'status' => 401 ] );
    }

    return new WP_REST_Response( [
        'id'     => $user->ID,
        'name'   => $user->display_name,
        'email'  => $user->user_email,
        'roles'  => $user->roles,
    ], 200 );
}