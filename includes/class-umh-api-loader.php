<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {
    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        /**
         * LOAD SEMUA FILE API (MODULE ENTERPRISE V3)
         * Urutan load tidak terlalu berpengaruh, tapi dikelompokkan agar rapi.
         */

        // 1. CORE & MASTER DATA
        require_once UMH_PLUGIN_DIR . 'includes/api/api-masters.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hotels.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-departures.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-bookings.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php'; // Dashboard Stats

        // 2. CRM & MEMBERSHIP
        require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
        
        // 3. OPERASIONAL & HANDLING
        require_once UMH_PLUGIN_DIR . 'includes/api/api-rooming.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-logistics.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-documents.php'; // Manifest
        require_once UMH_PLUGIN_DIR . 'includes/api/api-misc.php'; // Tasks & Leads

        // 4. KEUANGAN
        require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php'; // Expenses & Reports
        require_once UMH_PLUGIN_DIR . 'includes/api/api-payments.php'; // Receivables

        // 5. HR & PARTNERSHIP
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php'; // Payroll & Absensi
        require_once UMH_PLUGIN_DIR . 'includes/api/api-agents.php';

        // --- REGISTER CLASSES ---
        
        (new UMH_API_Masters())->register_routes();
        (new UMH_API_Hotels())->register_routes();
        (new UMH_API_Packages())->register_routes();
        (new UMH_API_Departures())->register_routes();
        (new UMH_API_Bookings())->register_routes();
        (new UMH_API_Stats())->register_routes();
        
        (new UMH_API_Jamaah())->register_routes();
        
        (new UMH_API_Rooming())->register_routes();
        (new UMH_API_Logistics())->register_routes();
        (new UMH_API_Documents())->register_routes();
        (new UMH_API_Misc())->register_routes();
        
        (new UMH_API_Finance())->register_routes();
        (new UMH_API_Payments())->register_routes();
        
        (new UMH_API_HR())->register_routes();
        (new UMH_API_Agents())->register_routes();

        // Load Legacy jika masih dibutuhkan (Opsional)
        // require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
        // (new UMH_API_Users())->register_routes();
    }
}