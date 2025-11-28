<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Finance_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'transaction_type' => ['type' => 'string', 'required' => true],
            'transaction_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
            'amount'           => ['type' => 'number', 'required' => true],
            'category'         => ['type' => 'string'],
            'description'      => ['type' => 'string'],
            // Relasi ID (Opsional tergantung kategori)
            'jamaah_id'        => ['type' => 'integer'],
            'agent_id'         => ['type' => 'integer'],   // Relasi Agen
            'employee_id'      => ['type' => 'integer'],   // Relasi Karyawan
            'payment_method'   => ['type' => 'string'],
        ];
        parent::__construct('finance', 'umh_finance', $schema, ['get_items' => ['admin_staff', 'finance_staff', 'owner'], 'create_item' => ['admin_staff', 'finance_staff', 'owner']]);
    }

    // Override get_items untuk JOIN table Agen & Karyawan
    public function get_items($request) {
        global $wpdb;
        $type = $request->get_param('transaction_type');
        $where = "WHERE 1=1";
        $params = [];

        if ($type) {
            $where .= " AND f.type = %s"; // Menggunakan alias 'f'
            $params[] = $type;
        }
        
        // JOIN ke tabel Jamaah, Agen, dan Karyawan
        $sql = "SELECT f.*, 
                j.full_name as jamaah_name,
                a.name as agent_name,
                e.name as employee_name
                FROM {$this->table_name} f
                LEFT JOIN {$wpdb->prefix}umh_jamaah j ON f.jamaah_id = j.id
                LEFT JOIN {$wpdb->prefix}umh_agents a ON f.agent_id = a.id
                LEFT JOIN {$wpdb->prefix}umh_employees e ON f.employee_id = e.id
                $where
                ORDER BY f.date DESC"; // Pastikan kolom date di DB adalah 'date' atau 'transaction_date'
        
        if (!empty($params)) {
            $sql = $wpdb->prepare($sql, $params);
        }
        
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }
}
new UMH_Finance_API();