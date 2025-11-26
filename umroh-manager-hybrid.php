<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh & Haji dengan React Dashboard.
 * Version: 1.0.0
 * Author: Anda
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Load Database Schema & Tables (PENTING: Agar tabel dibuat)
require_once plugin_dir_path(__FILE__) . 'includes/db-schema.php';

// 2. Load API Endpoints Otomatis
// Ini akan membaca semua file di folder includes/api/ dan memuatnya
foreach (glob(plugin_dir_path(__FILE__) . 'includes/api/*.php') as $filename) {
    require_once $filename;
}

// 3. Setup Menu Admin
function umh_add_admin_menu() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'manage_options',
        'umroh-manager',
        'umh_render_react_page',
        'dashicons-palmtree',
        2
    );
}
add_action('admin_menu', 'umh_add_admin_menu');

// 4. Render Halaman Admin (Wadah untuk React)
function umh_render_react_page() {
    require_once plugin_dir_path(__FILE__) . 'admin/dashboard-react.php';
}

// 5. Enqueue Scripts (Jembatan PHP ke React)
function umh_enqueue_admin_scripts($hook) {
    // Hanya load di halaman plugin kita
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        plugins_url('build/index.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-react-style',
        plugins_url('build/index.css', __FILE__),
        array(),
        $asset_file['version']
    );

    // [PENTING] Kirim Data Konfigurasi ke React
    // React akan menerimanya melalui window.umhData
    $current_user = wp_get_current_user();
    wp_localize_script('umh-react-app', 'umhData', array(
        'root_url'  => get_rest_url(), // URL API otomatis menyesuaikan domain/localhost
        'nonce'     => wp_create_nonce('wp_rest'), // Kunci keamanan
        'admin_url' => admin_url(),
        'user'      => array(
            'display_name' => $current_user->display_name,
            'email'        => $current_user->user_email,
            'roles'        => $current_user->roles
        )
    ));
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

// 6. Fix Permalinks (Opsional: Kadang API 404 jika permalink belum di-flush)
register_activation_hook(__FILE__, 'umh_flush_rewrites');
function umh_flush_rewrites() {
    umh_create_db_tables(); // Buat tabel saat aktivasi
    flush_rewrite_rules();
}
?>