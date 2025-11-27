<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh & Haji (React + WP API)
 * Version: 1.3.1
 * Author: Bonang Panji
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load Core Classes
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// Load Dashboard Renderer
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';

// Init API Loader
new UMH_Api_Loader();

// Init Settings Page
add_action('admin_init', function() {
    $settings = new UMH_Settings_Page();
    $settings->register_settings();
});

// Activation Hook
register_activation_hook(__FILE__, 'umh_create_db_tables');

// Setup CORS
$cors = new UMH_CORS();
$cors->add_cors_headers();

// Load React App di Admin Menu
add_action('admin_menu', 'umh_register_admin_page');

function umh_register_admin_page() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', // Capability minimal 'read' agar semua staff bisa akses, permission API yang akan memfilter data
        'umroh-manager',
        'umroh_manager_render_dashboard_react', // Fungsi ada di admin/dashboard-react.php
        'dashicons-palmtree',
        6
    );
    
    // Submenu Settings
    add_submenu_page(
        'umroh-manager',
        'Pengaturan',
        'Pengaturan',
        'manage_options',
        'umh-settings',
        'umh_render_settings_page' // Fungsi ada di admin/settings-page.php
    );
}

// Enqueue Scripts
add_action('admin_enqueue_scripts', 'umh_enqueue_react_scripts');

function umh_enqueue_react_scripts($hook) {
    // Hanya load di halaman plugin kita
    if (strpos($hook, 'umroh-manager') === false) {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    // 1. Load CSS Khusus Admin (Untuk Immersive Mode)
    wp_enqueue_style(
        'umh-admin-global',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        [],
        time() // Force reload cache saat dev
    );

    // 2. Load React Script
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        array_merge($asset_file['dependencies'], ['wp-element', 'wp-api-fetch']),
        $asset_file['version'],
        true
    );

    // 3. Inject Data Penting ke React (FIX UTAMA)
    // Ini penting agar React tahu URL API, Nonce, dan User yang login
    $current_user = wp_get_current_user();
    $roles = (array) $current_user->roles;
    $role = $roles[0] ?? 'subscriber';
    
    // Tentukan role aplikasi berdasarkan capability WP
    $app_role = $role;
    if (current_user_can('manage_options')) {
        $app_role = 'super_admin';
    }

    wp_localize_script('umh-react-app', 'umhData', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(), // URL untuk tombol "Kembali ke WP"
        'user' => [
            'id' => $current_user->ID,
            'name' => $current_user->display_name,
            'email' => $current_user->user_email,
            'role' => $app_role,
            'avatar' => get_avatar_url($current_user->ID)
        ]
    ]);

    // 4. Load React CSS
    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        ['umh-admin-global'],
        $asset_file['version']
    );
}