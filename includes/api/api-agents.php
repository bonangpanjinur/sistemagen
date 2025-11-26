<?php
/**
 * File: includes/api/api-agents.php
 * * PERBAIKAN: 
 * - Menggunakan inisialisasi standar UMH_CRUD_Controller.
 * - Menambahkan definisi schema agar input valid dan aman.
 */

if (!defined('ABSPATH')) {
    exit;
}

// Pastikan class controller sudah dimuat
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// 1. Definisikan Skema Data (Sesuai tabel umh_agents)
$agents_schema = [
    'agent_code'    => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'full_name'     => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'ktp_number'    => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'address'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'phone'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'join_date'     => ['type' => 'string', 'format' => 'date', 'required' => false],
    'status'        => ['type' => 'string', 'default' => 'active', 'enum' => ['active', 'inactive']],
    'notes'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'bank_account'  => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'commission_rate'=>['type' => 'number', 'required' => false],
];

// 2. Definisikan Izin
$agents_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'marketing_staff'],
    'get_item'     => ['owner', 'admin_staff', 'marketing_staff'],
    'create_item'  => ['owner', 'admin_staff'],
    'update_item'  => ['owner', 'admin_staff'],
    'delete_item'  => ['owner'],
];

// 3. Kolom Pencarian
$agents_search_fields = ['full_name', 'agent_code', 'phone'];

// 4. Inisialisasi Controller
// Endpoint: /wp-json/umh/v1/agents
new UMH_CRUD_Controller('agents', 'umh_agents', $agents_schema, $agents_permissions, $agents_search_fields);