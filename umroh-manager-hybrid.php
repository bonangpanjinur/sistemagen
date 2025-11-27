<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh & Haji (React + WP API)
 * Version: 1.2.0
 * Author: Bonang Panji
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load Core Classes
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// Init API Loader
new UMH_Api_Loader();

// Activation Hook
register_activation_hook(__FILE__, 'umh_create_db_tables');

// --- TAMBAHAN FORCE UPDATE DB (OPSIONAL: UNCOMMENT JIKA TABEL BELUM MUNCUL) ---
// add_action('admin_init', 'umh_create_db_tables'); 

// Load React App di Admin Menu
add_action('admin_menu', 'umh_register_admin_page');

function umh_register_admin_page() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'read', // Capability 'read' agar semua staff yg login bisa akses (nanti dibatasi di API)
        'umroh-manager',
        'umh_render_react_app',
        'dashicons-palmtree',
        6
    );
}

function umh_render_react_app() {
    // Inject variabel global untuk React
    $current_user = wp_get_current_user();
    $roles = (array) $current_user->roles;
    
    // Mapping Role WP ke Role App
    $app_role = 'agent'; 
    if (in_array('administrator', $roles)) $app_role = 'owner';
    // Logic mapping role lainnya bisa ditambahkan di sini

    ?>
    <div id="umh-app"></div>
    <script>
        window.umhData = {
            root: '<?php echo esc_url_raw(rest_url()); ?>',
            nonce: '<?php echo wp_create_nonce('wp_rest'); ?>',
            user: {
                id: <?php echo $current_user->ID; ?>,
                name: '<?php echo $current_user->display_name; ?>',
                email: '<?php echo $current_user->user_email; ?>',
                role: '<?php echo $app_role; ?>' // Kirim role ke React
            }
        };
    </script>
    <?php
}

// Enqueue Scripts
add_action('admin_enqueue_scripts', 'umh_enqueue_react_scripts');

function umh_enqueue_react_scripts($hook) {
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        [],
        $asset_file['version']
    );
}