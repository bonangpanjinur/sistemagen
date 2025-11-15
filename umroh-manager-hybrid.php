<?php
/*
Plugin Name: Umroh Manager Hybrid
Plugin URI: https://github.com/bonangpanjinur/travelmanajemen
Description: Plugin kustom untuk manajemen Umroh, menggabungkan backend WordPress dengan frontend React.
Version: 2.0.0
Author: Bonang Panji Nur
Author URI: https://bonang.id
License: GPLv2 or later
Text Domain: umroh-manager-hybrid
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_PLUGIN_VERSION', '2.0.0');

// Include necessary files
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';

// Include API files
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-categories.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-payments.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-flights.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-hotels.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-departures.php'; // Diperbarui
require_once UMH_PLUGIN_DIR . 'includes/api/api-tasks.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-uploads.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-marketing.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-flight-bookings.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-hotel-bookings.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-logs.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-print.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-export.php';


// Activation hook
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    umh_create_tables();
    umh_create_default_roles();
    umh_register_default_user_roles();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'umh_deactivate_plugin');
function umh_deactivate_plugin() {
    // Code to run on deactivation
    // Maybe remove default roles if they are empty?
}

// Enqueue admin scripts and styles
function umh_enqueue_admin_scripts($hook) {
    // Only load on our specific admin page
    if ('toplevel_page_umroh-manager' !== $hook) {
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
        'umh-admin-style',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        [],
        UMH_PLUGIN_VERSION
    );

    // Pass data to React script
    wp_localize_script('umh-react-app', 'umhData', [
        'apiUrl' => esc_url_raw(rest_url('umh/v1/')),
        'nonce' => wp_create_nonce('wp_rest'),
        'currentUser' => umh_get_current_user_data(),
        'roles' => umh_get_all_roles_data(), // Pass all roles data
    ]);
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

// Add PWA manifest and service worker
function umh_add_pwa_links() {
    echo '<link rel="manifest" href="' . esc_url(UMH_PLUGIN_URL . 'pwa/manifest.json') . '">';
    echo '<script>
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("' . esc_url(UMH_PLUGIN_URL . 'pwa/service-worker.js') . '")
                    .then(registration => console.log("ServiceWorker registration successful with scope: ", registration.scope))
                    .catch(error => console.log("ServiceWorker registration failed: ", error));
            });
        }
    </script>';
}
// Add to admin login page
add_action('login_head', 'umh_add_pwa_links');
// Add to admin pages
add_action('admin_head', 'umh_add_pwa_links');


// Custom login page styling
function umh_custom_login_page() {
    $bg_url = UMH_PLUGIN_URL . 'assets/images/login-bg.jpg.png';
    ?>
    <style type.text/css>
        body.login {
            background-image: url('<?php echo esc_url($bg_url); ?>');
            background-size: cover;
            background-position: center;
        }
        #login h1 a, .login h1 a {
            background-image: none;
            width: 100%;
            text-align: center;
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            text-indent: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        #loginform {
            border-radius: 10px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
         .login #login_error, .login .message, .login .success {
            border-radius: 5px;
        }
    </style>
    <script type.text/javascript>
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('#login h1 a').href = '<?php echo esc_url(home_url('/')); ?>';
            document.querySelector('#login h1 a').textContent = '<?php echo esc_html(get_bloginfo('name')); ?>';
        });
    </script>
    <?php
}
add_action('login_enqueue_scripts', 'umh_custom_login_page');