<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_Api_Loader {

    public function __construct() {
        $this->load_dependencies();
    }

    private function load_dependencies() {
        // 1. Load Controller Utama (Jantung CRUD)
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

        // 2. Load Module API Utama
        require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-agents.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-logistics.php';
        
        // 3. Load Module HR
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php'; // Pastikan file ini ada atau hapus baris ini jika belum

        // 4. LOAD MASTER DATA (INI YANG KEMARIN KURANG/TERLEWAT)
        // Tanpa ini, halaman Hotel, Maskapai, Kategori akan loading terus
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hotels.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-flights.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-package-categories.php';
    }
}