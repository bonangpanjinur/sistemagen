<?php
// File: includes/api/api-logistics.php
// Menangani status perlengkapan dan dokumen jamaah

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Logistics_API extends UMH_CRUD_Controller {
    
    protected $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_logistics';
        $this->namespace = 'umh/v1';
        $this->rest_base = 'logistics';
    }
    
    // Override untuk mengambil data jamaah sekaligus (Join)
    public function get_items($request) {
        global $wpdb;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        
        // Simple Query dengan JOIN untuk menampilkan nama jamaah
        $sql = "SELECT l.*, j.full_name as jamaah_name, j.registration_code 
                FROM {$this->table_name} l
                LEFT JOIN $jamaah_table j ON l.jamaah_id = j.id";
                
        // Tambahkan filter jika ada (misal status koper = Belum)
        if (!empty($request['suitcase_status'])) {
            $status = esc_sql($request['suitcase_status']);
            $sql .= " WHERE l.suitcase_status = '$status'";
        }
        
        $sql .= " ORDER BY l.updated_at DESC";

        $results = $wpdb->get_results($sql, ARRAY_A);
        return rest_ensure_response($results);
    }
}

// Inisialisasi
$umh_logistics_api = new UMH_Logistics_API();
$umh_logistics_api->register_routes();
?>