<?php
/**
 * Plugin Name: Sistem Agen Umroh Hybrid
 * Description: Sistem manajemen agen travel umroh dengan interface React Full-Screen.
 * Version: 1.0.0
 * Author: Bonang Panji
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define Constants
define('UMH_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '1.0.0');

// Include dependencies
require_once UMH_PLUGIN_PATH . 'includes/utils.php';
require_once UMH_PLUGIN_PATH . 'includes/db-schema.php';
require_once UMH_PLUGIN_PATH . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_PATH . 'includes/admin-login-customizer.php';

class Umroh_Manager_Hybrid {

    private $plugin_screen_hook_suffix = null;

    public function __construct() {
        // Initialize API
        new UMH_API_Loader();
        
        // Admin Menu
        add_action('admin_menu', [$this, 'setup_admin_menu']);
        
        // Enqueue Assets
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        
        // Body Class Filter (Untuk menyuntikkan class khusus saat di halaman plugin)
        add_filter('admin_body_class', [$this, 'add_fullscreen_body_class']);
        
        // Initialize DB on activation
        register_activation_hook(__FILE__, ['UMH_DB_Schema', 'create_tables']);
    }

    public function setup_admin_menu() {
        // Menggunakan add_menu_page untuk membuat menu utama
        // Capability 'read' digunakan agar semua user yang login bisa akses (nanti dibatasi di API/React)
        $this->plugin_screen_hook_suffix = add_menu_page(
            'Sistem Agen',          // Page Title
            'Sistem Agen',          // Menu Title
            'read',                 // Capability (Low level, logic proteksi ada di React/API)
            'umroh-manager',        // Menu Slug
            [$this, 'render_dashboard'], // Callback function
            'dashicons-groups',     // Icon
            2                       // Position
        );
    }

    public function render_dashboard() {
        require_once UMH_PLUGIN_PATH . 'admin/dashboard-react.php';
    }

    public function enqueue_admin_assets($hook) {
        // Hanya load script jika berada di halaman plugin kita
        if ($hook !== $this->plugin_screen_hook_suffix) {
            return;
        }

        // Matikan Admin Bar WordPress hanya di halaman ini
        add_filter('show_admin_bar', '__return_false');

        // Load Script React yang sudah di-build
        $asset_file = include(UMH_PLUGIN_PATH . 'build/index.asset.php');

        wp_enqueue_script(
            'umroh-manager-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        // Load CSS React
        wp_enqueue_style(
            'umroh-manager-app-style',
            UMH_PLUGIN_URL . 'build/index.css',
            [],
            $asset_file['version']
        );

        // Load Custom Admin Style (CSS Khusus untuk Full Screen Takeover)
        wp_enqueue_style(
            'umroh-manager-admin-override',
            UMH_PLUGIN_URL . 'assets/css/admin-style.css',
            [],
            UMH_VERSION
        );

        // Localize Script untuk mengirim data dari PHP ke JS (React)
        wp_localize_script('umroh-manager-app', 'umrohManagerSettings', [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
            'adminUrl' => admin_url('admin.php?page=umroh-manager'),
            'currentUser' => wp_get_current_user(),
            'logoutUrl' => wp_logout_url(wp_login_url())
        ]);
    }

    /**
     * Menambahkan class 'umh-fullscreen-mode' ke body tag HTML
     * Ini kunci agar CSS bisa menargetkan halaman ini saja
     */
    public function add_fullscreen_body_class($classes) {
        $screen = get_current_screen();
        
        if ($screen && $screen->id === $this->plugin_screen_hook_suffix) {
            return $classes . ' umh-fullscreen-mode';
        }
        
        return $classes;
    }
}

// Instantiate Plugin
new Umroh_Manager_Hybrid();