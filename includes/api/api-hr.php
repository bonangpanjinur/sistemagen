<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_HR_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        $schema = [
            'full_name'  => ['type' => 'string', 'required' => true],
            'position'   => ['type' => 'string'],
            'department' => ['type' => 'string'],
            'salary'     => ['type' => 'number'],
            'join_date'  => ['type' => 'string', 'format' => 'date'],
            'status'     => ['type' => 'string', 'default' => 'active'],
        ];
        parent::__construct('hr/profiles', 'umh_employees', $schema, ['get_items' => ['admin_staff']]);
        
        // Register custom routes dengan benar
        add_action('rest_api_init', [$this, 'register_hr_routes']);
    }

    public function register_hr_routes() {
        register_rest_route('umh/v1', '/hr/loans', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_loans'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_loan'],
                'permission_callback' => [$this, 'check_permission'],
            ]
        ]);
    }

    public function get_loans($request) {
        global $wpdb;
        $table_loans = $wpdb->prefix . 'umh_employee_loans';
        $table_emp = $wpdb->prefix . 'umh_employees';
        
        $sql = "SELECT l.*, e.full_name as employee_name 
                FROM $table_loans l
                LEFT JOIN $table_emp e ON l.employee_id = e.id
                ORDER BY l.loan_date DESC";
                
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }

    public function create_loan($request) {
        global $wpdb;
        $table_loans = $wpdb->prefix . 'umh_employee_loans';
        $params = $request->get_json_params();
        
        if (empty($params['employee_id']) || empty($params['amount'])) {
            return new WP_Error('missing_param', 'Karyawan dan Jumlah wajib diisi', ['status' => 400]);
        }

        $inserted = $wpdb->insert($table_loans, [
            'employee_id' => $params['employee_id'],
            'loan_date'   => $params['loan_date'] ?: current_time('Y-m-d'),
            'amount'      => $params['amount'],
            'description' => $params['description'],
            'status'      => 'outstanding',
            'created_at'  => current_time('mysql')
        ]);
        
        if ($inserted) return rest_ensure_response(['success' => true]);
        return new WP_Error('db_error', 'Gagal simpan kasbon', ['status' => 500]);
    }
}
new UMH_HR_API();
?>