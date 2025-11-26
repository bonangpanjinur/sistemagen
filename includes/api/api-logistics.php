<?php
// File: includes/api/api-logistics.php
// Menangani data logistik/perlengkapan dengan JOIN ke tabel Jamaah.

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// Kita buat Class khusus karena perlu JOIN tabel (Logistik + Jamaah)
class UMH_Logistics_Controller extends UMH_CRUD_Controller {
    
    // Override query utama untuk mengambil nama jamaah
    protected function get_base_query() {
        global $wpdb;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        
        // l = logistics table, j = jamaah table
        return "SELECT l.*, j.full_name as jamaah_name, j.registration_code 
                FROM {$this->table_name} l
                LEFT JOIN {$jamaah_table} j ON l.jamaah_id = j.id";
    }

    // Override pengambilan 1 item agar detailnya juga lengkap
    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE l.id = %d", $id);
        return $wpdb->get_row($query);
    }
}

// 1. Skema Data
$logistics_schema = [
    'jamaah_id'         => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'passport_status'   => ['type' => 'string', 'default' => 'Belum'],
    'meningitis_status' => ['type' => 'string', 'default' => 'Belum'],
    'biometrics_status' => ['type' => 'string', 'default' => 'Belum'],
    'suitcase_status'   => ['type' => 'string', 'default' => 'Belum'],
    'taken_by'          => ['type' => 'string', 'required' => false],
    'delivery_address'  => ['type' => 'string', 'required' => false],
    'notes'             => ['type' => 'string', 'required' => false],
];

// 2. Izin
$logistics_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'ops_staff'],
    'get_item'     => ['owner', 'admin_staff', 'ops_staff'],
    'create_item'  => ['owner', 'admin_staff', 'ops_staff'], // Biasanya otomatis saat jamaah daftar, tapi ok dibuka
    'update_item'  => ['owner', 'admin_staff', 'ops_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

// 3. Pencarian
$logistics_search_fields = ['taken_by', 'notes']; 
// Catatan: Pencarian nama jamaah via JOIN memerlukan logika tambahan di controller, 
// tapi search field ini cukup untuk data di tabel logistik sendiri.

// 4. Inisialisasi
new UMH_Logistics_Controller('logistics', 'umh_logistics', $logistics_schema, $logistics_permissions, $logistics_search_fields);