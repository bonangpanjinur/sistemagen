<?php
if (!defined('ABSPATH')) { exit; }

class UMH_Departures_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'package_id'     => ['type' => 'integer', 'required' => true],
            'departure_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
            'quota'          => ['type' => 'integer', 'default' => 45],
            'status'         => ['type' => 'string', 'default' => 'open'],
            // POIN 2: Harga spesifik tanggal ini
            'price_override' => ['type' => 'number', 'default' => 0], 
        ];
        
        parent::__construct('departures', 'umh_departures', $schema, 
            ['get_items' => ['owner', 'admin_staff', 'marketing'], 'create_item' => ['owner', 'admin_staff']], 
            ['status']
        );
    }

    // Override query untuk join paket agar dapat nama paket
    public function get_items($request) {
        global $wpdb;
        $limit = $request->get_param('per_page') ?: 20;
        $offset = ($request->get_param('page') ? $request->get_param('page') - 1 : 0) * $limit;

        $sql = "SELECT d.*, p.name as package_name, p.price as base_price 
                FROM {$this->table_name} d
                LEFT JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                ORDER BY d.departure_date ASC";
        
        // Logika pagination sederhana untuk contoh ini
        // Implementasi lengkap sebaiknya pake count total
        $items = $wpdb->get_results($sql, ARRAY_A);
        return rest_ensure_response($items);
    }
}
new UMH_Departures_API();