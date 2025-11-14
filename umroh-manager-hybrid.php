<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI:  https://example.com/
 * Description: Manages Umroh packages, jamaah, finance, and HR with a hybrid WP-Admin and Headless API approach.
 * Version:     1.2.0
 * Author:      Your Name
 * Author URI:  https://example.com/
 * Text Domain: umh
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Inisialisasi Database
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';

// 2. Utilitas Inti & Keamanan
require_once UMH_PLUGIN_DIR . 'includes/utils.php';

// 3. Penanganan CORS (jika diperlukan untuk headless)
// require_once UMH_PLUGIN_DIR . 'includes/cors.php'; // Uncomment jika domain frontend berbeda

// 4. [BARU] Load Generic CRUD Controller
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

// 5. Muat semua file API Endpoints
$api_files = glob(UMH_PLUGIN_DIR . 'includes/api/*.php');
foreach ($api_files as $file) {
    if (basename($file) !== 'api-manifest.php') { // Jangan muat file yang sudah usang
        require_once $file;
    }
}

// 6. Halaman Admin (Dashboard & Pengaturan)
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';

// 7. Enqueue scripts untuk Admin Dashboard React
function umh_admin_enqueue_scripts($hook) {
    // Hanya muat di halaman dashboard kita
    if ('toplevel_page_umroh-manager' !== $hook) {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-admin-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        [],
        filemtime(UMH_PLUGIN_DIR . 'assets/css/admin-style.css')
    );

    // Amankan API untuk WP Admin (Super Admin)
    $current_user = wp_get_current_user();
    if (umh_is_super_admin($current_user)) {
        wp_localize_script('umh-admin-react-app', 'umhData', [
            'api_url' => esc_url_raw(rest_url('umh/v1/')),
            'api_nonce' => wp_create_nonce('wp_rest'),
            'is_wp_admin' => true,
            'current_user' => [
                'display_name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'role' => 'super_admin', // Beri role eksplisit
            ],
        ]);
    }
}
add_action('admin_enqueue_scripts', 'umh_admin_enqueue_scripts');


// 8. [BARU] Menyajikan Service Worker untuk PWA
function umh_serve_service_worker() {
    // Cek apakah request adalah untuk service-worker.js di root
    if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/service-worker.js') {
        $sw_file = UMH_PLUGIN_DIR . 'pwa/service-worker.js';
        
        if (file_exists($sw_file)) {
            header('Content-Type: application/javascript');
            header('Service-Worker-Allowed: /');
            readfile($sw_file);
            exit();
        }
    }
    
    // Juga sajikan manifest.json
    if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/manifest.json') {
        $manifest_file = UMH_PLUGIN_DIR . 'pwa/manifest.json';
        
        if (file_exists($manifest_file)) {
            header('Content-Type: application/json');
            readfile($manifest_file);
            exit();
        }
    }
}
// Hook ke 'init' agar berjalan sebelum WordPress menangani URL
add_action('init', 'umh_serve_service_worker');