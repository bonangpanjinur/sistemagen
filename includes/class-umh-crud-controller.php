<?php
if (!defined('ABSPATH')) exit;

class UMH_CRUD_Controller {
    protected $namespace = 'umh/v1';
    protected $resource_name;
    protected $table_name;
    protected $schema;
    protected $permissions;

    public function __construct($resource_name, $table_name, $schema, $permissions = []) {
        global $wpdb;
        $this->resource_name = $resource_name;
        $this->table_name = $wpdb->prefix . $table_name;
        $this->schema = $schema;
        $this->permissions = wp_parse_args($permissions, [
            'get_items'   => ['administrator', 'admin_staff'],
            'get_item'    => ['administrator', 'admin_staff'],
            'create_item' => ['administrator', 'admin_staff'],
            'update_item' => ['administrator', 'admin_staff'],
            'delete_item' => ['administrator'],
        ]);

        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        // Register standard CRUD routes
        register_rest_route($this->namespace, '/' . $this->resource_name, [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission'],
                'args'                => $this->get_collection_params(),
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'POST', // Use POST for update to support file upload if needed
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);
    }

    /**
     * Check permissions for the request.
     * Public access function needed for register_rest_route callback.
     */
    public function check_permission($request) {
        // Bypassing permission check for development/demo purposes if needed
        // return true; 

        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', 'Silakan login terlebih dahulu.', ['status' => 401]);
        }

        $method = $request->get_method();
        $action = '';

        switch ($method) {
            case 'GET':
                $action = $request->get_param('id') ? 'get_item' : 'get_items';
                break;
            case 'POST':
                $action = $request->get_param('id') ? 'update_item' : 'create_item';
                break;
            case 'DELETE':
                $action = 'delete_item';
                break;
            default:
                return true;
        }

        $allowed_roles = $this->permissions[$action] ?? ['administrator'];
        $user = wp_get_current_user();
        
        // Allow administrator always
        if (in_array('administrator', (array) $user->roles)) {
            return true;
        }

        // Check custom roles
        foreach ($allowed_roles as $role) {
            if (in_array($role, (array) $user->roles)) {
                return true;
            }
        }

        return new WP_Error('rest_forbidden', 'Anda tidak memiliki izin untuk akses ini.', ['status' => 403]);
    }

    // ... (Sisa metode CRUD standar: get_items, create_item, dll tetap sama) ...
    // Untuk menghemat tempat, saya asumsikan metode CRUD standar sudah ada di sini.
    // Pastikan metode get_items, get_item, create_item, update_item, delete_item, prepare_item_for_db, get_collection_params ada.
    
    // --- Tambahan Helper untuk CRUD standar agar file ini lengkap ---
    
    public function get_items($request) {
        global $wpdb;
        // Basic pagination
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 100; // Default 100 items
        $offset = ($page - 1) * $per_page;
        
        $sql = "SELECT * FROM {$this->table_name} WHERE status != 'deleted' ORDER BY id DESC LIMIT %d OFFSET %d";
        $results = $wpdb->get_results($wpdb->prepare($sql, $per_page, $offset), ARRAY_A);
        
        // Total count
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE status != 'deleted'");
        
        $response = rest_ensure_response($results);
        $response->header('X-WP-Total', (int) $total);
        $response->header('X-WP-TotalPages', (int) ceil($total / $per_page));
        
        return $response;
    }

    public function get_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);
        
        if (!$item) {
            return new WP_Error('not_found', 'Data tidak ditemukan', ['status' => 404]);
        }
        return rest_ensure_response($item);
    }

    public function create_item($request) {
        global $wpdb;
        $data = $this->prepare_item_for_db($request);
        if (is_wp_error($data)) return $data;

        $format = $this->get_format_string($data);
        
        if ($wpdb->insert($this->table_name, $data)) {
            $item = $this->get_item(['id' => $wpdb->insert_id]);
            return rest_ensure_response($item->data); // Return item data directly
        }
        return new WP_Error('db_error', 'Gagal menyimpan data: ' . $wpdb->last_error, ['status' => 500]);
    }

    public function update_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $data = $this->prepare_item_for_db($request);
        if (is_wp_error($data)) return $data;

        if ($wpdb->update($this->table_name, $data, ['id' => $id])) {
            return $this->get_item(['id' => $id]);
        }
        // If no rows updated (data same), just return item
        return $this->get_item(['id' => $id]);
    }

    public function delete_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        // Soft delete
        $wpdb->update($this->table_name, ['status' => 'deleted'], ['id' => $id]);
        return rest_ensure_response(['deleted' => true, 'id' => $id]);
    }

    protected function prepare_item_for_db($request) {
        $data = [];
        $params = $request->get_json_params();
        
        foreach ($this->schema as $key => $config) {
            if (isset($params[$key])) {
                $data[$key] = $params[$key];
            } elseif (isset($config['default']) && $request->get_method() === 'POST' && !isset($request['id'])) {
                $data[$key] = $config['default'];
            } elseif (!empty($config['required']) && $request->get_method() === 'POST' && !isset($request['id'])) {
                return new WP_Error('missing_param', "Parameter '$key' wajib diisi.", ['status' => 400]);
            }
        }
        return $data;
    }

    protected function get_collection_params() {
        return [
            'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
        ];
    }
    
    protected function get_format_string($data) {
        // Helper logic if needed, wpdb handles types mostly fine with prepare
        return null;
    }
}
?>