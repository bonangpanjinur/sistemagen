<?php
if (!defined('ABSPATH')) {
    exit;
}

// PERBAIKAN: Jangan bungkus new UMH_CRUD_Controller dalam add_action('rest_api_init', ...);
// Karena file ini di-include oleh Loader, dan class Controller akan mendaftarkan hook-nya sendiri.

$schema = [
    'name'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'city'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'rating'    => ['type' => 'string', 'default' => '5', 'sanitize_callback' => 'sanitize_text_field'],
    'distance'  => ['type' => 'integer', 'default' => 0],
];

new UMH_CRUD_Controller(
    'hotels',            // Endpoint base: umh/v1/hotels
    'umh_hotels',        // Nama Tabel DB
    $schema,             // Schema Validasi
    [                    // Permissions
        'get_items'   => ['owner', 'admin_staff'],
        'create_item' => ['owner', 'admin_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner'],
    ],
    ['name', 'city']     // Kolom Search
);