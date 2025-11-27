<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Agents_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'agent_code' => ['type' => 'string'], // Tidak required, karena auto-generate
            'name'       => ['type' => 'string', 'required' => true],
            'ktp_number' => ['type' => 'string'],
            'phone'      => ['type' => 'string'],
            'area'       => ['type' => 'string'],
            'join_date'  => ['type' => 'string', 'format' => 'date'],
            'notes'      => ['type' => 'string'],
            'status'     => ['type' => 'string', 'default' => 'active'],
        ];
        parent::__construct('agents', 'umh_agents', $schema, ['get_items' => ['admin_staff'], 'create_item' => ['admin_staff']]);
    }

    // Override Create Item untuk Auto Generate ID
    public function create_item($request) {
        $params = $request->get_json_params();
        
        // Jika agent_code kosong, generate otomatis
        if (empty($params['agent_code'])) {
            $params['agent_code'] = $this->generate_agent_code();
            $request->set_body_params($params);
        }
        
        return parent::create_item($request);
    }

    private function generate_agent_code() {
        global $wpdb;
        // Cari ID terakhir, misal 005-AGBTN
        $last_id = $wpdb->get_var("SELECT id FROM {$this->table_name} ORDER BY id DESC LIMIT 1");
        $next_num = ($last_id) ? $last_id + 1 : 1;
        
        // Format: 001-AGBTN
        return sprintf('%03d-AGBTN', $next_num);
    }
}
new UMH_Agents_API();
?>