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
// Pastikan semua file API ada di folder includes/api/
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
    // [PENTING] Flush rules agar WordPress sadar ada route API baru
    flush_rewrite_rules();
}

// Cek update DB setiap plugin dimuat (aman, hanya jalan jika versi beda)
add_action('plugins_loaded', 'umh_update_db_check');
function umh_update_db_check() {
    global $umh_db_version;
    if (get_site_option('umh_db_version') != $umh_db_version) {
        umh_create_db_tables();
        flush_rewrite_rules(); // Flush juga saat update
    }
}

// 5. ADMIN MENU & UI
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    $hook = add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', 
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-palmtree',
        6
    );

    add_action("load-$hook", function() {
        add_filter('admin_body_class', 'umh_add_immersive_class');
    });
}

function umh_add_immersive_class($classes) {
    return "$classes immersive-mode"; 
}

function umh_render_admin_page() {
    // ID ini harus sesuai dengan yang dicari oleh ReactDOM di src/index.jsx
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

        $current_user = wp_get_current_user();
        $roles = ( array ) $current_user->roles;

        // Data penting yang dikirim ke React
        wp_localize_script('umroh-manager-react', 'umhData', array(
            'rootUrl'  => get_rest_url(null, 'umh/v1/'),
            'nonce'    => wp_create_nonce('wp_rest'),
            'adminUrl' => admin_url(),
            'apiUrl'   => get_rest_url(null, 'umh/v1/'),
            'currentUser' => array(
                'id' => $current_user->ID,
                'display_name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'role' => $roles[0]
            ),
            // Bisa tambahkan roles list global di sini jika perlu
            'roles' => [] 
        ));
    } else {
        wp_add_inline_script('common', 'console.error("Umroh Manager: Build files not found. Jalankan npm run build.");');
    }
}
?>