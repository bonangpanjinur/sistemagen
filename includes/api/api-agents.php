<?php
// File: includes/api/api-agents.php
// Menangani data agen

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Agents_API extends UMH_CRUD_Controller {
    
    // Perubahan: Ubah protected menjadi public agar sesuai dengan parent class
    public $table_name; 

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_agents';
        $this->namespace = 'umh/v1';
        $this->rest_base = 'agents';
    }

    // Override register_routes untuk menambahkan custom routes jika perlu
    // public function register_routes() {
    //     parent::register_routes();
    // }
}

// FIX: Bungkus inisialisasi dengan hook rest_api_init agar tidak crash saat load awal
add_action('rest_api_init', function() {
    $umh_agents_api = new UMH_Agents_API();
    $umh_agents_api->register_routes();
});
?>