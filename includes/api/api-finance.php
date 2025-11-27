<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Finance_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'transaction_type' => ['type' => 'string', 'required' => true], // income | expense
            'transaction_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
            'amount'           => ['type' => 'number', 'required' => true],
            'jamaah_id'        => ['type' => 'integer'],
            'payment_stage'    => ['type' => 'string'], // DP, Pelunasan, Cicilan
            'payment_method'   => ['type' => 'string'], // Cash, Transfer
            'category'         => ['type' => 'string'], // Operasional, Fee Agen, dll
            'description'      => ['type' => 'string'],
            'pic_name'         => ['type' => 'string'],
        ];
        parent::__construct('finance', 'umh_finance', $schema, ['get_items' => ['admin_staff'], 'create_item' => ['admin_staff']]);
    }

    // Override get_items untuk filter by type (income/expense)
    public function get_items($request) {
        global $wpdb;
        $type = $request->get_param('transaction_type');
        $params = [];
        
        $sql = "SELECT * FROM {$this->table_name} WHERE 1=1";
        
        if ($type) {
            $sql .= " AND transaction_type = %s";
            $params[] = $type;
        }
        
        $sql .= " ORDER BY transaction_date DESC";
        
        if (!empty($params)) {
            $sql = $wpdb->prepare($sql, $params);
        }
        
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }
}
new UMH_Finance_API();
?>