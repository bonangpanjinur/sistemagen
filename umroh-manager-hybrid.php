<?php
/*
Plugin Name: Umroh Manager Hybrid
Description: Sistem Manajemen Travel Umroh & Haji Terintegrasi (React Dashboard + WordPress API).
Version: 1.6
Author: Tim Developer
Author URI: https://jannahfirdaus.com
Text Domain: umroh-manager
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. DEFINISI KONSTANTA
define('UMROH_MANAGER_PATH', plugin_dir_path(__FILE__));
define('UMROH_MANAGER_URL', plugin_dir_url(__FILE__));
define('UMROH_MANAGER_VERSION', '1.6.0');

// 2. INCLUDE CORE FILES
require_once UMROH_MANAGER_PATH . 'includes/utils.php';
require_once UMROH_MANAGER_PATH . 'includes/cors.php';
require_once UMROH_MANAGER_PATH . 'includes/db-schema.php';
require_once UMROH_MANAGER_PATH . 'includes/class-umh-crud-controller.php';

// 3. REGISTER API ENDPOINTS
require_once UMROH_MANAGER_PATH . 'includes/api/api-stats.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-roles.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-users.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-package-categories.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-packages.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-agents.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-jamaah.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-logistics.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-payments.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-finance.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-categories.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-tasks.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-uploads.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-hr.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-hotels.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-hotel-bookings.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-flights.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-flight-bookings.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-departures.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-marketing.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-logs.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-print.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-export.php';

// 4. HOOK AKTIVASI PLUGIN
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    umh_create_db_tables();
    flush_rewrite_rules();
}

add_action('plugins_loaded', 'umh_update_db_check');
function umh_update_db_check() {
    global $umh_db_version;
    if (get_site_option('umh_db_version') != $umh_db_version) {
        umh_create_db_tables();
    }
}

// 5. ADMIN MENU & UI
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    $hook = add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', // Diubah ke 'read' agar staff bisa akses, permission detail di API
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-palmtree',
        6
    );

    // [PERBAIKAN 1] Tambahkan class 'immersive-mode' ke body HANYA di halaman ini
    add_action("load-$hook", function() {
        add_filter('admin_body_class', 'umh_add_immersive_class');
    });
}

function umh_add_immersive_class($classes) {
    // Tambahkan class agar CSS admin-style.css bisa menyembunyikan menu WP
    return "$classes immersive-mode"; 
}

function umh_render_admin_page() {
    echo '<div id="umh-app-root"></div>';
}

// 6. ENQUEUE SCRIPTS
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_enqueue_admin_scripts($hook) {
    if ($hook != 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file_path = UMROH_MANAGER_PATH . 'build/index.asset.php';
    
    if (file_exists($asset_file_path)) {
        $asset_file = include($asset_file_path);
        
        wp_enqueue_script(
            'umroh-manager-react',
            UMROH_MANAGER_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'umroh-manager-style',
            UMROH_MANAGER_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );
        
        if (file_exists(UMROH_MANAGER_PATH . 'assets/css/admin-style.css')) {
            wp_enqueue_style(
                'umroh-manager-admin-fix',
                UMROH_MANAGER_URL . 'assets/css/admin-style.css',
                array(),
                UMROH_MANAGER_VERSION
            );
        }

        // [PERBAIKAN 2] Ganti nama variabel ke 'umhData' agar cocok dengan React
        $current_user = wp_get_current_user();
        $roles = ( array ) $current_user->roles;

        wp_localize_script('umroh-manager-react', 'umhData', array(
            'rootUrl'  => get_rest_url(null, 'umh/v1/'),
            'nonce'    => wp_create_nonce('wp_rest'), // Penting untuk keamanan!
            'adminUrl' => admin_url(),
            'apiUrl'   => get_rest_url(null, 'umh/v1/'), // Tambahan untuk konsistensi
            'currentUser' => array(
                'id' => $current_user->ID,
                'display_name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'role' => $roles[0] // Role utama WP
            )
        ));
    } else {
        wp_add_inline_script('common', 'console.error("Umroh Manager: Build files not found.");');
    }
}
?>