<?php
/**
 * Plugin Name: Sistem Agen Umroh Hybrid
 * Description: Sistem Manajemen Umroh & Haji dengan Dashboard React Modern.
 * Version: 1.0.0
 * Author: Bonang Panji
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// -----------------------------------------------------------------------------
// 1. KONSTANTA & SETUP AWAL
// -----------------------------------------------------------------------------
define('UMH_VERSION', '1.0.0');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// -----------------------------------------------------------------------------
// 2. INCLUDE FILE UTAMA & HELPER
// -----------------------------------------------------------------------------
// Memuat file-file inti yang dibutuhkan sebelum API berjalan
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php';

// -----------------------------------------------------------------------------
// 3. LOAD SEMUA API ENDPOINTS
// -----------------------------------------------------------------------------
// Daftar file API yang harus dimuat agar data React muncul
$api_files = [
    'includes/api/api-agents.php',
    'includes/api/api-bookings.php',
    'includes/api/api-categories.php',
    'includes/api/api-departures.php',
    'includes/api/api-documents.php',
    'includes/api/api-export.php',
    'includes/api/api-finance.php',
    'includes/api/api-flight-bookings.php',
    'includes/api/api-flights.php',
    'includes/api/api-hotel-bookings.php',
    'includes/api/api-hotels.php',
    'includes/api/api-hr.php',
    'includes/api/api-jamaah.php',
    'includes/api/api-logistics.php',
    'includes/api/api-logs.php',
    'includes/api/api-marketing.php',
    'includes/api/api-masters.php',
    'includes/api/api-misc.php',
    'includes/api/api-package-categories.php',
    'includes/api/api-packages.php',
    'includes/api/api-payments.php',
    'includes/api/api-print.php',
    'includes/api/api-roles.php',
    'includes/api/api-rooming.php',
    'includes/api/api-stats.php',
    'includes/api/api-tasks.php',
    'includes/api/api-uploads.php',
    'includes/api/api-users.php'
];

foreach ($api_files as $file) {
    if (file_exists(UMH_PLUGIN_DIR . $file)) {
        require_once UMH_PLUGIN_DIR . $file;
    }
}

// -----------------------------------------------------------------------------
// 4. AKTIVASI PLUGIN (Membuat Tabel Database)
// -----------------------------------------------------------------------------
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    // Memanggil fungsi pembuatan tabel dari includes/db-schema.php
    if (function_exists('umh_create_tables')) {
        umh_create_tables();
    }
}

// -----------------------------------------------------------------------------
// 5. MEMBUAT MENU ADMIN WORDPRESS
// -----------------------------------------------------------------------------
add_action('admin_menu', 'umh_register_admin_menu');
function umh_register_admin_menu() {
    add_menu_page(
        'Sistem Agen',           // Judul Halaman
        'Sistem Agen',           // Judul Menu
        'read',                  // Capability (Set 'read' agar semua user login bisa akses, nanti React yang filter)
        'umroh-manager',         // Slug URL (?page=umroh-manager)
        'umh_render_admin_page', // Fungsi Render
        'dashicons-groups',      // Ikon Menu
        2                        // Posisi Menu
    );
}

// Fungsi untuk menampilkan wadah (container) React
function umh_render_admin_page() {
    $template_path = UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
    
    if (file_exists($template_path)) {
        require_once $template_path;
    } else {
        // Fallback darurat jika file dashboard-react.php hilang
        echo '<div class="wrap"><div id="umroh-manager-app"></div></div>';
    }
}

// -----------------------------------------------------------------------------
// 6. ENQUEUE ASSETS (PENTING: Jembatan ke React)
// -----------------------------------------------------------------------------
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');
function umh_enqueue_admin_scripts($hook) {
    // Hanya load script di halaman plugin kita sendiri
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    
    // Cek apakah hasil build React ada
    if (!file_exists($asset_file_path)) {
        return; 
    }

    $asset_file = include($asset_file_path);

    // 1. Load CSS React
    wp_enqueue_style(
        'umroh-manager-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // 2. Load JS React
    wp_enqueue_script(
        'umroh-manager-react',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // 3. (FIX UTAMA) Kirim Data Setting ke Browser
    // Ini yang membuat api.js tahu URL dan Nonce yang benar
    wp_localize_script('umroh-manager-react', 'umrohManagerSettings', array(
        'root'      => esc_url_raw(rest_url()), // URL API Otomatis (misal: localhost/wp-json/)
        'nonce'     => wp_create_nonce('wp_rest'), // Kunci Keamanan
        'user_id'   => get_current_user_id(),
        'site_url'  => site_url(),
        'plugin_url'=> UMH_PLUGIN_URL
    ));
}
?>