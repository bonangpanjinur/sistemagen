<?php
if (!defined('ABSPATH')) {
    exit;
}

// LANGSUNG INSTANSIASI, HAPUS WRAPPER HOOK
$namespace = 'umh/v1';
$base = 'packages';

$schema = [
    'name'            => ['type' => 'string', 'required' => true],
    'service_type'    => ['type' => 'string', 'default' => 'umroh'], 
    'category_id'     => ['type' => 'integer', 'required' => false], 
    'duration'        => ['type' => 'integer', 'default' => 9],
    'status'          => ['type' => 'string', 'default' => 'active'],
    'price'           => ['type' => 'number', 'default' => 0], 
    'prices'          => ['type' => 'object', 'required' => false, 'default' => []], 
    'airline_id'      => ['type' => 'integer', 'required' => false], 
    'accommodations'  => ['type' => 'array', 'required' => false, 'default' => []],
    'facilities'      => ['type' => 'string', 'required' => false], 
    'excludes'        => ['type' => 'string', 'required' => false], 
];

$permissions = [
    'get_items'    => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'], 
    'get_item'     => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'],
    'create_item'  => ['owner', 'admin_staff'], 
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

$search_fields = ['name', 'service_type'];

new UMH_CRUD_Controller(
    $base,               
    'umh_packages',      
    $schema,             
    $permissions,        
    $search_fields       
);