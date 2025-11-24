<?php
// File: includes/api/api-agents.php
// Menangani CRUD untuk Data Sub Agen (sesuai file Data Sub Agen)

if (!defined('ABSPATH')) {
    exit;
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Agents_API extends UMH_CRUD_Controller {
    
    protected $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_agents';
        $this->namespace = 'umh/v1';
        $this->rest_base = 'agents';
    }

    // Override untuk pencarian spesifik (Nama, Kode Agen, Kota)
    protected function get_items_query_args($request) {
        $args = parent::get_items_query_args($request);
        
        // Custom search di tabel agents
        if (!empty($request['search'])) {
            $search = sanitize_text_field($request['search']);
            $args['where'] .= " AND (agent_code LIKE '%$search%' OR full_name LIKE '%$search%' OR address LIKE '%$search%')";
        }
        
        return $args;
    }

    // Override validasi input
    protected function validate_item($data) {
        $errors = new WP_Error();

        if (empty($data['full_name'])) {
            $errors->add('empty_name', __('Nama Agen wajib diisi.', 'umroh-manager'));
        }
        
        if (empty($data['agent_code'])) {
            $errors->add('empty_code', __('Kode Agen (No ID) wajib diisi.', 'umroh-manager'));
        }

        if (!empty($errors->get_error_codes())) {
            return $errors;
        }

        return $data;
    }
}

// Inisialisasi
$umh_agents_api = new UMH_Agents_API();
$umh_agents_api->register_routes();
?>