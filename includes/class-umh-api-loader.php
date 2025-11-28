<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {
    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        // --- 1. CORE & MASTER DATA ---
        require_once UMH_PLUGIN_DIR . 'includes/api/api-masters.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hotels.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-departures.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-bookings.php'; // Booking & Commission logic
        require_once UMH_PLUGIN_DIR . 'includes/api/api-payments.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php'; // CRM
        
        // --- 2. OPERASIONAL ---
        require_once UMH_PLUGIN_DIR . 'includes/api/api-rooming.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-logistics.php';
        
        // --- 3. HR & AGENTS ---
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-agents.php';

        // --- 4. MISC (TASKS & MARKETING) ---
        require_once UMH_PLUGIN_DIR . 'includes/api/api-misc.php';

        // --- REGISTER INSTANCES ---
        (new UMH_API_Masters())->register_routes();
        (new UMH_API_Hotels())->register_routes();
        (new UMH_API_Packages())->register_routes();
        (new UMH_API_Departures())->register_routes();
        (new UMH_API_Bookings())->register_routes();
        (new UMH_API_Payments())->register_routes();
        (new UMH_API_Jamaah())->register_routes();
        (new UMH_API_Rooming())->register_routes();
        (new UMH_API_Logistics())->register_routes();
        (new UMH_API_HR())->register_routes();
        (new UMH_API_Agents())->register_routes();
        (new UMH_API_Misc())->register_routes();

        // --- LEGACY (Jika masih dipakai, uncomment sesuai kebutuhan) ---
        // require_once UMH_PLUGIN_DIR . 'includes/api/api-flights.php';
        // require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
        // require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php';
    }
}