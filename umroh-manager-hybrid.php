<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem manajemen travel umroh menggunakan React Frontend dan WordPress REST API Backend.
 * Version: 1.0.0
 * Author: Bonang Panji Nur
 * License: GPL2
 */

if (!defined('ABSPATH')) {
    exit;
}

// Definisikan konstanta dasar
define('UMROH_MANAGER_PATH', plugin_dir_path(__FILE__));
define('UMROH_MANAGER_URL', plugin_dir_url(__FILE__));
define('UMROH_MANAGER_VERSION', '1.0.0');

/**
 * ===================================================================
 * Hook Aktivasi dan Deaktivasi
 * ===================================================================
 */
register_activation_hook(__FILE__, 'umroh_manager_activate');
register_deactivation_hook(__FILE__, 'umroh_manager_deactivate');

function umroh_manager_activate() {
    require_once UMROH_MANAGER_PATH . 'includes/db-schema.php';
    umroh_manager_install_db_schema();
}

function umroh_manager_deactivate() {
    // Opsional: Hapus data atau tabel saat de-aktivasi
}

/**
 * ===================================================================
 * Memuat Komponen Plugin
 * ===================================================================
 */
// Pemuat Skema Database (untuk diakses dari aktivasi)
require_once UMROH_MANAGER_PATH . 'includes/db-schema.php';

// Pemuat REST API Endpoint
require_once UMROH_MANAGER_PATH . 'includes/api-loader.php';

// Pemuat CORS (jika diperlukan untuk pengujian eksternal, namun di WP internal tidak wajib)
// require_once UMROH_MANAGER_PATH . 'includes/cors.php';


/**
 * ===================================================================
 * Fungsi Tampilan Admin Menu
 * ===================================================================
 */
function umroh_manager_admin_menu() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', // Izin minimum untuk melihat menu
        'umroh-manager',
        'umroh_manager_admin_page_callback',
        'dashicons-flight',
        6
    );
}
add_action('admin_menu', 'umroh_manager_admin_menu');

function umroh_manager_admin_page_callback() {
    // Memuat halaman yang menampung aplikasi React
    require_once UMROH_MANAGER_PATH . 'admin/dashboard-react.php';
}

/**
 * ===================================================================
 * Enqueue Script React
 * ===================================================================
 */
function umroh_manager_enqueue_admin_scripts($hook) {
    // Hanya enqueue script pada halaman plugin kita
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(UMROH_MANAGER_PATH . 'build/index.asset.php');

    // Enqueue script utama (hasil build Webpack/Bundler)
    wp_enqueue_script(
        'umroh-manager-script',
        UMROH_MANAGER_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Kirim data yang dibutuhkan oleh React (seperti Nonce dan URL REST API)
    wp_localize_script(
        'umroh-manager-script',
        'wpApiSettings',
        array(
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
        )
    );
}
add_action('admin_enqueue_scripts', 'umroh_manager_enqueue_admin_scripts');


/**
 * ===================================================================
 * Memperpanjang Durasi Session & Nonce
 * ===================================================================
 * Menjaga agar pengguna tidak cepat logout saat menggunakan dashboard React.
 */

/**
 * 1. Memperpanjang session standar (saat "Remember Me" TIDAK dicentang)
 * WordPress default: 2 hari (2 * DAY_IN_SECONDS)
 * Kita ubah menjadi 7 hari (7 * DAY_IN_SECONDS)
 */
add_filter('auth_cookie_expiration', 'umroh_manager_custom_cookie_expiration');
function umroh_manager_custom_cookie_expiration($expiration) {
    // 7 hari dalam detik
    return 7 * DAY_IN_SECONDS; 
}

/**
 * 2. Memperpanjang session "Remember Me" (opsional, tapi bagus)
 * WordPress default: 14 hari
 * Kita ubah menjadi 30 hari
 */
add_filter('auth_cookie_remember_me_expiration', 'umroh_manager_remember_me_cookie_expiration');
function umroh_manager_remember_me_cookie_expiration($expiration) {
    // 30 hari dalam detik
    return 30 * DAY_IN_SECONDS;
}

/**
 * 3. PENTING: Memperpanjang masa berlaku Nonce REST API
 * Default: 12 jam (valid selama 12-24 jam).
 * Kita set ke 7 hari agar sesuai dengan cookie.
 * Nonce akan valid selama 1x hingga 2x nilai ini.
 */
add_filter('nonce_life', 'umroh_manager_custom_nonce_life');
function umroh_manager_custom_nonce_life($lifetime) {
    // 7 hari dalam detik
    return 7 * DAY_IN_SECONDS;
}