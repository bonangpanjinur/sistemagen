<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Stats_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // Tabel dummy, karena stats ambil dari banyak tabel
        parent::__construct('stats', 'umh_stats', [], ['get_items' => ['admin_staff', 'marketing_staff']]);
        
        // Register Custom Route harus di hook rest_api_init
        add_action('rest_api_init', [$this, 'register_dashboard_routes']);
    }

    public function register_dashboard_routes() {
        register_rest_route('umh/v1', '/stats/dashboard', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => [$this, 'check_permission'], 
        ]);

        // Route untuk ringkasan total (digunakan di DataContext.jsx)
        register_rest_route('umh/v1', '/stats/totals', [
            'methods' => 'GET',
            'callback' => [$this, 'get_totals_stats'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    public function get_dashboard_stats($request) {
        return $this->get_totals_stats($request);
    }

    public function get_totals_stats($request) {
        global $wpdb;
        
        // 1. Ringkasan Jemaah
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE status != 'cancelled' AND status != 'deleted'");
        
        // 2. Total Paket Aktif
        $total_packages = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_packages WHERE status = 'active'");

        // 3. Ringkasan Keuangan (Total Pemasukan)
        $total_revenue = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE type = 'income'");

        // 4. Keberangkatan Terdekat (FIX: Menggunakan tabel umh_departures yang benar)
        $upcoming_sql = "SELECT p.name as package_name, d.departure_date, d.total_seats, d.available_seats,
                         (d.total_seats - d.available_seats) as slots_filled
                         FROM {$wpdb->prefix}umh_departures d
                         JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                         WHERE d.departure_date >= CURRENT_DATE()
                         AND d.status = 'scheduled'
                         ORDER BY d.departure_date ASC
                         LIMIT 5";
                         
        $upcoming_departures = $wpdb->get_results($upcoming_sql, ARRAY_A);

        return rest_ensure_response([
            'total_jamaah' => (int)$total_jamaah,
            'total_packages' => (int)$total_packages,
            'total_revenue' => (float)$total_revenue,
            'upcoming_departures' => $upcoming_departures ?: []
        ]);
    }
}
new UMH_Stats_API();
?>