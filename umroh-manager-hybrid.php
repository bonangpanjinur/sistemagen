<?php
/*
Plugin Name: Umroh Manager Hybrid
Description: Sistem Manajemen Travel Umroh & Haji Terintegrasi (React Dashboard + WordPress API).
Version: 1.7
Author: Tim Developer
Author URI: https://jannahfirdaus.com
Text Domain: umroh-manager
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. DEFINISI KONSTANTA
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '1.7.0');

// 2. INCLUDE CORE FILES (Safe Include)
$core_files = [
    'includes/utils.php',
    'includes/cors.php',
    'includes/db-schema.php',
    'includes/class-umh-crud-controller.php'
];

foreach ($core_files as $file) {
    if (file_exists(UMH_PLUGIN_DIR . $file)) {
        require_once UMH_PLUGIN_DIR . $file;
    }
}

// 3. REGISTER API ENDPOINTS
$api_files = [
    'includes/api/api-stats.php',
    'includes/api/api-roles.php',
    'includes/api/api-users.php',
    'includes/api/api-package-categories.php',
    'includes/api/api-packages.php',
    'includes/api/api-agents.php',
    'includes/api/api-jamaah.php',
    'includes/api/api-logistics.php',
    'includes/api/api-payments.php',
    'includes/api/api-finance.php',
    'includes/api/api-categories.php',
    'includes/api/api-tasks.php',
    'includes/api/api-uploads.php',
    'includes/api/api-hr.php',
    'includes/api/api-hotels.php',
    'includes/api/api-hotel-bookings.php',
    'includes/api/api-flights.php',
    'includes/api/api-flight-bookings.php',
    'includes/api/api-departures.php',
    'includes/api/api-marketing.php',
    'includes/api/api-logs.php',
    'includes/api/api-print.php',
    'includes/api/api-export.php'
];

foreach ($api_files as $file) {
    if (file_exists(UMH_PLUGIN_DIR . $file)) {
        require_once UMH_PLUGIN_DIR . $file;
    }
}

// [PERBAIKAN] Include file halaman admin agar fungsi rendernya dikenali
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';

// 4. HOOK AKTIVASI PLUGIN
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    if (function_exists('umh_create_db_tables')) {
        umh_create_db_tables();
    }
    flush_rewrite_rules();
}

add_action('plugins_loaded', 'umh_update_db_check_main');
function umh_update_db_check_main() {
    global $umh_db_version;
    if (!isset($umh_db_version)) return;

    if (get_site_option('umh_db_version') != $umh_db_version) {
        if (function_exists('umh_create_db_tables')) {
            umh_create_db_tables();
        }
        flush_rewrite_rules();
    }
}

// Init Settings Page
add_action('admin_init', function() {
    if (class_exists('UMH_Settings_Page')) {
        $settings_page = new UMH_Settings_Page();
        $settings_page->register_settings();
    }
});

// 5. ADMIN MENU & UI
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    // Menu Utama (Dashboard React)
    $hook = add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', 
        'umroh-manager',
        'umh_render_admin_page', // Callback function
        'dashicons-palmtree',
        6
    );

    // Submenu Settings (PHP Native)
    add_submenu_page(
        'umroh-manager',
        'Pengaturan',
        'Pengaturan',
        'manage_options',
        'umh-settings',
        'umh_render_settings_page'
    );

    add_action("load-$hook", function() {
        add_filter('admin_body_class', 'umh_add_immersive_class');
    });
}

function umh_add_immersive_class($classes) {
    return "$classes immersive-mode"; 
}

// [PERBAIKAN] Fungsi render memanggil file terpisah
function umh_render_admin_page() {
    if (function_exists('umroh_manager_render_dashboard_react')) {
        umroh_manager_render_dashboard_react();
    } else {
        echo '<div id="umh-app-root">Error: File template dashboard tidak ditemukan.</div>';
    }
}

// 6. ENQUEUE SCRIPTS
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_enqueue_admin_scripts($hook) {
    if ($hook != 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    
    if (file_exists($asset_file_path)) {
        $asset_file = include($asset_file_path);
        
        wp_enqueue_script(
            'umroh-manager-react',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'umroh-manager-style',
            UMH_PLUGIN_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );
        
        if (file_exists(UMH_PLUGIN_DIR . 'assets/css/admin-style.css')) {
            wp_enqueue_style(
                'umroh-manager-admin-fix',
                UMH_PLUGIN_URL . 'assets/css/admin-style.css',
                array(),
                UMH_VERSION
            );
        }

        $current_user = wp_get_current_user();
        $roles = ( array ) $current_user->roles;

        // [PERBAIKAN] Data lengkap untuk React
        wp_localize_script('umroh-manager-react', 'umhData', array(
            'rootUrl'  => get_rest_url(null, 'umh/v1/'),
            'nonce'    => wp_create_nonce('wp_rest'),
            'adminUrl' => admin_url(),
            'apiUrl'   => get_rest_url(null, 'umh/v1/'),
            'currentUser' => array(
                'id' => $current_user->ID,
                'display_name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'avatar' => get_avatar_url($current_user->ID), // React butuh ini
                'role' => $roles[0] ?? 'subscriber'
            ),
            'capabilities' => array_keys($current_user->allcaps), // React butuh ini
            'roles' => [] 
        ));
    } else {
        wp_add_inline_script('common', 'console.error("Umroh Manager: Build files not found. Jalankan npm run build.");');
    }
}
?>