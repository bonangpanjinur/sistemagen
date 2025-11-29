<?php
class UMH_API_Loader {
    public static function init() {
        add_action('rest_api_init', array(__CLASS__, 'register_routes'));
        
        // Panggil file cors, tapi biarkan file itu yang melakukan hook action (seperti kode di atas)
        require_once UMH_PLUGIN_DIR . 'includes/cors.php';
    }

    public static function register_routes() {
        $controllers = array(
            'UMH_API_Stats',
            'UMH_API_Bookings',
            'UMH_API_Agents',
            'UMH_API_Packages',
            'UMH_API_Package_Categories',
            'UMH_API_Flights',
            'UMH_API_Hotels',
            'UMH_API_Departures',
            'UMH_API_Jamaah',
            'UMH_API_Documents',
            'UMH_API_Finance',
            'UMH_API_Marketing',
            'UMH_API_HR',
            'UMH_API_Users',
            'UMH_API_Roles',
            'UMH_API_Masters',
            'UMH_API_Categories',
            'UMH_API_Tasks',
            'UMH_API_Logistics',
            'UMH_API_Rooming',
            'UMH_API_Flight_Bookings',
            'UMH_API_Hotel_Bookings',
            'UMH_API_Uploads',
            'UMH_API_Print',
            'UMH_API_Export',
            'UMH_API_Misc'
        );

        foreach ($controllers as $controller) {
            if (class_exists($controller)) {
                $instance = new $controller();
                $instance->register_routes();
            }
        }
    }
}