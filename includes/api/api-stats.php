<?php
/**
 * API Endpoint: Statistik Dashboard
 * Mengambil ringkasan data dari seluruh modul untuk ditampilkan di Dashboard Utama.
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Stats {

    public function register_routes() {
        register_rest_route('umh/v1', '/stats/dashboard', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_dashboard_stats'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    public function get_dashboard_stats($request) {
        global $wpdb;

        // 1. Ringkasan Transaksi (Omset)
        $total_revenue = $wpdb->get_var("SELECT SUM(total_price) FROM {$wpdb->prefix}umh_bookings WHERE status != 'cancelled'");
        $total_paid = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_payments WHERE status = 'verified'");
        
        // 2. Ringkasan Jemaah
        $total_jamaah = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_jamaah");
        $active_bookings = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_bookings WHERE status IN ('pending', 'confirmed')");

        // 3. Keberangkatan Terdekat (Next Departure)
        $next_departure = $wpdb->get_row("
            SELECT d.*, p.name as package_name, 
            (SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings b WHERE b.departure_id = d.id AND b.status != 'cancelled') as booked_count
            FROM {$wpdb->prefix}umh_departures d
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE d.departure_date >= CURDATE()
            ORDER BY d.departure_date ASC
            LIMIT 1
        ");

        // 4. Tugas Pending (Urgent)
        $pending_tasks = $wpdb->get_results("
            SELECT t.*, d.departure_date, p.name as package_name
            FROM {$wpdb->prefix}umh_departure_tasks t
            JOIN {$wpdb->prefix}umh_departures d ON t.departure_id = d.id
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE t.status = 'pending' AND t.due_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY t.due_date ASC
            LIMIT 5
        ");

        // 5. Chart Data (Penjualan 6 Bulan Terakhir)
        $chart_labels = [];
        $chart_data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = date('Y-m', strtotime("-$i months"));
            $month_label = date('M Y', strtotime("-$i months"));
            
            $sales = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(total_price) FROM {$wpdb->prefix}umh_bookings 
                 WHERE DATE_FORMAT(booking_date, '%%Y-%%m') = %s AND status != 'cancelled'", 
                $month
            ));
            
            $chart_labels[] = $month_label;
            $chart_data[] = $sales ?: 0;
        }

        return rest_ensure_response([
            'revenue' => [
                'total_sales' => $total_revenue ?: 0,
                'cash_in' => $total_paid ?: 0,
                'receivable' => ($total_revenue - $total_paid) ?: 0
            ],
            'stats' => [
                'total_jamaah' => $total_jamaah,
                'active_bookings' => $active_bookings
            ],
            'next_departure' => $next_departure,
            'pending_tasks' => $pending_tasks,
            'chart' => [
                'labels' => $chart_labels,
                'series' => $chart_data
            ]
        ]);
    }
}