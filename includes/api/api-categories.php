<?php
// File: includes/api/api-package-categories.php
// Menangani Kategori Paket & Sub Kategori

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Package_Categories_API extends UMH_CRUD_Controller {
    
    protected $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_package_categories';
        $this->namespace = 'umh/v1';
        $this->rest_base = 'package-categories';
    }

    // Override get items untuk join parent name (agar user tahu induknya siapa)
    public function get_items($request) {
        global $wpdb;
        
        $sql = "SELECT c.*, p.name as parent_name 
                FROM {$this->table_name} c
                LEFT JOIN {$this->table_name} p ON c.parent_id = p.id
                ORDER BY c.parent_id ASC, c.name ASC";

        $results = $wpdb->get_results($sql, ARRAY_A);
        return rest_ensure_response($results);
    }
}

$umh_pkg_cats_api = new UMH_Package_Categories_API();
$umh_pkg_cats_api->register_routes();
?>