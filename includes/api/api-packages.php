<?php
if (!defined('ABSPATH')) {
    exit;
}

// LANGSUNG INSTANSIASI, HAPUS WRAPPER HOOK
$namespace = 'umh/v1';
$base = 'packages';

$schema = [
    'name'            => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'category_id'     => ['type' => 'integer', 'required' => false], 
    'duration'        => ['type' => 'integer', 'default' => 9],
    'status'          => ['type' => 'string', 'default' => 'active'],
    'price'           => ['type' => 'number', 'default' => 0], 
    // Sinkronisasi dengan DB Schema
    'hotel_makkah'    => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'], 
    'hotel_madinah'   => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'], 
    'airline'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'], 
    'facilities'      => ['type' => 'string', 'required' => false], 
    'description'     => ['type' => 'string', 'required' => false], 
];

$permissions = [
    'get_items'    => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'], 
    'get_item'     => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'],
    'create_item'  => ['owner', 'admin_staff'], 
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

$search_fields = ['name', 'hotel_makkah', 'hotel_madinah', 'airline'];

new UMH_CRUD_Controller(
    $base,               
    'umh_packages',      
    $schema,             
    $permissions,        
    $search_fields       
);