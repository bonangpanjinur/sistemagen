<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Marketing_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // Definisi Schema untuk Validasi Otomatis Data Kampanye (Marketing Campaigns)
        $schema = [
            'title' => ['type' => 'string', 'required' => true],
            'platform' => ['type' => 'string', 'default' => 'ig'], // ig, fb, google, offline
            'budget' => ['type' => 'number', 'default' => 0],
            'start_date' => ['type' => 'string', 'format' => 'date'],
            'end_date' => ['type' => 'string', 'format' => 'date'],
            'status' => ['type' => 'string', 'default' => 'active']
        ];

        // Init Parent Controller untuk tabel 'umh_marketing'
        parent::__construct('marketing', 'umh_marketing', $schema, ['get_items' => ['admin_staff', 'marketing_staff']]);
        
        // Register route tambahan khusus untuk Leads (Calon Jemaah)
        add_action('rest_api_init', [$this, 'register_leads_routes']);
    }

    public function register_leads_routes() {
        // Route Collection (GET All & Create)
        register_rest_route('umh/v1', '/leads', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_leads_request'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
        
        // Route Single Item (Update & Delete)
        register_rest_route('umh/v1', '/leads/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_leads_request'],
            'permission_callback' => [$this, 'check_permission'],
        ]);
    }

    public function handle_leads_request($request) {
        global $wpdb;
        $table_leads = $wpdb->prefix . 'umh_leads';
        $method = $request->get_method();
        $params = $request->get_json_params();

        // --- GET LEADS (READ) ---
        if ($method === 'GET') {
            $sql = "SELECT * FROM $table_leads WHERE 1=1";
            
            // Fitur Filter Status (Opsional, untuk pengembangan lanjut)
            if ($status = $request->get_param('status')) {
                $sql .= $wpdb->prepare(" AND status = %s", sanitize_text_field($status));
            }

            // Fitur Search Nama/HP
            if ($search = $request->get_param('search')) {
                $like = '%' . $wpdb->esc_like($search) . '%';
                $sql .= $wpdb->prepare(" AND (name LIKE %s OR phone LIKE %s)", $like, $like);
            }

            $sql .= " ORDER BY created_at DESC";
            
            $results = $wpdb->get_results($sql, ARRAY_A);
            return rest_ensure_response($results);
        }

        // --- CREATE LEAD ---
        if ($method === 'POST') {
            // Validasi Server-side
            if (empty($params['name']) || empty($params['phone'])) {
                return new WP_Error('missing_fields', 'Nama dan No. WhatsApp wajib diisi', ['status' => 400]);
            }

            $data = [
                'name' => sanitize_text_field($params['name']),
                'phone' => sanitize_text_field($params['phone']),
                'source' => sanitize_text_field($params['source'] ?? 'walk_in'),
                'status' => sanitize_text_field($params['status'] ?? 'new'),
                'notes' => sanitize_textarea_field($params['notes'] ?? ''),
                'assigned_to' => get_current_user_id()
            ];

            $format = ['%s', '%s', '%s', '%s', '%s', '%d'];

            $wpdb->insert($table_leads, $data, $format);
            
            if ($wpdb->last_error) {
                return new WP_Error('db_error', $wpdb->last_error, ['status' => 500]);
            }

            return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
        }

        // --- UPDATE LEAD ---
        if ($method === 'PUT') {
            $id = $request->get_param('id');
            
            // Cek existensi
            $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_leads WHERE id = %d", $id));
            if (!$exists) return new WP_Error('not_found', 'Data prospek tidak ditemukan', ['status' => 404]);

            $data = [
                'name' => sanitize_text_field($params['name']),
                'phone' => sanitize_text_field($params['phone']),
                'source' => sanitize_text_field($params['source']),
                'status' => sanitize_text_field($params['status']),
                'notes' => sanitize_textarea_field($params['notes'])
            ];
            
            // Update hanya field yang dikirim (Partial Update) jika diperlukan, 
            // tapi di sini kita asumsi frontend kirim full object form.
            
            $wpdb->update($table_leads, $data, ['id' => $id], ['%s', '%s', '%s', '%s', '%s'], ['%d']);
            
            return rest_ensure_response(['success' => true]);
        }
        
        // --- DELETE LEAD ---
        if ($method === 'DELETE') {
            $id = $request->get_param('id');
            $wpdb->delete($table_leads, ['id' => $id], ['%d']);
            return rest_ensure_response(['success' => true]);
        }
    }
}
new UMH_Marketing_API();