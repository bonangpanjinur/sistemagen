<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh dengan React Dashboard
 * Version: 2.0.0
 * Author: Bonang Panji
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// Definisi Konstanta
define('UMROH_MANAGER_PATH', plugin_dir_path(__FILE__));
define('UMROH_MANAGER_URL', plugin_dir_url(__FILE__));
define('UMROH_MANAGER_VERSION', '2.0.0');

// 1. Load Class Loader API Baru
require_once UMROH_MANAGER_PATH . 'includes/class-umh-api-loader.php';

// 2. Load Halaman Admin
require_once UMROH_MANAGER_PATH . 'admin/dashboard-react.php';
require_once UMROH_MANAGER_PATH . 'admin/settings-page.php';

class UmrohManagerHybrid {
    
    private $api_loader;

    public function __construct() {
        // Inisialisasi API Loader
        $this->api_loader = new UMH_API_Loader();
        
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function register_admin_menu() {
        add_menu_page(
            'Umroh Manager',
            'Umroh Manager',
            'read', // Kapabilitas minimal agar semua role bisa akses (nanti difilter di React)
            'umroh-manager',
            [$this, 'render_dashboard'],
            'dashicons-groups',
            6
        );
    }

    public function render_dashboard() {
        // Memanggil fungsi dari admin/dashboard-react.php
        umroh_manager_render_dashboard();
    }

    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_umroh-manager') {
            return;
        }

        // Load CSS & JS Build React
        $asset_file = include(UMROH_MANAGER_PATH . 'build/index.asset.php');

        wp_enqueue_script(
            'umroh-manager-app',
            UMROH_MANAGER_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'umroh-manager-style',
            UMROH_MANAGER_URL . 'build/index.css',
            [],
            $asset_file['version']
        );

        // PENTING: Mengirim Data Konfigurasi ke React (URL API & Nonce)
        wp_localize_script('umroh-manager-app', 'umrohManagerData', [
            'root' => esc_url_raw(rest_url('umroh-manager/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'assetsUrl' => UMROH_MANAGER_URL . 'assets/',
            'user' => wp_get_current_user(),
            'capabilities' => $this->get_current_user_capabilities()
        ]);
    }

    private function get_current_user_capabilities() {
        $user = wp_get_current_user();
        return array_keys($user->allcaps);
    }
}

// Jalankan Plugin
new UmrohManagerHybrid();