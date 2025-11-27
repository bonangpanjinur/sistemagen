<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'umh_register_packages_routes');

function umh_register_packages_routes() {
    $namespace = 'umh/v1';
    $base = 'packages';

    // SCHEMA LENGKAP UNTUK PAKET (DINAMIS & MULTI-VARIAN)
    $schema = [
        // Data Dasar
        'name'            => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'service_type'    => ['type' => 'string', 'default' => 'umroh', 'sanitize_callback' => 'sanitize_text_field'], // umroh, haji, tour
        'category_id'     => ['type' => 'integer', 'required' => false], // Relasi ke umh_package_categories
        'duration'        => ['type' => 'integer', 'default' => 9],
        'status'          => ['type' => 'string', 'default' => 'active', 'sanitize_callback' => 'sanitize_text_field'],

        // Harga (Varian & Dasar)
        'price'           => ['type' => 'number', 'default' => 0], // Harga dasar (biasanya Quad) untuk sorting/display awal
        'prices'          => ['type' => 'object', 'required' => false, 'default' => []], // JSON: {quad: 30jt, triple: 32jt, double: 35jt}

        // Relasi Transportasi
        'airline_id'      => ['type' => 'integer', 'required' => false], // Relasi ke umh_flights

        // Akomodasi (Multi Hotel)
        'accommodations'  => ['type' => 'array', 'required' => false, 'default' => [], 'items' => [
            'type' => 'object',
            'properties' => [
                'hotel_id' => ['type' => 'integer'],
                'city'     => ['type' => 'string']
            ]
        ]],

        // Detail Fasilitas
        'facilities'      => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'], // Include
        'excludes'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'], // Exclude

        // Itinerary (Bisa Manual Array atau File Upload)
        'itinerary_type'  => ['type' => 'string', 'default' => 'manual', 'sanitize_callback' => 'sanitize_text_field'], // 'manual' or 'upload'
        'itinerary_items' => ['type' => 'array', 'required' => false, 'default' => []], // Jika manual
        'itinerary_data'  => ['type' => 'string', 'required' => false], // Jika upload (URL File)
    ];

    // HAK AKSES (PERMISSIONS)
    $permissions = [
        'get_items'    => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'], // Agent & Finance butuh liat paket
        'get_item'     => ['owner', 'admin_staff', 'marketing', 'agent', 'finance'],
        'create_item'  => ['owner', 'admin_staff'], // Hanya admin level atas yang buat paket
        'update_item'  => ['owner', 'admin_staff'],
        'delete_item'  => ['owner', 'admin_staff'],
    ];

    // FIELD PENCARIAN
    $search_fields = ['name', 'service_type'];

    // FILTER & HOOKS KHUSUS
    // Hook ini berguna jika kita ingin memanipulasi data sebelum disimpan ke DB
    // Misalnya mengkonversi array ke JSON string secara manual jika driver DB bermasalah (tapi class controller sudah handle ini)
    
    // add_filter("umh_crud_{$base}_before_create", 'umh_process_package_data', 10, 1);
    // add_filter("umh_crud_{$base}_before_update", 'umh_process_package_data', 10, 1);

    // INSTANSIASI CONTROLLER
    new UMH_CRUD_Controller(
        $base,               // Endpoint: umh/v1/packages
        'umh_packages',      // Nama Tabel DB
        $schema,             // Schema Validasi
        $permissions,        // Hak Akses
        $search_fields       // Kolom Search
    );
}

// Contoh fungsi helper jika ingin manipulasi data spesifik
/*
function umh_process_package_data($data) {
    // Logika tambahan bisa ditaruh sini
    return $data;
}
*/