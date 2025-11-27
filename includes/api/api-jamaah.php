<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Jamaah_API extends UMH_CRUD_Controller {
    public function __construct() {
        // Schema LENGKAP (V2.2)
        // Menambahkan package_id dan sub_agent_id ke schema validasi
        $schema = [
            'registration_code' => ['type' => 'string'],
            'full_name'         => ['type' => 'string', 'required' => true],
            'gender'            => ['type' => 'string'],
            'birth_place'       => ['type' => 'string'],
            'birth_date'        => ['type' => 'string', 'format' => 'date'],
            'marital_status'    => ['type' => 'string'],
            'occupation'        => ['type' => 'string'],
            
            'ktp_number'        => ['type' => 'string'],
            'passport_number'   => ['type' => 'string'],
            'passport_name'     => ['type' => 'string'],
            'passport_issued_date' => ['type' => 'string', 'format' => 'date'],
            'passport_expiry_date' => ['type' => 'string', 'format' => 'date'],
            'passport_issued_office' => ['type' => 'string'],

            'address'           => ['type' => 'string'],
            'city'              => ['type' => 'string'],
            'phone_number'      => ['type' => 'string'],
            
            'father_name'       => ['type' => 'string'],
            'mother_name'       => ['type' => 'string'],
            'heir_name'         => ['type' => 'string'],
            'heir_relation'     => ['type' => 'string'],

            // Relasi Dinamis (PENTING untuk Dropdown)
            'package_id'        => ['type' => 'integer'], // ID Paket
            'sub_agent_id'      => ['type' => 'integer'], // ID Agen
            
            'package_type'      => ['type' => 'string'], // Nama Paket (Snapshot)
            'sub_agent_name'    => ['type' => 'string'], // Nama Agen (Snapshot)
            'room_type'         => ['type' => 'string'],
            'departure_date'    => ['type' => 'string', 'format' => 'date'],
            'clothing_size'     => ['type' => 'string'],
            
            'status'            => ['type' => 'string', 'default' => 'active'],
            'notes'             => ['type' => 'string'],
        ];
        parent::__construct('jamaah', 'umh_jamaah', $schema, ['get_items' => ['admin_staff'], 'create_item' => ['admin_staff']]);
    }
}
new UMH_Jamaah_API();
?>