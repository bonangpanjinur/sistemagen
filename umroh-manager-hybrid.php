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

// 2. Load Utilities & Base Classes (PENTING: Urutan load sangat berpengaruh)
// [FIX] Load utils.php DULUAN agar fungsi 'umh_check_api_permission' tersedia
require_once plugin_dir_path(__FILE__) . 'includes/utils.php'; 

// [FIX] Load Class Controller agar tersedia sebelum API endpoints dipanggil
require_once plugin_dir_path(__FILE__) . 'includes/class-umh-crud-controller.php';

// 3. Load API Endpoints Otomatis
// Ini akan membaca semua file di folder includes/api/ dan memuatnya
foreach (glob(plugin_dir_path(__FILE__) . 'includes/api/*.php') as $filename) {
    require_once $filename;
}

// 4. Setup Menu Admin
function umh_add_admin_menu() {
    $hook_suffix = add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'manage_options',
        'umroh-manager',
        'umh_render_react_page',
        'dashicons-palmtree',
        2
    );

    // Tambahkan action untuk menyuntikkan class ke body HANYA di halaman ini
    // Ini agar kita bisa menyembunyikan sidebar WP di file CSS
    add_action('load-' . $hook_suffix, 'umh_add_immersive_body_class');
}
add_action('admin_menu', 'umh_add_admin_menu');

// Fungsi helper untuk menambahkan class 'immersive-mode' ke body tag
function umh_add_immersive_body_class() {
    add_filter('admin_body_class', function($classes) {
        return "$classes immersive-mode";
    });
}

// 5. Render Halaman Admin (Wadah untuk React)
function umh_render_react_page() {
    require_once plugin_dir_path(__FILE__) . 'admin/dashboard-react.php';
    
    // Panggil fungsi render yang ada di file dashboard-react.php
    if (function_exists('umroh_manager_render_dashboard_react')) {
        umroh_manager_render_dashboard_react();
    }
}

// 6. Enqueue Scripts (Jembatan PHP ke React)
function umh_enqueue_admin_scripts($hook) {
    // Hanya load di halaman plugin kita
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

    // Load Script React Utama
    wp_enqueue_script(
        'umh-react-app',
        plugins_url('build/index.js', __FILE__),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Load Style React (Tailwind build)
    wp_enqueue_style(
        'umh-react-style',
        plugins_url('build/index.css', __FILE__),
        array(),
        $asset_file['version']
    );

    // Load Admin Style Khusus (untuk Immersive Mode)
    wp_enqueue_style(
        'umh-admin-custom-style',
        plugins_url('assets/css/admin-style.css', __FILE__),
        array(),
        '1.0.0'
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

// 7. Fix Permalinks & Settings
register_activation_hook(__FILE__, 'umh_on_activation');
function umh_on_activation() {
    umh_create_db_tables(); // Buat tabel saat aktivasi
    
    // Set default allowed origins untuk CORS jika belum ada
    if (!get_option('umh_settings')) {
        update_option('umh_settings', ['allowed_origins' => site_url()]);
    }
    
    flush_rewrite_rules();
}
?>