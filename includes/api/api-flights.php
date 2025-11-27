<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'umh_register_flights_routes');

function umh_register_flights_routes() {
    $base = 'flights';

    $schema = [
        'name'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'code'      => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'type'      => ['type' => 'string', 'default' => 'International'],
        'status'    => ['type' => 'string', 'default' => 'active'],
    ];

    new UMH_CRUD_Controller(
        $base,               // Endpoint: umh/v1/flights
        'umh_flights',       // Nama Tabel DB
        $schema,
        [
            'get_items'   => ['owner', 'admin_staff'],
            'create_item' => ['owner', 'admin_staff'],
            'update_item' => ['owner', 'admin_staff'],
            'delete_item' => ['owner'],
        ],
        ['name', 'code']
    );
}