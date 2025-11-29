<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://umrohweb.site
 * Description: Sistem Manajemen Travel Umroh & Haji dengan Dashboard React Modern.
 * Version: 1.0.4
 * Author: Bonang Panji
 * Author URI: https://bonangpanjinur.com
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Define Constants
define('UMH_VERSION', '1.0.4');
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
 */
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    if (file_exists(UMH_PLUGIN_DIR . 'includes/db-schema.php')) {
        require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
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
 */
add_action('plugins_loaded', 'umh_init_plugin');

function umh_init_plugin() {
    if (class_exists('UMH_API_Loader')) {
        UMH_API_Loader::init();
    }
}

/**
 * Add Admin Menu
 */
add_action('admin_menu', 'umh_add_admin_menu');

function umh_add_admin_menu() {
    // FIX: Mengubah posisi dari 2 ke 30 agar tidak bentrok dengan Dashboard bawaan WP
    add_menu_page(
        'Umroh Manager',          
        'Umroh Manager',          
        'manage_options',         
        'umroh-manager',          
        'umh_render_react_app',   
        'dashicons-groups',       
        30 // Posisi aman (di bawah Comments)                        
    );
}

/**
 * Render React App Wrapper (HTML LANGSUNG DISINI)
 */
function umh_render_react_app() {
    ?>
    <div class="wrap">
        <h1 class="wp-heading-inline">Umroh Manager Dashboard</h1>
        <hr class="wp-header-end">
        
        <!-- DEBUG: Penanda bahwa PHP berhasil merender HTML -->
        <!-- Jika Anda bisa membaca ini di View Source, berarti PHP jalan -->
        
        <!-- INI ADALAH WADAH YANG DICARI OLEH REACT -->
        <!-- ID harus PERSIS 'umroh-manager-app' -->
        <div id="umroh-manager-app">
            <div style="
                display: flex; 
                flex-direction: column;
                justify-content: center; 
                align-items: center; 
                height: 400px; 
                background: #fff; 
                border: 1px solid #ccd0d4;
                margin-top: 20px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.05);
                border-radius: 4px;
            ">
                <span class="dashicons dashicons-update" style="font-size: 50px; width: 50px; height: 50px; animation: spin 1s linear infinite; color: #2271b1;"></span>
                <h2 style="margin-top: 20px; color: #1d2327;">Memuat Aplikasi...</h2>
                <p>Menyiapkan lingkungan React...</p>
            </div>
        </div>

        <style>
            @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
            /* Pastikan wadah terlihat */
            #umroh-manager-app {
                min-height: 400px;
                display: block;
            }
        </style>
    </div>
    <?php
}

/**
 * Enqueue Scripts & Styles
 */
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_enqueue_admin_scripts($hook) {
    // Cek apakah kita di halaman plugin 'umroh-manager'
    if (strpos($hook, 'umroh-manager') === false) {
        return;
    }

    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    
    if (!file_exists($asset_file_path)) {
        return;
    }

    $asset_file = include($asset_file_path);
    
    // Polyfill React 18 createRoot untuk WP lama
    // Ini disisipkan SEBELUM script utama dimuat
    $polyfill = "
    (function() {
        var wpElement = window.wp && window.wp.element;
        if (wpElement) {
             // Mock createRoot jika tidak ada
             if (!wpElement.createRoot) {
                console.log('UMH: Polyfill createRoot diterapkan.');
                wpElement.createRoot = function(c) {
                    return { render: function(e) { wpElement.render(e, c); } };
                };
             }
        }
    })();
    ";
    
    wp_register_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        time(), // Force refresh agar tidak kena cache browser
        true // WAJIB DI FOOTER agar HTML sudah siap saat JS jalan
    );
    
    wp_add_inline_script('umh-react-app', $polyfill, 'before');
    
    wp_enqueue_script('umh-react-app');

    wp_enqueue_style(
        'umh-react-styles',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        time()
    );

    wp_localize_script('umh-react-app', 'umhData', array(
        'root_url' => get_rest_url(),
        'nonce'    => wp_create_nonce('wp_rest'),
        'admin_url'=> admin_url(),
        'site_url' => site_url(),
        'plugin_url'=> UMH_PLUGIN_URL
    ));
}