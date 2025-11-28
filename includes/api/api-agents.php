<?php
/**
 * API Endpoint: Manajemen Keagenan (Partnership)
 * Fitur: Database Agen, Tracking Komisi, dan Payout
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Agents {

    public function register_routes() {
        // CRUD Agen
        register_rest_route('umh/v1', '/agents', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_agents'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/agents', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_agent'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // Komisi
        register_rest_route('umh/v1', '/agents/commissions', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_commissions'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        
        // Bayar Komisi (Payout)
        register_rest_route('umh/v1', '/agents/payout', array(
            'methods' => 'POST',
            'callback' => array($this, 'process_payout'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    // --- AGEN DATA ---

    public function get_agents($request) {
        global $wpdb;
        $search = $request->get_param('search');
        $query = "
            SELECT a.*, u.display_name, u.user_email 
            FROM {$wpdb->prefix}umh_agents a
            JOIN {$wpdb->users} u ON a.user_id = u.ID
            WHERE 1=1
        ";
        
        if ($search) {
            $query .= $wpdb->prepare(" AND (u.display_name LIKE %s OR a.agent_code LIKE %s)", "%$search%", "%$search%");
        }
        
        $agents = $wpdb->get_results($query);

        // Hitung total penjualan & komisi pending per agen (Simple Analytics)
        foreach ($agents as $agent) {
            $agent->total_sales = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE agent_id = %d AND status != 'cancelled'", 
                $agent->id
            ));
            
            $agent->pending_commission = $wpdb->get_var($wpdb->prepare(
                "SELECT SUM(amount) FROM {$wpdb->prefix}umh_commissions WHERE agent_id = %d AND status = 'pending'",
                $agent->id
            )) ?: 0;
        }

        return rest_ensure_response($agents);
    }

    public function save_agent($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_agents';

        $data = [
            'user_id' => intval($params['user_id']),
            'agent_code' => sanitize_text_field($params['agent_code']),
            'level' => sanitize_text_field($params['level'] ?? 'silver'),
            'commission_rate' => floatval($params['commission_rate'] ?? 0), // %
            'fixed_commission' => floatval($params['fixed_commission'] ?? 0), // Nominal
            'bank_name' => sanitize_text_field($params['bank_name'] ?? ''),
            'bank_account_number' => sanitize_text_field($params['bank_account_number'] ?? ''),
            'bank_account_holder' => sanitize_text_field($params['bank_account_holder'] ?? ''),
            'status' => sanitize_text_field($params['status'] ?? 'active')
        ];

        // Generate kode agen otomatis jika kosong
        if (empty($data['agent_code'])) {
            $data['agent_code'] = 'AGN-' . strtoupper(substr(md5(time()), 0, 5));
        }

        $id = isset($params['id']) ? intval($params['id']) : 0;

        if ($id > 0) {
            $wpdb->update($table, $data, ['id' => $id]);
        } else {
            // Cek user_id unique
            $exist = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE user_id = %d", $data['user_id']));
            if ($exist) return new WP_Error('duplicate', 'User ini sudah menjadi agen', ['status' => 400]);
            
            $wpdb->insert($table, $data);
        }

        return rest_ensure_response(['success' => true]);
    }

    // --- KOMISI LOGIC ---

    public function get_commissions($request) {
        global $wpdb;
        $agent_id = $request->get_param('agent_id');
        
        $query = "
            SELECT c.*, b.booking_code, u.display_name as agent_name
            FROM {$wpdb->prefix}umh_commissions c
            JOIN {$wpdb->prefix}umh_agents a ON c.agent_id = a.id
            JOIN {$wpdb->users} u ON a.user_id = u.ID
            LEFT JOIN {$wpdb->prefix}umh_bookings b ON c.booking_id = b.id
            WHERE 1=1
        ";

        if ($agent_id) {
            $query .= $wpdb->prepare(" AND c.agent_id = %d", $agent_id);
        }

        $query .= " ORDER BY c.created_at DESC LIMIT 50";
        
        return rest_ensure_response($wpdb->get_results($query));
    }

    public function process_payout($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $commission_id = intval($params['id']);
        
        // Update status jadi Paid
        $updated = $wpdb->update(
            $wpdb->prefix . 'umh_commissions',
            ['status' => 'paid', 'paid_at' => current_time('mysql')],
            ['id' => $commission_id]
        );

        if ($updated !== false) {
            // Opsional: Catat Pengeluaran di Modul Keuangan (Auto-Journal)
            // $this->record_expense(...)
            return rest_ensure_response(['success' => true, 'message' => 'Komisi telah dibayarkan']);
        }
        
        return new WP_Error('db_error', 'Gagal update status', ['status' => 500]);
    }
}