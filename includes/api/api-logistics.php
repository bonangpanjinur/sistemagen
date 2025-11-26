<?php
// File: includes/api/api-logistics.php
// Menangani data logistik/perlengkapan

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Logistics_API extends UMH_CRUD_Controller {
    
    public $table_name; // Fix: Changed from protected to public

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_logistics';
        $this->namespace = 'umh/v1';
        $this->rest_base = 'logistics';
    }

    // Override register_routes untuk menambahkan custom routes jika perlu
    // public function register_routes() {
    //     parent::register_routes();
    // }
}

// FIX: Bungkus inisialisasi dengan hook rest_api_init agar tidak crash saat load awal
add_action('rest_api_init', function() {
    $umh_logistics_api = new UMH_Logistics_API();
    $umh_logistics_api->register_routes();
});
?>