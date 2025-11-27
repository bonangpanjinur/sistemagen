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
            'permission_callback' => [$this, 'check_permission'], // Ini memanggil method di parent class
        ]);
    }

    public function get_dashboard_stats($request) {
        global $wpdb;
        
        // 1. Ringkasan Jemaah
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE status != 'cancelled' AND status != 'deleted'");
        $new_jamaah_month = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");

        // 2. Ringkasan Keuangan (Bulan Ini)
        $income_month = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE transaction_type = 'income' AND MONTH(transaction_date) = MONTH(CURRENT_DATE())");
        $expense_month = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE transaction_type = 'expense' AND MONTH(transaction_date) = MONTH(CURRENT_DATE())");

        // 3. Keberangkatan Terdekat
        // Perbaikan query: Handle jika tabel dates kosong
        $upcoming_sql = "SELECT p.package_name, d.departure_date, d.quota, d.booked, 
                         (d.quota - d.booked) as available_seats
                         FROM {$wpdb->prefix}umh_package_dates d
                         JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                         WHERE d.departure_date >= CURRENT_DATE()
                         ORDER BY d.departure_date ASC
                         LIMIT 5";
        $upcoming_departures = $wpdb->get_results($upcoming_sql, ARRAY_A);

        // 4. Logistik
        $logistics_pending = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_logistics WHERE status = 'Belum Diambil'");

        return rest_ensure_response([
            'total_jamaah' => (int)$total_jamaah,
            'new_jamaah_month' => (int)$new_jamaah_month,
            'income_month' => (float)$income_month,
            'expense_month' => (float)$expense_month,
            'logistics_pending' => (int)$logistics_pending,
            'upcoming_departures' => $upcoming_departures ?: []
        ]);
    }
}
new UMH_Stats_API();
?>