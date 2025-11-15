<?php
/**
 * Base CRUD Controller for standard API operations.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

abstract class UMH_CRUD_Controller {
    
    public $table_name;
    public $resource_name;
    public $fields;

    abstract public function register_routes();

    /**
     * Get items with pagination, search, and sorting.
     */
    public function get_items($request) {
        global $wpdb;

        $page = (int) $request->get_param('page') ?: 1;
        $items_per_page = (int) $request->get_param('per_page') ?: 10;
        $orderby = sanitize_sql_orderby($request->get_param('orderby') ?: 'id');
        $order = in_array(strtoupper($request->get_param('order')), ['ASC', 'DESC']) ? strtoupper($request->get_param('order')) : 'DESC';
        $search = $request->get_param('search');
        
        $offset = ($page - 1) * $items_per_page;

        // Implementasi Caching (WP Transients)
        // Hanya cache jika tidak ada pencarian dan sorting default
        $can_cache = empty($search) && $orderby === 'id' && $order === 'DESC';
        $cache_key = '';

        if ($can_cache) {
            $cache_key = "umh_items_{$this->resource_name}_p{$page}_s{$items_per_page}";
            $cached_data = get_transient($cache_key);

            if (false !== $cached_data) {
                // Tambahkan header untuk menandakan cache hit (opsional, bagus untuk debugging)
                $response_obj = new WP_REST_Response($cached_data, 200);
                $response_obj->header('X-UMH-Cache', 'hit');
                return $response_obj;
            }
        }

        $base_query = $this->get_base_query();
        $total_items_query = "SELECT COUNT(*) FROM ({$base_query}) AS base";
        $items_query = $base_query;

        $where_clause = '';
        if (!empty($search)) {
            $search_columns = $this->get_searchable_columns();
            if (!empty($search_columns)) {
                $like_clauses = [];
                $search_term = '%' . $wpdb->esc_like($search) . '%';
                foreach ($search_columns as $column) {
                    $like_clauses[] = $wpdb->prepare("`$column` LIKE %s", $search_term);
                }
                // Perlu alias 'base_query_alias' karena $base_query adalah subquery
                $where_clause = " WHERE " . implode(' OR ', $like_clauses);
                
                // Hack: Ganti nama tabel dengan alias subquery. Ini asumsi, mungkin perlu disesuaikan.
                // Cara yang lebih baik adalah menerapkan WHERE di dalam subquery jika memungkinkan,
                // atau pastikan kolomnya ada di hasil subquery.
                // Untuk saat ini, kita akan terapkan di query luar.
                $total_items_query = "SELECT COUNT(*) FROM ({$base_query}) AS base_query_alias {$where_clause}";
                $items_query = "SELECT * FROM ({$base_query}) AS base_query_alias {$where_clause}";
            }
        }
        
        $total_items = $wpdb->get_var($total_items_query);
        
        // Pastikan orderby adalah kolom yang valid
        $allowed_orderby = array_keys($this->fields);
        $allowed_orderby[] = 'id';
        // Juga izinkan kolom dari join
        $base_cols = $this->get_columns_from_base_query($base_query);
        $allowed_orderby = array_unique(array_merge($allowed_orderby, $base_cols));
        
        if (!in_array($orderby, $allowed_orderby)) {
            $orderby = 'id';
        }

        $items_query .= $wpdb->prepare(" ORDER BY `$orderby` $order LIMIT %d, %d", $offset, $items_per_page);
        
        $items = $wpdb->get_results($items_query);

        $total_pages = ceil($total_items / $items_per_page);

        $response = [
            'items' => $items,
            'total_items' => (int) $total_items,
            'total_pages' => (int) $total_pages,
            'current_page' => (int) $page,
            'per_page' => (int) $items_per_page,
        ];

        // Simpan ke cache jika kriteria terpenuhi
        if ($can_cache) {
            set_transient($cache_key, $response, 1 * HOUR_IN_SECONDS);
        }

        // Tambahkan header cache miss (opsional)
        $response_obj = new WP_REST_Response($response, 200);
        if ($can_cache) {
            $response_obj->header('X-UMH-Cache', 'miss');
        }
        return $response_obj;
    }

    /**
     * Helper to get columns from base query for sorting
     */
    protected function get_columns_from_base_query($query) {
        global $wpdb;
        // Ambil 1 baris saja untuk mendapatkan nama kolom
        $sample = $wpdb->get_row($query . " LIMIT 1", ARRAY_A);
        if (is_array($sample)) {
            return array_keys($sample);
        }
        return [];
    }

    /**
     * Define searchable columns. Override in child class.
     */
    protected function get_searchable_columns() {
        // Default: search in 'name' or 'title' if they exist
        $cols = [];
        if (isset($this->fields['name'])) $cols[] = 'name';
        if (isset($this->fields['title'])) $cols[] = 'title';
        return $cols;
    }

    /**
     * Get base query. Override in child class for JOINs.
     */
    protected function get_base_query() {
        return "SELECT * FROM {$this->table_name}";
    }

    /**
     * Get a single item by ID.
     */
    public function get_item($request) {
        $id = (int) $request['id'];
        $item = $this->get_item_by_id($id);

        if (empty($item)) {
            return new WP_Error('not_found', $this->resource_name . ' not found', ['status' => 404]);
        }
        return new WP_REST_Response($item, 200);
    }

    /**
     * Helper to get item by ID. Override in child class for JOINs.
     */
    protected function get_item_by_id($id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
    }

    /**
     * Validate and sanitize data before DB operation.
     */
    public function prepare_item_for_db($request, $is_update = false) {
        $data = [];
        $params = $request->get_params();

        foreach ($this->fields as $key => $field) {
            // Skip readonly fields for create, and for update unless they are present
            if (isset($field['readonly']) && $field['readonly'] === true) {
                continue;
            }

            $value = null;
            if (isset($params[$key])) {
                $value = $params[$key];
            }

            // Handle required fields on create
            if (!$is_update && isset($field['required']) && $field['required'] === true && $value === null) {
                return new WP_Error('missing_param', "Missing required field: $key", ['status' => 400]);
            }
            
            // Handle defaults on create
            if (!$is_update && $value === null && isset($field['default'])) {
                $value = $field['default'];
            }

            // If value is still null (not provided for update or optional on create), skip it
            if ($value === null) {
                continue;
            }

            $validated = $this->validate_and_sanitize($key, $value, $is_update);
            if (is_wp_error($validated)) {
                return $validated;
            }
            $data[$key] = $validated;
        }
        return $data;
    }

    // Daftar field numerik dan status yang umum
    static $numeric_fields = ['amount', 'price', 'total_price', 'payment_amount', 'base_price', 'total_paid', 'remaining_balance', 'capacity', 'stock', 'package_id', 'jamaah_id', 'user_id', 'flight_id', 'hotel_id', 'category_id'];
    static $status_fields = ['pending', 'confirmed', 'cancelled', 'draft', 'publish', 'active', 'inactive', 'paid', 'unpaid', 'scheduled', 'completed', 'lunas', 'belum_lunas', 'proses'];


    protected function validate_and_sanitize($key, $value, $is_update = false) {
        if (!isset($this->fields[$key])) {
            return $value; // Atau WP_Error jika strict
        }

        $field = $this->fields[$key];

        // Validasi Wajib (Required)
        if (!$is_update && isset($field['required']) && $field['required'] === true) {
            if ($value === null || $value === '') {
                 return new WP_Error('validation_error', "Field '$key' tidak boleh kosong.", ['status' => 400]);
            }
        }
        
        // Jika value null atau string kosong (dan tidak wajib), izinkan
        if ($value === null || $value === '') {
            return $value;
        }

        // Validasi Tipe Data Sederhana
        if (in_array($key, self::$numeric_fields) && !is_numeric($value)) {
             return new WP_Error('validation_error', "Field '$key' harus berupa angka.", ['status' => 400]);
        }

        if ($key === 'status' && !in_array($value, self::$status_fields)) {
            return new WP_Error('validation_error', "Nilai '$value' tidak valid untuk field '$key'.", ['status' => 400]);
        }

        // Sanitasi
        switch ($field['type']) {
            case 'string':
            case 'text':
            case 'date':
            case 'datetime':
                return sanitize_text_field($value);
            case 'int':
                return intval($value);
            case 'float':
                return floatval($value);
            case 'email':
                return sanitize_email($value);
            case 'json':
                // Asumsi $value adalah string JSON atau array/object
                return is_string($value) ? $value : wp_json_encode($value);
            default:
                return sanitize_text_field($value);
        }
    }

    /**
     * Create a new item.
     */
    public function create_item($request) {
        global $wpdb;
        $data = $this->prepare_item_for_db($request);

        if (is_wp_error($data)) {
            return $data;
        }

        // Set created_at/updated_at if they exist
        if (isset($this->fields['created_at'])) $data['created_at'] = current_time('mysql');
        if (isset($this->fields['updated_at'])) $data['updated_at'] = current_time('mysql');

        $result = $wpdb->insert($this->table_name, $data);
        $new_id = $wpdb->insert_id;

        if ($result === false) {
            return new WP_Error('db_error', 'Failed to create ' . $this->resource_name, ['status' => 500]);
        }

        // Hapus cache
        $this->clear_resource_cache();

        $new_item = $this->get_item_by_id($new_id);
        return new WP_REST_Response($new_item, 201);
    }

    /**
     * Update an existing item.
     */
    public function update_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $data = $this->prepare_item_for_db($request, true);

        if (is_wp_error($data)) {
            return $data;
        }

        // Set updated_at if it exists
        if (isset($this->fields['updated_at'])) $data['updated_at'] = current_time('mysql');

        if (empty($data)) {
            return new WP_Error('no_data', 'No data provided to update', ['status' => 400]);
        }

        $result = $wpdb->update($this->table_name, $data, ['id' => $id]);

        if ($result === false) {
            return new WP_Error('db_error', 'Failed to update ' . $this->resource_name, ['status' => 500]);
        }
        
        // Hapus cache
        $this->clear_resource_cache();

        $updated_item = $this->get_item_by_id($id);
        return new WP_REST_Response($updated_item, 200);
    }

    /**
     * Delete an item.
     */
    public function delete_item($request) {
        global $wpdb;
        $id = (int) $request['id'];

        $result = $wpdb->delete($this->table_name, ['id' => $id]);

        if ($result === false) {
            return new WP_Error('db_error', 'Failed to delete ' . $this->resource_name, ['status' => 500]);
        }

        if ($result === 0) {
            return new WP_Error('not_found', $this->resource_name . ' not found', ['status' => 404]);
        }

        // Hapus cache
        $this->clear_resource_cache();

        return new WP_REST_Response(true, 204); // No Content
    }
    
    /**
     * Menghapus semua transient cache untuk resource ini.
     */
    protected function clear_resource_cache() {
        global $wpdb;
        $prefix = '_transient_umh_items_' . $this->resource_name . '_p';
        $timeout_prefix = '_transient_timeout_umh_items_' . $this->resource_name . '_p';
        
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $prefix . '%'
            )
        );
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s",
                $timeout_prefix . '%'
            )
        );
    }
}