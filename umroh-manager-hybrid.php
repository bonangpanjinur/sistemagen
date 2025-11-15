<?php
/**
 * File: umroh-manager-hybrid.php
 *
 * File plugin utama, dimodifikasi untuk me-load file API baru
 * (api-roles.php dan api-payments.php)
 *
 * MODIFIKASI:
 * - Menambahkan `umh_package_prices` ke daftar tabel di `umh_uninstall_plugin`.
 * - Menambahkan `add_menu_page` di `umh_init` (dari perbaikan sebelumnya).
 * - Menambahkan `wp_enqueue_style` untuk `build/index.css` di `umh_enqueue_admin_assets`.
 *
 * PERBAIKAN (15/11/2025):
 * - Menghapus `wp_enqueue_style` manual untuk `build/index.css`.
 * - Biarkan `wp_enqueue_script` yang menangani pemuatan CSS-nya
 * melalui file `index.asset.php` (best practice @wordpress/scripts).
 * - Mengubah dependensi `umh-admin-style` menjadi `umh-react-app`.
 *
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI:  https://github.com/bonangpanjinur/travelmanajemen
 * Description: A hybrid WordPress plugin using React for managing Umroh travels.
 * Version:     0.1.2
 * Author:      Bonang Panji Nur
 * Author URI:  https://bonang.dev
 * License:     GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: umroh-manager-hybrid
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('UMH_VERSION', '0.1.2');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Aktivasi Plugin: Buat tabel database
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    require_once(UMH_PLUGIN_DIR . 'includes/db-schema.php');
    umh_create_db_schema();
    
    // Tambahkan role dasar jika belum ada
    umh_add_default_roles_and_caps();
    
    // Tambahkan admin default ke tabel umh_users jika belum ada
    // Fungsi ini sekarang harusnya ada di api-users.php atau utils.php
    // Memanggilnya di sini mungkin terlalu dini
    // umh_add_default_admin_user(); 
}

// Tambahkan role WP kustom
function umh_add_default_roles_and_caps() {
    add_role('umh_agent', 'Travel Agent', [
        'read' => true,
        'umh_view_dashboard' => true,
        'umh_manage_own_jamaah' => true,
    ]);
    
    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->add_cap('umh_manage_all');
        $admin_role->add_cap('umh_view_dashboard');
    }
}

// Deaktivasi Plugin
register_deactivation_hook(__FILE__, 'umh_deactivate_plugin');
function umh_deactivate_plugin() {
    // Bisa tambahkan logic cleanup jika perlu
    // Misalnya, hapus role
    remove_role('umh_agent');
    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->remove_cap('umh_manage_all');
        $admin_role->remove_cap('umh_view_dashboard');
    }
}

// Uninstall Plugin
register_uninstall_hook(__FILE__, 'umh_uninstall_plugin');
function umh_uninstall_plugin() {
    // Hapus tabel database
    global $wpdb;
    $tables = [
        'umh_categories', 'umh_packages', 'umh_jamaah', 'umh_finance',
        'umh_flights', 'umh_hotels', 'umh_flight_bookings', 'umh_hotel_bookings',
        'umh_tasks', 'umh_users', 'umh_agents', 'umh_logs', 'umh_documents',
        'umh_departures', 'umh_manifest', 'umh_settings', 'umh_notifications',
        'umh_roles', 'umh_payments', 
        'umh_package_prices' // Termasuk tabel baru
    ];

    foreach ($tables as $table) {
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}{$table}");
    }

    // Hapus options
    delete_option('umh_db_version');
    delete_option('umh_settings');

    // Hapus role
    remove_role('umh_agent');
    $admin_role = get_role('administrator');
    if ($admin_role) {
        $admin_role->remove_cap('umh_manage_all');
        $admin_role->remove_cap('umh_view_dashboard');
    }
}


// Inisialisasi Plugin
add_action('plugins_loaded', 'umh_init');
function umh_init() {
    // Load text domain untuk translasi
    load_plugin_textdomain('umroh-manager-hybrid', false, dirname(plugin_basename(__FILE__)) . '/languages/');

    // Load file-file penting
    require_once(UMH_PLUGIN_DIR . 'includes/utils.php');
    require_once(UMH_PLUGIN_DIR . 'includes/cors.php');
    require_once(UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php');
    
    // Load Halaman Admin
    require_once(UMH_PLUGIN_DIR . 'admin/dashboard-react.php');
    require_once(UMH_PLUGIN_DIR . 'admin/settings-page.php');

    // Load API Endpoints
    umh_load_api_endpoints();

    // Mendaftarkan halaman menu admin (Perbaikan dari sebelumnya)
    add_action('admin_menu', 'umh_register_admin_menu');
}

/**
 * [FUNGSI BARU]
 * Mendaftarkan halaman menu utama ke sidebar admin WordPress.
 */
function umh_register_admin_menu() {
    add_menu_page(
        __('Travel Manajemen', 'umroh-manager-hybrid'), // Judul Halaman
        __('Travel Manajemen', 'umroh-manager-hybrid'), // Judul Menu
        'manage_options', // Kapabilitas (bisa diganti nanti, misal: 'umh_view_dashboard')
        'umroh-manager-hybrid', // Menu Slug (PENTING: harus sama dengan yang dicek di enqueue)
        'umroh_manager_render_dashboard_react', // Fungsi callback untuk render
        'dashicons-palmtree', // Ikon menu
        25 // Posisi
    );
}

