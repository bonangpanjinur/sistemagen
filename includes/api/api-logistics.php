<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Logistics_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'jamaah_id'    => ['type' => 'integer', 'required' => true],
            'items_taken'  => ['type' => 'string'], // JSON/String list barang
            'taken_date'   => ['type' => 'string', 'format' => 'date'],
            'taken_by'     => ['type' => 'string'],
            'status'       => ['type' => 'string', 'default' => 'Sudah Diambil'],
            'notes'        => ['type' => 'string'],
        ];
        parent::__construct('logistics', 'umh_logistics', $schema, ['get_items' => ['admin_staff']]);
    }

    public function get_items($request) {
        global $wpdb;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        
        // Join Logistik dengan Jemaah
        $sql = "SELECT l.*, j.full_name, j.package_type, j.sub_agent_name, j.address
                FROM {$this->table_name} l
                JOIN $jamaah_table j ON l.jamaah_id = j.id
                ORDER BY l.taken_date DESC";
                
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }
}
new UMH_Logistics_API();
?>