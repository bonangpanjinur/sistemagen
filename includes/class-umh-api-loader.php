<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {

    public function __construct() {
        add_action('rest_api_init', [$this, 'register_all_routes']);
    }

    public function register_all_routes() {
        // Daftar semua file API yang ada di folder includes/api/
        $api_files = [
            'api-agents.php',
            'api-categories.php',
            'api-departures.php',
            'api-finance.php',
            'api-flights.php',
            'api-flight-bookings.php',
            'api-hotel-bookings.php',
            'api-hotels.php',
            'api-hr.php',
            'api-jamaah.php',
            'api-logistics.php',
            'api-marketing.php',
            'api-package-categories.php',
            'api-packages.php',
            'api-payments.php',
            'api-stats.php',
            'api-tasks.php',
            'api-users.php',
            'api-roles.php',
            'api-uploads.php'
        ];

        foreach ($api_files as $file) {
            $path = UMROH_MANAGER_PATH . 'includes/api/' . $file;
            if (file_exists($path)) {
                require_once $path;
            }
        }
    }
}