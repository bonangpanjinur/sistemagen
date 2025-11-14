<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Plugin URI: https://bonangpanjinur.com/
 * Description: Plugin manajemen travel umroh dengan dashboard hybrid (Admin WP & React).
 * Version: 1.0.0
 * Author: Bonang Panji Nur
 * Author URI: https://bonang.my.id/
 * License: GPLv2 or later
 * Text Domain: umroh-manager-hybrid
 * * @package UmrohManagerHybrid
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class UmrohManagerHybrid
{
    private static $instance;
    private $db_version = '1.0';

    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        // Muat dependensi
        require_once plugin_dir_path(__FILE__) . 'includes/utils.php';
        require_once plugin_dir_path(__FILE__) . 'includes/db-schema.php';
        require_once plugin_dir_path(__FILE__) . 'includes/cors.php'; // Muat CORS handler

        // Hook Aktivasi & Deaktivasi
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));

        // Inisialisasi plugin
        add_action('plugins_loaded', array($this, 'init'));
    }

    public function init()
    {
        // Cek versi DB
        $this->check_db_version();

        // Tambahkan menu admin
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Daftarkan API endpoint
        add_action('rest_api_init', array($this, 'register_api_routes'));

        // Buat halaman dashboard (jika belum ada)
        add_action('init', array($this, 'create_dashboard_page'));

        // Muat template untuk dashboard React
        add_filter('template_include', array($this, 'load_react_app_template'));

        // Enqueue script untuk React App (Frontend)
        add_action('wp_enqueue_scripts', array($this, 'enqueue_react_app_scripts'));
        
        // Enqueue script untuk Admin (Backend)
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));

        // PERBAIKAN: Mengganti 'wp_login' action dengan 'login_redirect' filter
        // Ini adalah cara yang lebih aman dan standar untuk menangani redirect setelah login.
        add_filter('login_redirect', array($this, 'custom_login_redirect_filter'), 10, 3);
    }

    public function activate()
    {
        // PERBAIKAN: Muat file schema di sini secara eksplisit
        // Ini untuk memastikan fungsi 'umroh_manager_create_tables' tersedia
        // selama proses aktivasi plugin.
        require_once plugin_dir_path(__FILE__) . 'includes/db-schema.php';

        umroh_manager_create_tables();
        add_option('umroh_manager_db_version', $this->db_version);
        $this->create_dashboard_page(); // Pastikan halaman dibuat saat aktivasi
        flush_rewrite_rules(); // Penting setelah membuat halaman
    }

    public function deactivate()
    {
        // Tambahkan logic deaktivasi jika perlu (misal: hapus data)
        flush_rewrite_rules();
    }

    public function check_db_version()
    {
        // PERBAIKAN: Muat juga di sini untuk keamanan
        // Ini memastikan fungsi tersedia jika versi DB butuh update.
        require_once plugin_dir_path(__FILE__) . 'includes/db-schema.php';
        
        if (get_option('umroh_manager_db_version') != $this->db_version) {
            umroh_manager_create_tables();
            update_option('umroh_manager_db_version', $this->db_version);
        }
    }

    public function add_admin_menu()
    {
        add_menu_page(
            __('Travel Manager', 'umroh-manager-hybrid'),
            __('Travel Manager', 'umroh-manager-hybrid'),
            'manage_options', // Hanya untuk administrator
            'umroh-manager',
            array($this, 'load_admin_dashboard'),
            'dashicons-palmtree',
            20
        );
    }

    public function load_admin_dashboard()
    {
        // Ini adalah dashboard admin WP standar (non-React)
        require_once plugin_dir_path(__FILE__) . 'admin/dashboard.php';
    }

    public function register_api_routes()
    {
        register_rest_route('umroh-manager/v1', '/(?P<endpoint>[a-zA-Z0-9_-]+)', array(
            'methods' => array('GET', 'POST', 'OPTIONS'), // PERBAIKAN: Tambahkan OPTIONS
            'callback' => array($this, 'handle_api_request'),
            'permission_callback' => array($this, 'api_permission_check'),
        ));
    }

    public function handle_api_request($request)
    {
        $endpoint = $request->get_param('endpoint');
        $file_path = plugin_dir_path(__FILE__) . 'includes/api/api-' . $endpoint . '.php';

        if (file_exists($file_path)) {
            // 'api-loader.php' akan menangani pemanggilan fungsi yang tepat
            require_once plugin_dir_path(__FILE__) . 'includes/api-loader.php';
            return handle_api_endpoint($request, $endpoint); // Memanggil fungsi dari api-loader
        }

        return new WP_Error('invalid_endpoint', 'Endpoint API tidak valid.', array('status' => 404));
    }

    public function create_dashboard_page()
    {
        $page_slug = 'travel-dashboard';
        $page_title = 'Travel Dashboard';
        $page = get_page_by_path($page_slug);

        if (!$page) {
            $page_id = wp_insert_post(array(
                'post_title' => $page_title,
                'post_name' => $page_slug,
                'post_status' => 'publish',
                'post_type' => 'page',
                'comment_status' => 'closed',
                'ping_status' => 'closed',
            ));

            if ($page_id && !is_wp_error($page_id)) {
                // Beri tanda agar mudah dicari
                update_post_meta($page_id, '_umroh_manager_dashboard_page', true);
            }
        }
    }

    public function load_react_app_template($template)
    {
        // Hanya berlaku di halaman 'travel-dashboard'
        if (is_page('travel-dashboard')) {
            // Cek otentikasi
            if (!is_user_logged_in()) {
                // Jika tidak login, redirect ke halaman login WordPress
                // Setelah login, WP akan mengarahkan kembali ke dashboard ini (jika login_redirect filter diatur)
                wp_redirect(wp_login_url(home_url('/travel-dashboard/')));
                exit;
            }
            
            // Jika login, tampilkan template app React
            $plugin_template = plugin_dir_path(__FILE__) . 'admin/dashboard-react.php';
            if (file_exists($plugin_template)) {
                return $plugin_template;
            }
        }
        return $template;
    }

    public function enqueue_react_app_scripts()
    {
        // Hanya enqueue di halaman dashboard kustom
        if (is_page('travel-dashboard')) {
            $asset_file = include(plugin_dir_path(__FILE__) . 'build/index.asset.php');

            wp_enqueue_script(
                'umroh-manager-react-app',
                plugin_dir_url(__FILE__) . 'build/index.js',
                $asset_file['dependencies'],
                $asset_file['version'],
                true // Muat di footer
            );

            // Kirim data dari PHP ke React
            wp_localize_script('umroh-manager-react-app', 'umrohManagerData', array(
                'apiUrl' => esc_url_raw(rest_url('umroh-manager/v1/')),
                'nonce' => wp_create_nonce('wp_rest')
            ));
        }
    }

    public function enqueue_admin_scripts($hook)
    {
        // TODO: Enqueue script admin jika perlu, mungkin untuk halaman pengaturan
        // if ('toplevel_page_umroh-manager' != $hook) {
        //     return;
        // }
    }

    /**
     * PERBAIKAN: Fungsi ini sekarang menggunakan filter 'login_redirect'.
     * Ini adalah cara yang benar untuk memodifikasi URL redirect setelah login.
     *
     * @param string $redirect_to URL redirect default.
     * @param string $requested_redirect_to URL yang diminta pengguna (jika ada).
     * @param WP_User|WP_Error $user Objek pengguna atau error.
     * @return string URL redirect yang baru.
     */
    public function custom_login_redirect_filter($redirect_to, $requested_redirect_to, $user) {
        // Pastikan $user adalah objek WP_User yang valid
        if (is_wp_error($user) || !is_object($user) || !isset($user->roles)) {
            return $redirect_to; // Kembalikan default jika ada error login
        }

        // Cek role Administrator
        if (in_array('administrator', $user->roles)) {
            // Admin: redirect ke WP Admin
            // Jika admin mencoba mengakses halaman tertentu, biarkan
            if (!empty($requested_redirect_to) && $requested_redirect_to !== home_url('/travel-dashboard/')) {
                 return $requested_redirect_to;
            }
            // Jika tidak, paksa ke /wp-admin/
            return admin_url();
        }

        // Cek role kustom (Owner atau Karyawan)
        $custom_role = get_user_meta($user->ID, 'umroh_manager_role', true);

        if ($custom_role === 'owner' || $custom_role === 'karyawan') {
            // Owner/Karyawan: redirect ke dashboard React
            return home_url('/travel-dashboard/');
        }

        // Fallback untuk user lain (jika ada)
        // Jika mereka bukan admin, owner, atau karyawan, kirim ke halaman utama
        return home_url();
    }


    /**
     * PERBAIKAN KEAMANAN: Pengecekan izin API yang aman.
     * Memeriksa role 'administrator' ATAU custom meta 'owner'/'karyawan'.
     * Mengizinkan request OPTIONS (preflight).
     * Memeriksa Nonce untuk request POST.
     */
    public function api_permission_check($request)
    {
        // 1. Izinkan request OPTIONS (preflight) tanpa cek
        if ($request->get_method() === 'OPTIONS') {
            return true;
        }

        // 2. Dapatkan ID pengguna saat ini
        $user_id = get_current_user_id();

        // 3. Cek apakah user sudah login
        if (empty($user_id)) {
            return new WP_Error('rest_forbidden', 'Anda tidak memiliki izin.', array('status' => 401));
        }

        // 4. Cek Izin Role
        $is_admin = user_can($user_id, 'manage_options'); // 'manage_options' adalah kapabilitas admin
        $custom_role = get_user_meta($user_id, 'umroh_manager_role', true);
        $is_owner_or_karyawan = ($custom_role === 'owner' || $custom_role === 'karyawan');

        // 5. Jika bukan admin DAN bukan owner/karyawan, tolak akses
        if (!$is_admin && !$is_owner_or_karyawan) {
            return new WP_Error('rest_role_forbidden', 'Role Anda tidak diizinkan mengakses data ini.', array('status' => 403));
        }

        // 6. (Lolos Pengecekan Role) Cek Nonce untuk keamanan (terutama untuk POST)
        $method = $request->get_method();
        if ($method === 'POST') {
            $nonce = $request->get_header('X-WP-Nonce');
            if (empty($nonce)) {
                $nonce = $request->get_param('nonce'); // Cek body jika tidak ada di header
            }

            if (empty($nonce) || !wp_verify_nonce($nonce, 'wp_rest')) {
                 return new WP_Error('rest_forbidden_nonce', 'Nonce tidak valid.', array('status' => 403));
            }
        }
        
        // 7. Jika semua cek lolos, berikan izin
        return true;
    }
}

// Inisialisasi plugin
UmrohManagerHybrid::get_instance();