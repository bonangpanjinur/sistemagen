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
            'read', 
            'umroh-manager',
            [$this, 'render_dashboard'],
            'dashicons-groups',
            6
        );
    }

    public function render_dashboard() {
        // PERBAIKAN: Memanggil nama fungsi yang benar (ada akhiran _react)
        if (function_exists('umroh_manager_render_dashboard_react')) {
            umroh_manager_render_dashboard_react();
        } else {
            echo '<div class="error"><p>Error: Fungsi render dashboard tidak ditemukan. Pastikan file admin/dashboard-react.php termuat.</p></div>';
        }
    }

    public function enqueue_admin_assets($hook) {
        // Pastikan hanya load di halaman plugin kita
        // Menggunakan strpos agar lebih fleksibel
        if (strpos($hook, 'page_umroh-manager') === false) {
            return;
        }

        $asset_file_path = UMROH_MANAGER_PATH . 'build/index.asset.php';

        if (!file_exists($asset_file_path)) {
            return; // File build belum ada, jangan lakukan apa-apa (atau log error)
        }

        // Load CSS & JS Build React
        $asset_file = include($asset_file_path);

        // ===============================================================
        // FIX KRITIKAL: PERBAIKAN DEPENDENSI (REACT -> WP-ELEMENT)
        // ===============================================================
        // WordPress menggunakan 'wp-element' sebagai pengganti 'react' & 'react-dom'.
        // Jika index.asset.php meminta 'react', script tidak akan jalan.
        $dependencies = $asset_file['dependencies'];
        
        // Hapus 'react' dan 'react-dom' dari daftar tunggu
        $dependencies = array_diff($dependencies, ['react', 'react-dom']);
        
        // Tambahkan 'wp-element' (React versi WP)
        $dependencies[] = 'wp-element';
        $dependencies[] = 'wp-i18n';
        $dependencies[] = 'wp-components'; // Opsional, untuk UI bawaan WP
        
        // Bersihkan array duplicate
        $dependencies = array_unique($dependencies);
        // ===============================================================

        wp_enqueue_script(
            'umroh-manager-app',
            UMROH_MANAGER_URL . 'build/index.js',
            $dependencies, // Gunakan dependensi yang sudah diperbaiki
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'umroh-manager-style',
            UMROH_MANAGER_URL . 'build/index.css',
            [],
            $asset_file['version']
        );

        // PENTING: Mengirim Data Konfigurasi ke React
        wp_localize_script('umroh-manager-app', 'umhData', [
            'apiUrl' => esc_url_raw(rest_url('umh/v1/')), // Pastikan namespace sesuai (umh/v1)
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'assetsUrl' => UMROH_MANAGER_URL . 'assets/',
            'user' => wp_get_current_user(),
            'currentUser' => [
                'id' => get_current_user_id(),
                'display_name' => wp_get_current_user()->display_name,
                'email' => wp_get_current_user()->user_email,
                'avatar' => get_avatar_url(get_current_user_id()),
                'role' => (array) wp_get_current_user()->roles[0] ?? 'subscriber'
            ],
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