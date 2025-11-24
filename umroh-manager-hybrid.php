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
// Pastikan urutan ini benar agar tidak ada error class not found
require_once UMROH_MANAGER_PATH . 'includes/api/api-stats.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-roles.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-users.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-package-categories.php'; // [BARU v1.6]
require_once UMROH_MANAGER_PATH . 'includes/api/api-packages.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-agents.php';             // [BARU v1.4]
require_once UMROH_MANAGER_PATH . 'includes/api/api-jamaah.php';
require_once UMROH_MANAGER_PATH . 'includes/api/api-logistics.php';          // [BARU v1.4]
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
// Menjalankan pembuatan tabel database saat plugin diaktifkan
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    // Memanggil fungsi dari db-schema.php
    umh_create_db_tables();
    
    // Setup role capabilities jika perlu (Opsional)
    // umh_setup_roles();
    
    flush_rewrite_rules();
}

// 5. HOOK UPDATE PLUGIN (Opsional, untuk memicu update db schema saat versi naik)
add_action('plugins_loaded', 'umh_update_db_check');
function umh_update_db_check() {
    global $umh_db_version;
    if (get_site_option('umh_db_version') != $umh_db_version) {
        umh_create_db_tables();
    }
}

// 6. ADMIN MENU & UI
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    add_menu_page(
        'Umroh Manager',          // Page Title
        'Umroh Manager',          // Menu Title
        'manage_options',         // Capability (Admin only)
        'umroh-manager',          // Menu Slug
        'umh_render_admin_page',  // Callback Function
        'dashicons-palmtree',     // Icon
        6                         // Position
    );
}

function umh_render_admin_page() {
    // Container tempat React App akan di-render
    echo '<div id="umh-app-root"></div>';
}

// 7. ENQUEUE SCRIPTS (React Build)
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_enqueue_admin_scripts($hook) {
    // Hanya load script di halaman plugin kita agar tidak bentrok dengan plugin lain
    if ($hook != 'toplevel_page_umroh-manager') {
        return;
    }

    // Pastikan file asset build ada (hasil dari npm run build)
    $asset_file_path = UMROH_MANAGER_PATH . 'build/index.asset.php';
    
    if (file_exists($asset_file_path)) {
        $asset_file = include($asset_file_path);
        
        // Enqueue React JS Bundle
        wp_enqueue_script(
            'umroh-manager-react',
            UMROH_MANAGER_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true // Load di footer
        );

        // Enqueue Styles
        wp_enqueue_style(
            'umroh-manager-style',
            UMROH_MANAGER_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );
        
        // Custom Admin Fixes (jika ada file CSS manual)
        if (file_exists(UMROH_MANAGER_PATH . 'assets/css/admin-style.css')) {
            wp_enqueue_style(
                'umroh-manager-admin-fix',
                UMROH_MANAGER_URL . 'assets/css/admin-style.css',
                array(),
                UMROH_MANAGER_VERSION
            );
        }

        // Pass Data ke JS (Settings & Nonce)
        wp_localize_script('umroh-manager-react', 'umhSettings', array(
            'rootUrl'  => get_rest_url(null, 'umh/v1/'),
            'nonce'    => wp_create_nonce('wp_rest'),
            'adminUrl' => admin_url(),
            'currentUserId' => get_current_user_id(),
            'siteName' => get_bloginfo('name')
        ));
    } else {
        // Fallback message jika build belum dijalankan
        wp_add_inline_script('common', 'console.error("Umroh Manager: Build files not found. Please run npm run build.");');
    }
}
?>