<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'umh_register_hotels_routes');

function umh_register_hotels_routes() {
    $base = 'hotels';

    $schema = [
        'name'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'city'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'], // Makkah, Madinah
        'rating'    => ['type' => 'string', 'default' => '5', 'sanitize_callback' => 'sanitize_text_field'],
        'distance'  => ['type' => 'integer', 'default' => 0],
    ];

    // Gunakan class UMH_CRUD_Controller agar standar
    new UMH_CRUD_Controller(
        $base,               // Endpoint: umh/v1/hotels
        'umh_hotels',        // Nama Tabel DB
        $schema,             // Schema Validasi
        [                    // Permissions
            'get_items'   => ['owner', 'admin_staff'],
            'create_item' => ['owner', 'admin_staff'],
            'update_item' => ['owner', 'admin_staff'],
            'delete_item' => ['owner'],
        ],
        ['name', 'city']     // Kolom yang bisa di-search
    );
}