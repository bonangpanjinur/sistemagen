<?php
// File: includes/api-loader.php
// Bertanggung jawab untuk mendaftarkan semua endpoint REST API kustom.

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ===================================================================
 * Fungsi Cek Izin Kustom
 * ===================================================================
 * Ini adalah fungsi keamanan yang akan dipanggil oleh setiap endpoint API.
 * Menentukan apakah pengguna yang saat ini login diizinkan untuk melakukan 
 * operasi berdasarkan setting kustom Super Admin di tabel umroh_user_permissions.
 * * @param string $permission_key Kunci izin yang dibutuhkan (misal: 'manage_packages').
 * @return bool True jika diizinkan, False jika tidak.
 */
function umroh_manager_check_custom_permission($permission_key) {
    // 1. Super Admin/Administrator SELALU diizinkan
    if (current_user_can('manage_options')) {
        return true;
    }

    $user_id = get_current_user_id();
    if (empty($user_id)) {
        return false; // Pengguna belum login
    }
    
    global $wpdb;
    $table_permissions = $wpdb->prefix . 'umroh_user_permissions';
    
    // 2. Cek apakah ada hak akses kustom yang disetel untuk pengguna ini
    $has_access = $wpdb->get_var($wpdb->prepare(
        "SELECT has_access FROM $table_permissions WHERE user_id = %d AND permission_key = %s", 
        $user_id, 
        $permission_key
    ));
    
    // 3. Jika ada setting kustom (0 atau 1), kembalikan nilai tersebut
    if ($has_access !== null) {
        return (bool)$has_access;
    }

    // 4. Jika tidak ada setting kustom, gunakan default (User non-Admin tidak diizinkan)
    return false;
}

/**
 * Mendaftarkan semua endpoint REST API kustom
 */
function umroh_manager_register_rest_routes() {
    $namespace = 'umroh/v1';
    
    // Memuat semua file API
    $api_files = [
        'api-users.php',
        'api-categories.php',
        'api-hotels.php',
        'api-flights.php',
        'api-packages.php',
        'api-departures.php',
        'api-jamaah.php',
    ];

    foreach ($api_files as $file) {
        $path = UMROH_MANAGER_PATH . "includes/api/$file";
        if (file_exists($path)) {
            require_once $path;
        }
    }

    // =================================================================
    // 1. ENDPOINT USERS (Hak Akses) - Hanya untuk Super Admin
    // =================================================================
    register_rest_route($namespace, '/users', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_users_with_permissions',
        'permission_callback' => function() { return current_user_can('manage_options'); },
    ));
    register_rest_route($namespace, '/users/(?P<id>\d+)/permissions', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_save_user_permissions',
        'permission_callback' => function() { return current_user_can('manage_options'); },
        'args' => array(
            'id' => array('validate_callback' => 'is_numeric'),
        ),
    ));


    // =================================================================
    // 2. ENDPOINT MASTER DATA (Categories, Hotels, Flights)
    // =================================================================

    // CATEGORIES
    register_rest_route($namespace, '/categories', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_categories',
        'permission_callback' => function() { return is_user_logged_in(); },
    ));
    register_rest_route($namespace, '/categories', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_category',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_categories'); },
    ));
    register_rest_route($namespace, '/categories/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_category',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_categories'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));
    
    // HOTELS
    register_rest_route($namespace, '/hotels', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_hotels',
        'permission_callback' => function() { return is_user_logged_in(); },
    ));
    register_rest_route($namespace, '/hotels', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_hotel',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_hotels'); },
    ));
    register_rest_route($namespace, '/hotels/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_hotel',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_hotels'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));

    // FLIGHTS
    register_rest_route($namespace, '/flights', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_flights',
        'permission_callback' => function() { return is_user_logged_in(); },
    ));
    register_rest_route($namespace, '/flights', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_flight',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_flights'); },
    ));
    register_rest_route($namespace, '/flights/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_flight',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_flights'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));

    // =================================================================
    // 3. ENDPOINT PACKAGE & DEPARTURE
    // =================================================================

    // PACKAGES
    register_rest_route($namespace, '/packages', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_packages',
        'permission_callback' => function() { return is_user_logged_in(); },
    ));
    register_rest_route($namespace, '/packages', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_package',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_packages'); },
    ));
    register_rest_route($namespace, '/packages/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_package',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_packages'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));

    // DEPARTURES
    register_rest_route($namespace, '/departures', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_departures',
        'permission_callback' => function() { return is_user_logged_in(); },
    ));
    register_rest_route($namespace, '/departures', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_departure',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_departures'); },
    ));
    register_rest_route($namespace, '/departures/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_departure',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_departures'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));

    // =================================================================
    // 4. ENDPOINT JAMAAH
    // =================================================================

    // JAMAAH
    register_rest_route($namespace, '/jamaah', array(
        'methods' => 'GET',
        'callback' => 'umroh_api_get_jamaah',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('view_jamaah'); },
    ));
    register_rest_route($namespace, '/jamaah', array(
        'methods' => 'POST',
        'callback' => 'umroh_api_create_jamaah',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_jamaah'); },
    ));
    register_rest_route($namespace, '/jamaah/(?P<id>\d+)', array(
        'methods' => 'DELETE',
        'callback' => 'umroh_api_delete_jamaah',
        'permission_callback' => function() { return umroh_manager_check_custom_permission('manage_jamaah'); },
        'args' => array('id' => array('validate_callback' => 'is_numeric')),
    ));
}
add_action('rest_api_init', 'umroh_manager_register_rest_routes');