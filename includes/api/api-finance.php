<?php
/**
 * API Endpoint: Manajemen Keuangan Lengkap
 * Fitur: Pemasukan, Pengeluaran (Expenses), dan Laporan Laba Rugi
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Finance {

    public function register_routes() {
        // GET Summary & Chart (Laporan)
        register_rest_route('umh/v1', '/finance/summary', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_summary'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // GET Transactions (Jurnal Umum - Masuk & Keluar)
        register_rest_route('umh/v1', '/finance/transactions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_transactions'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Transaction (Catat Pengeluaran / Pemasukan Manual)
        register_rest_route('umh/v1', '/finance/transactions', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_transaction'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // GET Akun Keuangan (COA Sederhana)
        register_rest_route('umh/v1', '/finance/accounts', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_accounts'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: Laporan Ringkasan (Laba Rugi Sederhana)
     */
    public function get_summary($request) {
        global $wpdb;
        $period = $request->get_param('period'); // 'this_month', 'last_month', 'year'
        
        $where = "";
        if ($period === 'last_month') {
            $where = "AND transaction_date BETWEEN DATE_FORMAT(NOW() - INTERVAL 1 MONTH, '%Y-%m-01') AND LAST_DAY(NOW() - INTERVAL 1 MONTH)";
        } elseif ($period === 'year') {
            $where = "AND YEAR(transaction_date) = YEAR(CURDATE())";
        } else {
            // Default This Month
            $where = "AND transaction_date BETWEEN DATE_FORMAT(NOW(), '%Y-%m-01') AND LAST_DAY(NOW())";
        }

        // 1. Total Pemasukan (Dari tabel Payments jemaah + Transaksi Income lain)
        $income_payments = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_payments WHERE status = 'verified' $where");
        $income_others = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance_transactions WHERE type = 'income' $where");
        $total_income = floatval($income_payments) + floatval($income_others);

        // 2. Total Pengeluaran
        $total_expense = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance_transactions WHERE type = 'expense' $where");

        // 3. Breakdown Kategori Pengeluaran
        $expense_breakdown = $wpdb->get_results("
            SELECT a.name as category, SUM(t.amount) as total
            FROM {$wpdb->prefix}umh_finance_transactions t
            JOIN {$wpdb->prefix}umh_finance_accounts a ON t.account_id = a.id
            WHERE t.type = 'expense' $where
            GROUP BY a.id
            ORDER BY total DESC
        ");

        return rest_ensure_response([
            'income' => $total_income,
            'expense' => floatval($total_expense),
            'profit' => $total_income - floatval($total_expense),
            'breakdown' => $expense_breakdown
        ]);
    }

    /**
     * GET: Jurnal Transaksi (Gabungan Payments & General Ledger)
     */
    public function get_transactions($request) {
        global $wpdb;
        $type = $request->get_param('type'); // 'income', 'expense', 'all'
        
        // Kita gunakan UNION untuk menggabungkan data dari tabel umh_payments (Cicilan Jemaah) 
        // dan umh_finance_transactions (Pengeluaran/Pendapatan Lain)
        
        $sql_payments = "
            SELECT 
                id, 
                transaction_date, 
                CONCAT('Pembayaran Booking ', (SELECT booking_code FROM {$wpdb->prefix}umh_bookings WHERE id = p.booking_id)) as description,
                amount,
                'income' as type,
                'Pembayaran Jemaah' as category
            FROM {$wpdb->prefix}umh_payments p
            WHERE status = 'verified'
        ";

        $sql_general = "
            SELECT 
                t.id, 
                t.transaction_date, 
                t.description, 
                t.amount, 
                t.type,
                a.name as category
            FROM {$wpdb->prefix}umh_finance_transactions t
            LEFT JOIN {$wpdb->prefix}umh_finance_accounts a ON t.account_id = a.id
        ";

        if ($type === 'income') {
            $final_query = "($sql_payments) UNION ($sql_general WHERE t.type = 'income')";
        } elseif ($type === 'expense') {
            $final_query = "$sql_general WHERE t.type = 'expense'";
        } else {
            $final_query = "($sql_payments) UNION ($sql_general)";
        }

        $final_query .= " ORDER BY transaction_date DESC LIMIT 100";

        return rest_ensure_response($wpdb->get_results($final_query));
    }

    /**
     * GET: Daftar Akun (Kategori)
     */
    public function get_accounts() {
        global $wpdb;
        // Jika tabel kosong, seed default data
        $count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_finance_accounts");
        if ($count == 0) {
            $defaults = [
                ['Biaya Operasional Kantor', 'expense'],
                ['Biaya Marketing & Iklan', 'expense'],
                ['Biaya Perlengkapan Jemaah', 'expense'],
                ['Biaya Tiket & Visa', 'expense'],
                ['Biaya Hotel (Land Arrangement)', 'expense'],
                ['Gaji Karyawan', 'expense'],
                ['Komisi Agen', 'expense'],
                ['Pendapatan Lain-lain', 'income']
            ];
            foreach ($defaults as $d) {
                $wpdb->insert("{$wpdb->prefix}umh_finance_accounts", ['name' => $d[0], 'type' => $d[1]]);
            }
        }

        return rest_ensure_response($wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_finance_accounts ORDER BY type, name"));
    }

    /**
     * POST: Simpan Transaksi (Pengeluaran/Pemasukan Lain)
     */
    public function save_transaction($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $data = [
            'transaction_date' => sanitize_text_field($params['transaction_date']),
            'description' => sanitize_text_field($params['description']),
            'amount' => floatval($params['amount']),
            'type' => sanitize_text_field($params['type']), // 'expense' or 'income'
            'account_id' => intval($params['account_id']),
            'created_by' => get_current_user_id()
        ];

        if ($wpdb->insert("{$wpdb->prefix}umh_finance_transactions", $data)) {
            return rest_ensure_response(['success' => true, 'message' => 'Transaksi berhasil disimpan']);
        }
        return new WP_Error('db_error', 'Gagal menyimpan transaksi', ['status' => 500]);
    }
}