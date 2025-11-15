<?php
/**
 * API endpoints for departures
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class UMH_Departures_API_Controller extends UMH_CRUD_Controller {
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_departures';
        $this->resource_name = 'departure';
        $this->fields = [
            'departure_date' => ['type' => 'date', 'required' => true],
            'return_date' => ['type' => 'date', 'required' => true],
            'package_id' => ['type' => 'int', 'required' => true],
            'flight_id' => ['type' => 'int', 'required' => false],
            'status' => ['type' => 'string', 'required' => false, 'default' => 'scheduled'],
            'notes' => ['type' => 'string', 'required' => false],
            'created_at' => ['type' => 'datetime', 'readonly' => true],
            'updated_at' => ['type' => 'datetime', 'readonly' => true],
        ];
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/' . $this->resource_name . 's', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_items'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'create_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);

        register_rest_route('umh/v1', '/' . $this->resource_name . 's/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'delete_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);
    }

    // Override get_base_query untuk join
    protected function get_base_query() {
        global $wpdb;
        return $wpdb->prepare(
            "SELECT d.*, p.name as package_name, f.airline as airline_name
             FROM {$this->table_name} d
             LEFT JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
             LEFT JOIN {$wpdb->prefix}umh_flights f ON d.flight_id = f.id"
        );
    }

    // Override get_item_by_id untuk join
    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE d.id = %d", $id);
        return $wpdb->get_row($query);
    }

    // Override get_searchable_columns
    protected function get_searchable_columns() {
        return ['package_name', 'airline_name', 'status', 'notes'];
    }
}

add_action('rest_api_init', function () {
    $controller = new UMH_Departures_API_Controller();
    $controller->register_routes();
});