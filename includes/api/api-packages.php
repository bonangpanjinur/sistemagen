<?php
// File: includes/api/api-packages.php
// Menangani CRUD Paket Umroh dengan fitur Multi-Harga (Quad/Triple/Double) & Kategori

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Packages_API extends UMH_CRUD_Controller {
    
    protected $table_name;
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
        unset($data['prices']); // Hapus agar tidak ikut di-insert ke tabel paket utama
        
        // Validasi dasar
        if (empty($data['package_name'])) {
            return new WP_Error('missing_title', 'Nama Paket wajib diisi', ['status' => 400]);
        }

        // 2. Simpan Paket Utama
        $data['created_at'] = current_time('mysql');
        $data['updated_at'] = current_time('mysql');
        
        // Format data agar aman (sanitize dilakukan oleh wpdb->insert biasanya, tapi kita pastikan fieldnya benar)
        $wpdb->insert($this->table_name, $data);
        $package_id = $wpdb->insert_id;
        
        if (!$package_id) {
            return new WP_Error('db_error', 'Gagal menyimpan paket', ['status' => 500]);
        }
        
        // 3. Simpan Variasi Harga (Quad/Triple/Double)
        if (!empty($prices) && is_array($prices)) {
            foreach ($prices as $price_item) {
                // Pastikan data harga valid
                if (!empty($price_item['room_type']) && isset($price_item['price'])) {
                    $wpdb->insert($this->prices_table, [
                        'package_id' => $package_id,
                        'room_type'  => sanitize_text_field($price_item['room_type']), // Quad, Triple, Double
                        'price'      => floatval($price_item['price']),
                        'currency'   => !empty($price_item['currency']) ? sanitize_text_field($price_item['currency']) : 'IDR'
                    ]);
                }
            }
        }
        
        // Kembalikan respons item lengkap
        return $this->get_item_response($package_id);
    }

    /**
     * Override Update Item
     * Mengupdate paket dan mereset variasi harganya
     */
    public function update_item($request) {
        global $wpdb;
        $id = $request['id'];
        $data = $request->get_json_params();
        
        // Cek apakah paket ada
        $existing = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$existing) {
            return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);
        }

        // 1. Pisahkan data harga
        $prices = isset($data['prices']) ? $data['prices'] : null;
        if (isset($data['prices'])) unset($data['prices']); // Hapus dari payload update utama
        
        // 2. Update Paket Utama
        $data['updated_at'] = current_time('mysql');
        
        // Hapus field 'id' dari data update agar tidak error
        unset($data['id']);

        $wpdb->update($this->table_name, $data, ['id' => $id]);
        
        // 3. Update Harga: Hapus yang lama, insert yang baru (Full Refresh)
        if ($prices !== null && is_array($prices)) {
            // Hapus semua harga lama untuk paket ini
            $wpdb->delete($this->prices_table, ['package_id' => $id]);
            
            // Insert harga baru
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
     * Menghapus paket beserta harga variasinya
     */
    public function delete_item($request) {
        global $wpdb;
        $id = $request['id'];

        // Cek keberadaan
        $existing = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$existing) {
            return new WP_Error('not_found', 'Item not found', ['status' => 404]);
        }

        // 1. Hapus harga variasi terlebih dahulu (Child records)
        $wpdb->delete($this->prices_table, ['package_id' => $id]);

        // 2. Hapus paket utama
        $deleted = $wpdb->delete($this->table_name, ['id' => $id]);

        if ($deleted) {
            return rest_ensure_response(['success' => true, 'id' => $id]);
        } else {
            return new WP_Error('db_error', 'Failed to delete item', ['status' => 500]);
        }
    }

    /**
     * Override Get Item (Single)
     * Mengambil detail paket + daftar harganya
     */
    public function get_item($request) {
        $id = $request['id'];
        return $this->get_item_response($id);
    }

    /**
     * Override Get Items (List)
     * Mengambil daftar paket + join kategori + daftar harga
     */
    public function get_items($request) {
        global $wpdb;

        // Ambil parameter search/pagination standard
        $args = parent::get_items_query_args($request);
        $limit = $args['limit'];
        $offset = $args['offset'];
        $order_by = $args['order_by'];
        $order = $args['order'];
        
        // Query Custom dengan JOIN Kategori
        // Kita tidak menggunakan parent::get_items() karena kita butuh JOIN custom
        $sql = "SELECT p.*, c.name as category_name 
                FROM {$this->table_name} p
                LEFT JOIN {$this->categories_table} c ON p.category_id = c.id";

        // Tambahkan WHERE clause jika ada search
        if (!empty($args['where'])) {
            $sql .= " WHERE 1=1 " . $args['where'];
        }

        $sql .= " ORDER BY p.{$order_by} {$order}";
        $sql .= $wpdb->prepare(" LIMIT %d OFFSET %d", $limit, $offset);
        
        $packages = $wpdb->get_results($sql, ARRAY_A);

        // Loop untuk menyisipkan data harga ke setiap paket
        if ($packages) {
            foreach ($packages as &$pkg) {
                $prices = $wpdb->get_results($wpdb->prepare(
                    "SELECT room_type, price, currency FROM {$this->prices_table} WHERE package_id = %d", 
                    $pkg['id']
                ), ARRAY_A);
                $pkg['prices'] = $prices;
            }
        }

        // Hitung total untuk pagination
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
     * Helper untuk mengambil respon single item yang konsisten
     */
    private function get_item_response($id) {
        global $wpdb;
        
        // Ambil Paket + Nama Kategori
        $sql = $wpdb->prepare(
            "SELECT p.*, c.name as category_name 
             FROM {$this->table_name} p
             LEFT JOIN {$this->categories_table} c ON p.category_id = c.id
             WHERE p.id = %d", 
            $id
        );
        
        $item = $wpdb->get_row($sql, ARRAY_A);
        
        if (!$item) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // Ambil Variasi Harga
        $prices = $wpdb->get_results($wpdb->prepare(
            "SELECT room_type, price, currency FROM {$this->prices_table} WHERE package_id = %d", 
            $id
        ), ARRAY_A);
        
        $item['prices'] = $prices;
        
        return rest_ensure_response($item);
    }
}

// Inisialisasi API
$umh_packages_api = new UMH_Packages_API();
$umh_packages_api->register_routes();
?>