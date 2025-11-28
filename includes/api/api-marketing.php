<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Marketing_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // 1. Schema untuk Kampanye Iklan (Marketing Campaigns)
        $schema = [
            'title'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'platform'   => ['type' => 'string', 'default' => 'ig', 'sanitize_callback' => 'sanitize_text_field'],
            'budget'     => ['type' => 'number', 'default' => 0],
            'ad_link'    => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'esc_url_raw'], // Point 5: Link Iklan
            'start_date' => ['type' => 'string', 'format' => 'date'],
            'end_date'   => ['type' => 'string', 'format' => 'date'],
            'status'     => ['type' => 'string', 'default' => 'active', 'sanitize_callback' => 'sanitize_text_field']
        ];

        // Init Controller untuk tabel umh_marketing
        parent::__construct('marketing', 'umh_marketing', $schema, ['get_items' => ['admin_staff', 'marketing_staff']]);
        
        // 2. Register Route Tambahan untuk Leads (Prospek)
        add_action('rest_api_init', [$this, 'register_leads_routes']);
    }

    /**
     * Mendaftarkan route API khusus untuk Leads
     */
    public function register_leads_routes() {
        register_rest_route('umh/v1', '/leads', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_leads'],
                'permission_callback' => [$this, 'check_permission_leads'],
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'create_lead'],
                'permission_callback' => [$this, 'check_permission_leads'],
            ]
        ]);
        
        register_rest_route('umh/v1', '/leads/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE', 'PATCH'],
            'callback' => [$this, 'handle_single_lead'],
            'permission_callback' => [$this, 'check_permission_leads'],
        ]);
    }

    public function check_permission_leads($request) {
        if (function_exists('umh_check_api_permission')) {
            $checker = umh_check_api_permission(['owner', 'admin_staff', 'marketing_staff']);
            return call_user_func($checker, $request);
        }
        return current_user_can('read');
    }

    /**
     * Mengambil data Leads
     */
    public function get_leads($request) {
        global $wpdb;
        $table_leads = $wpdb->prefix . 'umh_leads';
        $table_users = $wpdb->prefix . 'umh_users';
        
        // Cek apakah tabel leads ada, jika tidak return kosong (safety)
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_leads'") != $table_leads) {
            return rest_ensure_response([]);
        }

        $sql = "SELECT l.*, u.full_name as assigned_to_name 
                FROM $table_leads l 
                LEFT JOIN $table_users u ON l.assigned_to = u.id 
                WHERE 1=1";

        if ($search = $request->get_param('search')) {
            $like = '%' . $wpdb->esc_like($search) . '%';
            $sql .= $wpdb->prepare(" AND (l.name LIKE %s OR l.phone LIKE %s)", $like, $like);
        }

        $sql .= " ORDER BY l.created_at DESC";
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }

    /**
     * Membuat Lead Baru
     */
    public function create_lead($request) {
        global $wpdb;
        $table_leads = $wpdb->prefix . 'umh_leads';
        $params = $request->get_json_params();

        if (empty($params['name']) || empty($params['phone'])) {
            return new WP_Error('missing_fields', 'Nama dan No. WhatsApp wajib diisi', ['status' => 400]);
        }

        $assigned_to = null;
        if (!empty($params['assigned_to'])) {
            $assigned_to = intval($params['assigned_to']);
        }

        $data = [
            'name'        => sanitize_text_field($params['name']),
            'phone'       => sanitize_text_field($params['phone']),
            'source'      => sanitize_text_field($params['source'] ?? 'walk_in'),
            'status'      => sanitize_text_field($params['status'] ?? 'new'), // new, contacted, interested, closed
            'notes'       => sanitize_textarea_field($params['notes'] ?? ''),
            'assigned_to' => $assigned_to,
            'created_at'  => current_time('mysql'),
            'updated_at'  => current_time('mysql')
        ];

        $wpdb->insert($table_leads, $data);
        
        if ($wpdb->last_error) {
            return new WP_Error('db_error', $wpdb->last_error, ['status' => 500]);
        }

        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Lead berhasil disimpan']);
    }

    /**
     * Handle Update & Delete Lead
     */
    public function handle_single_lead($request) {
        global $wpdb;
        $table_leads = $wpdb->prefix . 'umh_leads';
        $id = $request->get_param('id');
        $method = $request->get_method();
        $params = $request->get_json_params();

        if ($method === 'DELETE') {
            $wpdb->delete($table_leads, ['id' => $id], ['%d']);
            return rest_ensure_response(['success' => true, 'message' => 'Lead dihapus']);
        }

        if ($method === 'PUT' || $method === 'PATCH') {
            $data = [];
            $fields = ['name', 'phone', 'source', 'status', 'notes', 'assigned_to'];
            foreach ($fields as $field) {
                if (isset($params[$field])) {
                    $data[$field] = $field === 'notes' ? sanitize_textarea_field($params[$field]) : sanitize_text_field($params[$field]);
                }
            }
            
            if (!empty($data)) {
                $data['updated_at'] = current_time('mysql');
                $wpdb->update($table_leads, $data, ['id' => $id]);
            }
            return rest_ensure_response(['success' => true, 'message' => 'Lead diperbarui']);
        }
    }
}

new UMH_Marketing_API();