// Fungsi untuk me-load semua file API
function umh_load_api_endpoints() {
    $api_files = [
        'api-stats',
        'api-categories',
        'api-packages', // Akan dimodifikasi
        'api-jamaah',
        'api-finance',
        'api-flights',
        'api-hotels',
        'api-tasks',
        'api-users',
        'api-departures',
        'api-marketing',
        'api-hr',
        'api-uploads',
        'api-print',
        'api-export',
        'api-logs',
        'api-roles',
        'api-payments',
        'api-flight-bookings',
        'api-hotel-bookings'
    ];

    foreach ($api_files as $file) {
        $filepath = UMH_PLUGIN_DIR . "includes/api/{$file}.php";
        if (file_exists($filepath)) {
            require_once($filepath);
        }
    }

    // Hook untuk endpoint kustom
    do_action('umh_load_custom_api');
}

// Enqueue script dan style untuk admin
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_assets');
function umh_enqueue_admin_assets($hook) {
    // Hanya load di halaman plugin kita
    if ($hook != 'toplevel_page_umroh-manager-hybrid') {
        return;
    }

    // Load React Build
    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    if (!file_exists($asset_file_path)) {
        // Tampilkan error jika file asset tidak ada (belum di-build)
        wp_die(
            __('File asset build/index.asset.php tidak ditemukan. Apakah Anda sudah menjalankan `npm run build`?', 'umroh-manager-hybrid'),
            __('Build Error', 'umroh-manager-hybrid')
        );
        return;
    }
    
    $asset_file = include($asset_file_path);

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true // Load di footer
    );

    // === PERBAIKAN: HAPUS `wp_enqueue_style` manual untuk 'build/index.css' ===
    // Baris ini dihapus karena `wp_enqueue_script` akan otomatis
    // me-load style yang terdaftar di `index.asset.php`
    // (setelah Anda `npm run build` dengan import CSS di index.jsx).
    /*
    wp_enqueue_style(
        'umh-react-app-styles', // Handle unik untuk style
        UMH_PLUGIN_URL . 'build/index.css', // Path ke file CSS hasil build
        [], // Dependencies
        $asset_file['version'] // Versi yang sama dengan JS
    );
    */
    // =======================================================================

    // Load CSS admin-style.css (untuk override)
    // PERBAIKAN: Ubah dependensi ke 'umh-react-app' (script handle)
    // Kita tetap memuat ini JIKA Anda ingin menambahkan override CSS manual
    wp_enqueue_style(
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        ['umh-react-app'], // Dependen pada script utama
        UMH_VERSION
    );

    // Loloskan data dari PHP ke JavaScript
    wp_localize_script('umh-react-app', 'umh_wp_data', [
        'api_url'  => esc_url_raw(rest_url('umh/v1/')),
        'nonce'    => wp_create_nonce('wp_rest'), // Nonce untuk keamanan
        'user'     => umh_get_current_user_data_for_react(), // Fungsi baru untuk data user
    ]);
}

/**
 * Mendapatkan data user yang sedang login untuk dikirim ke React.
 * Ini bisa berupa Super Admin (dari cookie) atau Karyawan (dari token).
 * * *Fungsi ini perlu didefinisikan, idealnya di utils.php, tapi kita letakkan di sini sementara.*
 */
if (!function_exists('umh_get_current_user_data_for_react')) {
    function umh_get_current_user_data_for_react() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'umh_users';

        // Cek jika Super Admin WP sedang login
        if (is_user_logged_in() && current_user_can('manage_options')) {
            $wp_user = wp_get_current_user();
            
            // Coba sinkronkan dengan tabel umh_users (penting untuk auto-login)
            $umh_user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE wp_user_id = %d", $wp_user->ID));
            
            if (!$umh_user) {
                // Jika belum ada, coba cari berdasarkan email
                $umh_user_by_email = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE email = %s", $wp_user->user_email));

                if (!$umh_user_by_email) {
                    // Buat baru jika tidak ada sama sekali
                    $wpdb->insert($table_name, [
                        'wp_user_id' => $wp_user->ID,
                        'email' => $wp_user->user_email,
                        'full_name' => $wp_user->display_name,
                        'role' => 'super_admin', // Role khusus
                        'status' => 'active',
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql'),
                    ]);
                    $umh_user_id = $wpdb->insert_id;
                    $umh_user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $umh_user_id));
                } else {
                    // Tautkan akun jika email cocok
                    $wpdb->update($table_name, 
                        ['wp_user_id' => $wp_user->ID, 'role' => 'super_admin'], 
                        ['id' => $umh_user_by_email->id]
                    );
                    $umh_user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $umh_user_by_email->id));
                }
            }

            // Buat token sementara untuk Super Admin agar API-nya berfungsi
            $token = bin2hex(random_bytes(32));
            $expires = new DateTime('+1 hour'); // Token singkat untuk sesi ini
            
            $wpdb->update(
                $table_name,
                ['auth_token' => $token, 'token_expires' => $expires->format('Y-m-d H:i:s')],
                ['id' => $umh_user->id]
            );

            return [
                'id'    => $umh_user->id, // [PERBAIKAN] Kirim juga ID umh_user
                'email' => $umh_user->email,
                'name'  => $umh_user->full_name,
                'role'  => $umh_user->role,
                'token' => $token
            ];
        }
        
        // Jika bukan admin, return user kosong (React akan handle login)
        return [
            'name' => 'Guest',
            'role' => 'guest',
            'token' => null
        ];
    }
}