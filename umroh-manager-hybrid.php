<?php
/*
Plugin Name: Umroh Manager Hybrid
Plugin URI: https://bonangpanjinur.com
Description: Sistem Manajemen Umroh Hybrid (React + PHP)
Version: 1.0.0
Author: Bonang Panji Nur
Author URI: https://bonangpanjinur.com
License: GPLv2 or later
Text Domain: umroh-manager-hybrid
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'UMH_PATH', plugin_dir_path( __FILE__ ) );
define( 'UMH_URL', plugin_dir_url( __FILE__ ) );

// Include dependencies
require_once UMH_PATH . 'includes/utils.php';
require_once UMH_PATH . 'includes/db-schema.php';
require_once UMH_PATH . 'includes/cors.php';
require_once UMH_PATH . 'includes/class-umh-api-loader.php';
require_once UMH_PATH . 'includes/admin-login-customizer.php';

// Initialize API
$api_loader = new UMH_Api_Loader();

// Activation hook
register_activation_hook( __FILE__, 'umh_activate_plugin' );

function umh_activate_plugin() {
    umh_create_tables();
    flush_rewrite_rules();
}

// Add admin menu
add_action( 'admin_menu', 'umh_add_admin_menu' );

function umh_add_admin_menu() {
    add_menu_page(
        'Sistem Agen',
        'Sistem Agen',
        'read', // Capability 'read' agar bisa diakses user level rendah jika perlu, nanti dibatasi di API
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-groups',
        2
    );
}

function umh_render_admin_page() {
    require_once UMH_PATH . 'admin/dashboard-react.php';
}

// Enqueue scripts for React
add_action( 'admin_enqueue_scripts', 'umh_enqueue_admin_scripts' );

function umh_enqueue_admin_scripts( $hook ) {
    // Pastikan script hanya dimuat di halaman plugin kita
    if ( 'toplevel_page_umroh-manager' !== $hook ) {
        return;
    }

    $asset_file = UMH_PATH . 'build/index.asset.php';

    if ( ! file_exists( $asset_file ) ) {
        return;
    }

    $assets = include( $asset_file );

    // Enqueue JS
    wp_enqueue_script(
        'umh-react-app',
        UMH_URL . 'build/index.js',
        $assets['dependencies'],
        $assets['version'],
        true
    );

    // Localize Script - Mengirim data dari PHP ke JS
    // Handle 'umh-react-app' harus sama persis dengan handle wp_enqueue_script di atas
    wp_localize_script( 'umh-react-app', 'umhData', array(
        'root' => esc_url_raw( rest_url( 'umh/v1/' ) ),
        'nonce' => wp_create_nonce( 'wp_rest' ),
        'adminUrl' => admin_url(),
        'currentUser' => wp_get_current_user(),
    ));

    // Enqueue CSS
    wp_enqueue_style(
        'umh-react-app-style',
        UMH_URL . 'build/index.css',
        array(),
        $assets['version']
    );
}