<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', 'umh_register_agents_routes');

function umh_register_agents_routes() {
    $namespace = 'umh/v1';
    $base = 'agents';

    $agents_schema = [
        'name' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'phone' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'city' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'code' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'commission_rate' => ['type' => 'number', 'default' => 0],
        'parent_id' => ['type' => 'integer', 'required' => false],
        'type' => ['type' => 'string', 'default' => 'master', 'sanitize_callback' => 'sanitize_text_field'],
    ];

    $agents_permissions = [
        'get_items' => ['owner', 'admin_staff', 'marketing'],
        'get_item' => ['owner', 'admin_staff', 'marketing'],
        'create_item' => ['owner', 'admin_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner'],
    ];

    $searchable_fields = ['name', 'code', 'city', 'phone'];

    // HOOK AUTO GENERATE CODE
    add_filter("umh_crud_{$base}_before_create", 'umh_auto_generate_agent_code', 10, 1);

    new UMH_CRUD_Controller($base, 'umh_agents', $agents_schema, $agents_permissions, $searchable_fields);
}

function umh_auto_generate_agent_code($data) {
    // Generate kode unik jika kosong
    if (empty($data['code'])) {
        global $wpdb;
        $prefix = ($data['type'] === 'sub') ? 'SB' : 'AG';
        
        // Ambil ID terakhir untuk sequence number (Simpel approach)
        $last_id = $wpdb->get_var("SELECT id FROM {$wpdb->prefix}umh_agents ORDER BY id DESC LIMIT 1");
        $next_id = ($last_id) ? $last_id + 1 : 1;
        
        // Format: AG-0001
        $data['code'] = $prefix . '-' . str_pad($next_id, 4, '0', STR_PAD_LEFT);
    }
    return $data;
}