<?php
// File: includes/api/api-packages.php
// Menangani CRUD Paket Umroh dengan fitur Multi-Harga (Quad/Triple/Double) & Kategori

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Packages_API extends UMH_CRUD_Controller {
    
    public $table_name; // Public agar sesuai dengan parent class
    protected $prices_table;
    protected $categories_table;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_packages';
        $this->prices_table = $wpdb->prefix . 'umh_package_prices';
        $this->categories_table = $wpdb->prefix . 'umh_package_categories';
        
        $this->namespace = 'umh/v1';
        $this->rest_base = 'packages';
    }

    /**
     * Override Create Item
     * Menyimpan data paket utama dan variasi harganya
     */
    public function create_item($request) {
        global $wpdb;
        $data = $request->get_json_params();
        
        // 1. Pisahkan data harga dari data paket utama
        $prices = isset($data['prices']) ? $data['prices'] : [];
        if (isset($data['prices'])) unset($data['prices']); 
        
        // Validasi dasar
        if (empty($data['package_name'])) {
            return new WP_Error('missing_title', 'Nama Paket wajib diisi', ['status' => 400]);
        }

        // 2. Simpan Paket Utama
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        $inserted = $wpdb->insert($this->table_name, $data);
        
        if ($inserted === false) {
             return new WP_Error('db_error', 'Gagal menyimpan paket: ' . $wpdb->last_error, ['status' => 500]);
        }
        
        $package_id = $wpdb->insert_id;
        
        // 3. Simpan Variasi Harga
        if (!empty($prices) && is_array($prices)) {
            foreach ($prices as $price_item) {
                if (!empty($price_item['room_type']) && isset($price_item['price'])) {
                    $wpdb->insert($this->prices_table, [
                        'package_id' => $package_id,
                        'room_type'  => sanitize_text_field($price_item['room_type']),
                        'price'      => floatval($price_item['price']),
                        'currency'   => !empty($price_item['currency']) ? sanitize_text_field($price_item['currency']) : 'IDR'
                    ]);
                }
            }
        }
        
        return $this->get_item_response($package_id);
    }

    /**
     * Override Update Item
     */
    public function update_item($request) {
        global $wpdb;
        $id = $request['id'];
        $data = $request->get_json_params();
        
        $existing = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$existing) {
            return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);
        }

        // 1. Pisahkan data harga
        $prices = isset($data['prices']) ? $data['prices'] : null;
        if (isset($data['prices'])) unset($data['prices']);
        
        // 2. Update Paket Utama
        $data['updated_at'] = current_time('mysql');
        unset($data['id']);

        $wpdb->update($this->table_name, $data, ['id' => $id]);
        
        // 3. Update Harga (Full Refresh)
        if ($prices !== null && is_array($prices)) {
            $wpdb->delete($this->prices_table, ['package_id' => $id]);
            
            foreach ($prices as $price_item) {
                if (!empty($price_item['room_type']) && isset($price_item['price'])) {
                    $wpdb->insert($this->prices_table, [
                        'package_id' => $id,
                        'room_type'  => sanitize_text_field($price_item['room_type']),
                        'price'      => floatval($price_item['price']),
                        'currency'   => !empty($price_item['currency']) ? sanitize_text_field($price_item['currency']) : 'IDR'
                    ]);
                }
            }
        }
        
        return $this->get_item_response($id);
    }

    /**
     * Override Delete Item
     */
    public function delete_item($request) {
        global $wpdb;
        $id = $request['id'];

        $existing = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$existing) {
            return new WP_Error('not_found', 'Item not found', ['status' => 404]);
        }

        $wpdb->delete($this->prices_table, ['package_id' => $id]);
        $deleted = $wpdb->delete($this->table_name, ['id' => $id]);

        if ($deleted) {
            return rest_ensure_response(['success' => true, 'id' => $id]);
        } else {
            return new WP_Error('db_error', 'Failed to delete item', ['status' => 500]);
        }
    }

    /**
     * Override Get Item (Single)
     */
    public function get_item($request) {
        $id = $request['id'];
        return $this->get_item_response($id);
    }

    /**
     * Override Get Items (List)
     */
    public function get_items($request) {
        global $wpdb;

        $args = parent::get_items_query_args($request);
        $limit = $args['limit'];
        $offset = $args['offset'];
        $order_by = $args['order_by'];
        $order = $args['order'];
        
        $sql = "SELECT p.*, c.name as category_name 
                FROM {$this->table_name} p
                LEFT JOIN {$this->categories_table} c ON p.category_id = c.id";

        if (!empty($args['where'])) {
            $sql .= " WHERE 1=1 " . $args['where'];
        }

        $sql .= " ORDER BY p.{$order_by} {$order}";
        $sql .= $wpdb->prepare(" LIMIT %d OFFSET %d", $limit, $offset);
        
        $packages = $wpdb->get_results($sql, ARRAY_A);

        if ($packages) {
            foreach ($packages as &$pkg) {
                $prices = $wpdb->get_results($wpdb->prepare(
                    "SELECT room_type, price, currency FROM {$this->prices_table} WHERE package_id = %d", 
                    $pkg['id']
                ), ARRAY_A);
                $pkg['prices'] = $prices;
            }
        }

        $count_sql = "SELECT COUNT(*) FROM {$this->table_name} p";
        if (!empty($args['where'])) {
            $count_sql .= " WHERE 1=1 " . $args['where'];
        }
        $total_items = $wpdb->get_var($count_sql);
        $total_pages = ceil($total_items / $limit);

        $response = rest_ensure_response($packages);
        $response->header('X-WP-Total', (int) $total_items);
        $response->header('X-WP-TotalPages', (int) $total_pages);

        return $response;
    }

    /**
     * Helper untuk response
     */
    private function get_item_response($id) {
        global $wpdb;
        
        $sql = $wpdb->prepare(
            "SELECT p.*, c.name as category_name 
             FROM {$this->table_name} p
             LEFT JOIN {$this->categories_table} c ON p.category_id = c.id
             WHERE p.id = %d", 
            $id
        );
        
        $item = $wpdb->get_row($sql, ARRAY_A);
        
        if (!$item) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        $prices = $wpdb->get_results($wpdb->prepare(
            "SELECT room_type, price, currency FROM {$this->prices_table} WHERE package_id = %d", 
            $id
        ), ARRAY_A);
        
        $item['prices'] = $prices;
        
        return rest_ensure_response($item);
    }
}

// FIX: Bungkus inisialisasi dengan hook rest_api_init
add_action('rest_api_init', function() {
    $umh_packages_api = new UMH_Packages_API();
    $umh_packages_api->register_routes();
});