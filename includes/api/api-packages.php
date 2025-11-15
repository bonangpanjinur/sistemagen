<?php
/**
 * API endpoints for packages
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class UMH_Packages_API_Controller extends UMH_CRUD_Controller {
    
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_packages';
        $this->resource_name = 'package';
        $this->fields = [
            'name' => ['type' => 'string', 'required' => true],
            'description' => ['type' => 'text', 'required' => false],
            'category_id' => ['type' => 'int', 'required' => true],
            'base_price' => ['type' => 'float', 'required' => true],
            'duration' => ['type' => 'int', 'required' => false],
            'status' => ['type' => 'string', 'required' => false, 'default' => 'draft'],
            'capacity' => ['type' => 'int', 'required' => false, 'default' => 0],
            'start_date' => ['type' => 'date', 'required' => false],
            'end_date' => ['type' => 'date', 'required' => false],
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
                'callback' => [$this, 'get_item_with_relations'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_item'],
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'delete_item'], // TODO: Handle cascade delete for relations?
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);
        
        // Endpoint for package relations
        register_rest_route('umh/v1', '/' . $this->resource_name . 's/(?P<id>\d+)/relations', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => 'umh_get_package_relations',
                'permission_callback' => 'umh_is_user_authorized',
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => 'umh_save_package_relations',
                'permission_callback' => 'umh_is_user_authorized',
            ],
        ]);
    }
    
    // Override get_base_query to include category name
    protected function get_base_query() {
        global $wpdb;
        $packages_table = $this->table_name;
        $categories_table = $wpdb->prefix . 'umh_categories';
        
        return "SELECT p.*, c.name as category_name 
                FROM {$packages_table} p
                LEFT JOIN {$categories_table} c ON p.category_id = c.id";
    }

    // Override get_item_by_id to include category name
    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE p.id = %d", $id);
        return $wpdb->get_row($query);
    }
    
    // Override get_searchable_columns
    protected function get_searchable_columns() {
        return ['name', 'description', 'category_name']; // 'category_name' adalah alias dari JOIN
    }
    
    // Get item WITH relations
    public function get_item_with_relations($request) {
        $id = (int) $request['id'];
        $item = $this->get_item_by_id($id);

        if (empty($item)) {
            return new WP_Error('not_found', $this->resource_name . ' not found', ['status' => 404]);
        }
        
        // Add relations data
        $relations = umh_get_package_relations_data($id);
        $item->package_prices = $relations['package_prices'];
        $item->package_flights = $relations['package_flights'];
        $item->package_hotels = $relations['package_hotels'];
        
        return new WP_REST_Response($item, 200);
    }
}

// Register routes
add_action('rest_api_init', function () {
    $controller = new UMH_Packages_API_Controller();
    $controller->register_routes();
});


/**
 * Get related data for a package
 */
function umh_get_package_relations($request) {
    $id = (int) $request['id'];
    $data = umh_get_package_relations_data($id);
    return new WP_REST_Response($data, 200);
}

function umh_get_package_relations_data($package_id) {
    global $wpdb;
    
    // Get Prices
    $prices_table = $wpdb->prefix . 'umh_package_prices';
    $prices = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$prices_table} WHERE package_id = %d", 
        $package_id
    ));
    
    // Get Flights (IDs and details)
    $flights_table = $wpdb->prefix . 'umh_package_flights';
    $flights_data_table = $wpdb->prefix . 'umh_flights';
    $flights = $wpdb->get_results($wpdb->prepare(
        "SELECT f.* FROM {$flights_data_table} f
         JOIN {$flights_table} pf ON f.id = pf.flight_id
         WHERE pf.package_id = %d",
        $package_id
    ));
    
    // Get Hotels (IDs and details)
    $hotels_table = $wpdb->prefix . 'umh_package_hotels';
    $hotels_data_table = $wpdb->prefix . 'umh_hotels';
    $hotels = $wpdb->get_results($wpdb->prepare(
        "SELECT h.* FROM {$hotels_data_table} h
         JOIN {$hotels_table} ph ON h.id = ph.hotel_id
         WHERE ph.package_id = %d",
        $package_id
    ));
    
    return [
        'package_prices' => $prices,
        'package_flights' => $flights,
        'package_hotels' => $hotels,
    ];
}

/**
 * Save related data for a package (Prices, Flights, Hotels)
 */
function umh_save_package_relations($request) {
    global $wpdb;
    $id = (int) $request['id'];

    // Check if package exists
    $package_exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}umh_packages WHERE id = %d", $id));
    if (!$package_exists) {
        return new WP_Error('not_found', 'Package not found.', ['status' => 404]);
    }

    $table_prices = $wpdb->prefix . 'umh_package_prices';
    $table_flights = $wpdb->prefix . 'umh_package_flights';
    $table_hotels = $wpdb->prefix . 'umh_package_hotels';

    $package_prices = $request->get_param('package_prices') ?: [];
    $package_flights = $request->get_param('package_flights') ?: [];
    $package_hotels = $request->get_param('package_hotels') ?: [];
    
    // Mulai Transaksi Database
    $wpdb->query('START TRANSACTION');

    // 1. Proses Harga (umh_package_prices)
    // Hapus harga lama
    $wpdb->delete($table_prices, ['package_id' => $id], ['%d']);
    // Tambah harga baru
    foreach ($package_prices as $price) {
        $result = $wpdb->insert($table_prices, [
            'package_id' => $id,
            'room_type' => sanitize_text_field($price['room_type']),
            'price' => floatval($price['price']),
        ]);
        if ($result === false) {
            $wpdb->query('ROLLBACK'); // Batalkan jika gagal
            return new WP_Error('db_error', 'Gagal menyimpan harga paket.', ['status' => 500]);
        }
    }

    // 2. Proses Penerbangan (umh_package_flights)
    // Hapus penerbangan lama
    $wpdb->delete($table_flights, ['package_id' => $id], ['%d']);
    // Tambah penerbangan baru
    foreach ($package_flights as $flight_id) {
        $result = $wpdb->insert($table_flights, [
            'package_id' => $id,
            'flight_id' => intval($flight_id),
        ]);
        if ($result === false) {
            $wpdb->query('ROLLBACK'); // Batalkan jika gagal
            return new WP_Error('db_error', 'Gagal menyimpan penerbangan paket.', ['status' => 500]);
        }
    }

    // 3. Proses Hotel (umh_package_hotels)
    // Hapus hotel lama
    $wpdb->delete($table_hotels, ['package_id' => $id], ['%d']);
    // Tambah hotel baru
    foreach ($package_hotels as $hotel_id) {
        $result = $wpdb->insert($table_hotels, [
            'package_id' => $id,
            'hotel_id' => intval($hotel_id),
        ]);
        if ($result === false) {
            $wpdb->query('ROLLBACK'); // Batalkan jika gagal
            return new WP_Error('db_error', 'Gagal menyimpan hotel paket.', ['status' => 500]);
        }
    }

    // Jika semua berhasil
    $wpdb->query('COMMIT');

    // Ambil data relasi yang baru saja disimpan
    $new_relations = umh_get_package_relations_data($id);
    return new WP_REST_Response($new_relations, 200);
}