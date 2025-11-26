<?php
// File: includes/api/api-categories.php
// Menangani data Kategori Paket / Kategori Keuangan (tergantung penggunaan)

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Package_Categories_API extends UMH_CRUD_Controller {
    
    // Perubahan: Ubah protected menjadi public agar sesuai dengan parent class
    public $table_name; 

    public function __construct() {
        global $wpdb;
        // Pastikan nama tabel benar sesuai schema database Anda
        // Biasanya umh_package_categories atau umh_categories
        $this->table_name = $wpdb->prefix . 'umh_package_categories'; 
        $this->namespace = 'umh/v1';
        $this->rest_base = 'package-categories';
    }

    // Override register_routes untuk menambahkan custom routes jika perlu
    // public function register_routes() {
    //     parent::register_routes();
    // }
}

// FIX: Bungkus inisialisasi dengan hook rest_api_init agar tidak crash saat load awal
add_action('rest_api_init', function() {
    $umh_categories_api = new UMH_Package_Categories_API();
    $umh_categories_api->register_routes();
});
?>