<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://umrohweb.site
 * Description: Sistem Manajemen Travel Umroh & Haji dengan Dashboard React Modern.
 * Version: 1.0.0
 * Author: Bonang Panji
 * Author URI: https://bonangpanjinur.com
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Define Constants
define('UMH_VERSION', '1.0.0');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include Core Helper Functions
if (file_exists(UMH_PLUGIN_DIR . 'includes/utils.php')) {
    require_once UMH_PLUGIN_DIR . 'includes/utils.php';
}

// Include API Loader
if (file_exists(UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php')) {
    require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
}

// Include Login Customizer (Optional)
if (file_exists(UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php')) {
    require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php';
}

/**
 * Activation Hook
 * Membuat tabel database saat plugin diaktifkan.
 */
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    // FIX: Load file db-schema.php agar fungsi umh_create_tables() tersedia
    if (file_exists(UMH_PLUGIN_DIR . 'includes/db-schema.php')) {
        require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
        
        // Pastikan fungsi ada sebelum dipanggil
        if (function_exists('umh_create_tables')) {
            umh_create_tables();
        }
    }
}

/**
 * Deactivation Hook
 */
register_deactivation_hook(__FILE__, 'umh_deactivate_plugin');

function umh_deactivate_plugin() {
    flush_rewrite_rules();
}

/**
 * Initialize Plugin
 * Menjalankan API Loader saat WordPress dimuat.
 */
add_action('plugins_loaded', 'umh_init_plugin');

function umh_init_plugin() {
    if (class_exists('UMH_API_Loader')) {
        UMH_API_Loader::init();
    }
}

/**
 * Add Admin Menu
 * Menambahkan menu halaman dashboard React ke sidebar admin.
 */
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    add_menu_page(
        'Umroh Manager',          // Page Title
        'Umroh Manager',          // Menu Title
        'manage_options',         // Capability
        'umroh-manager',          // Menu Slug
        'umh_render_react_app',   // Callback Function
        'dashicons-groups',       // Icon
        2                         // Position
    );
}

/**
 * Render React App Wrapper
 * Memanggil file template PHP yang berisi div mounting point untuk React.
 */
function umh_render_react_app() {
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

/**
 * Enqueue Scripts & Styles
 * Memuat file JS dan CSS hasil build React ke halaman admin.
 */
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_enqueue_admin_scripts($hook) {
    // Hanya muat di halaman plugin kita
    if ($hook != 'toplevel_page_umroh-manager') {
        return;
    }

    // Pastikan file asset.php ada (hasil build npm)
    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    
    if (file_exists($asset_file_path)) {
        $asset_file = include($asset_file_path);
        
        // Enqueue Script React
        wp_enqueue_script(
            'umh-react-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        // Enqueue Style React
        wp_enqueue_style(
            'umh-react-styles',
            UMH_PLUGIN_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );

        // Kirim data penting ke JS (Nonces, URL)
        wp_localize_script('umh-react-app', 'umhData', array(
            'root_url' => get_rest_url(),
            'nonce'    => wp_create_nonce('wp_rest'),
            'admin_url'=> admin_url(),
            'site_url' => site_url(),
            'plugin_url'=> UMH_PLUGIN_URL
        ));
    }
}