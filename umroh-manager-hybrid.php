<?php
/**
 * Plugin Name: Umroh Manager Enterprise V3
 * Description: Sistem Manajemen Travel Umrah Terlengkap (React + WP REST API)
 * Version: 3.0.0
 * Author: Anda
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Load API Routes (Backend)
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php'; // Pastikan utils diload jika ada fungsi global
require_once UMH_PLUGIN_DIR . 'includes/cors.php';

// Jalankan API saat plugin aktif
add_action('plugins_loaded', function() {
    $api_loader = new UMH_API_Loader();
    $api_loader->init();
});

// 2. Setup Menu Admin
add_action('admin_menu', 'umh_setup_menu');
function umh_setup_menu() {
    add_menu_page(
        'Umroh Manager', 
        'Umroh Manager', 
        'read', // Capability diperlonggar ke 'read' agar staff bisa akses menu
        'umroh-manager', 
        'umh_render_app', 
        'dashicons-airplane', 
        2
    );
}

function umh_render_app() {
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// 3. Enqueue Scripts (Load React Build)
add_action('admin_enqueue_scripts', 'umh_load_react_app');
function umh_load_react_app($hook) {
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Kirim Data ke React
    wp_localize_script('umh-react-app', 'umhSettings', array(
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'userId' => get_current_user_id()
    ));
    
    // [PENTING] Inject data user juga ke umhData untuk kompatibilitas kode lama
    $current_user = wp_get_current_user();
    wp_localize_script('umh-react-app', 'umhData', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'user' => [
            'id' => $current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'role' => in_array('administrator', $current_user->roles) ? 'super_admin' : ($current_user->roles[0] ?? 'subscriber'),
            'avatar' => get_avatar_url($current_user->ID)
        ]
    ]);
}

// 4. Setup CORS
$cors = new UMH_CORS();
$cors->add_cors_headers();

// 5. Database Migration Hook (V3) - Pastikan pakai V3
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
    if (function_exists('umh_run_migration_v3')) {
        umh_run_migration_v3();
    }
}