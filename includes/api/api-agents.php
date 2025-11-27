<?php
if (!defined('ABSPATH')) {
    exit; 
}

add_action('rest_api_init', 'umh_register_agents_routes');

function umh_register_agents_routes() {
    $namespace = 'umh/v1';
    $base = 'agents';

    // SCHEMA UPDATE: Menambahkan parent_id dan type
    $agents_schema = [
        'name'            => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'email'           => ['type' => 'string', 'required' => false, 'format' => 'email', 'sanitize_callback' => 'sanitize_email'],
        'phone'           => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'address'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
        'city'            => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'code'            => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'status'          => ['type' => 'string', 'default' => 'active', 'sanitize_callback' => 'sanitize_text_field'],
        'commission_rate' => ['type' => 'number', 'default' => 0],
        
        // FIELD BARU UNTUK HIERARKI
        'parent_id'       => ['type' => 'integer', 'required' => false], // ID Agen Induk (Null jika Master)
        'type'            => ['type' => 'string', 'default' => 'master', 'sanitize_callback' => 'sanitize_text_field'], // 'master' atau 'sub'
    ];

    $agents_permissions = [
        'get_items'    => ['owner', 'admin_staff', 'marketing'],
        'get_item'     => ['owner', 'admin_staff', 'marketing'],
        'create_item'  => ['owner', 'admin_staff'],
        'update_item'  => ['owner', 'admin_staff'],
        'delete_item'  => ['owner'],
    ];

    $searchable_fields = ['name', 'email', 'phone', 'code', 'city'];

    // Auto generate Agent Code if empty
    add_filter("umh_crud_{$base}_before_create", 'umh_generate_agent_code', 10, 1);

    new UMH_CRUD_Controller(
        $base,               
        'umh_agents',         
        $agents_schema,       
        $agents_permissions,  
        $searchable_fields   
    );
}

function umh_generate_agent_code($data) {
    if (empty($data['code'])) {
        // Generate kode unik: AG-TIMESTAMP (Contoh sederhana)
        $data['code'] = 'AG-' . strtoupper(substr(md5(time() . rand()), 0, 5));
    }
    return $data;
}