<?php
/**
 * File: includes/api/api-package-categories.php
 * Menangani data Kategori Paket (Package Categories).
 * Endpoint: /umh/v1/package-categories
 */

if (!defined('ABSPATH')) {
    exit;
}

// Pastikan class controller sudah dimuat
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// Schema untuk Kategori Paket (umh_package_categories)
$pkg_cat_schema = [
    'name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'slug'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_title'],
    'parent_id'   => ['type' => 'integer', 'required' => false, 'default' => 0, 'sanitize_callback' => 'absint'],
    'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
];

// Izin akses
$pkg_cat_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'marketing_staff', 'ops_staff'], // Banyak yang perlu baca
    'get_item'     => ['owner', 'admin_staff', 'marketing_staff', 'ops_staff'],
    'create_item'  => ['owner', 'admin_staff'],
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

// Kolom pencarian
$searchable_fields = ['name', 'description'];

// Class khusus untuk menangani join Parent Name (Opsional, agar tabel lebih informatif)
class UMH_Package_Categories_Controller extends UMH_CRUD_Controller {
    
    // Override get_base_query untuk mengambil nama parent kategori
    protected function get_base_query() {
        global $wpdb;
        // Self-join untuk mendapatkan nama parent
        return "SELECT c1.*, c2.name as parent_name 
                FROM {$this->table_name} c1
                LEFT JOIN {$this->table_name} c2 ON c1.parent_id = c2.id";
    }

    // Override get_item_by_id agar detail item juga ada parent_name
    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE c1.id = %d", $id);
        return $wpdb->get_row($query);
    }
}

// Inisialisasi Controller Khusus
// Endpoint: /wp-json/umh/v1/package-categories
new UMH_Package_Categories_Controller('package-categories', 'umh_package_categories', $pkg_cat_schema, $pkg_cat_permissions, $searchable_fields);
?>