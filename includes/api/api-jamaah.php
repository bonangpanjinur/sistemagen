<?php
/**
 * File: includes/api/api-jamaah.php
 *
 * PENINGKATAN (Item 2):
 * - File ini ditulis ulang sepenuhnya (refaktor).
 * - Mengganti semua fungsi kustom (umh_get_all_jamaah, dll)
 * dengan UMH_CRUD_Controller yang standar dan stabil.
 * - Menambahkan definisi $jamaah_schema agar sesuai db-schema.php.
 * - Menambahkan $searchable_fields untuk Peningkatan 4.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data Jemaah (sesuai db-schema.php)
$jamaah_schema = [
    'package_id'       => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'full_name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'birth_date'       => ['type' => 'string', 'format' => 'date', 'required' => false],
    'gender'           => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'address'          => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'phone'            => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'email'            => ['type' => 'string', 'format' => 'email', 'required' => false, 'sanitize_callback' => 'sanitize_email'],
    'passport_number'  => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'passport_expiry'  => ['type' => 'string', 'format' => 'date', 'required' => false],
    'ktp_number'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'ktp_scan'         => ['type' => 'string', 'format' => 'uri', 'required' => false, 'sanitize_callback' => 'esc_url_raw'],
    'passport_scan'    => ['type' => 'string', 'format' => 'uri', 'required' => false, 'sanitize_callback' => 'esc_url_raw'],
    'room_type'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status'           => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'total_price'      => ['type' => 'number', 'required' => true],
    'amount_paid'      => ['type' => 'number', 'required' => false], // Di-handle oleh api-payments.php
    'payment_status'   => ['type' => 'string', 'required' => false], // Di-handle oleh api-payments.php
    'notes'            => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
];

// 2. Definisikan Izin
$jamaah_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'ops_staff', 'finance_staff'],
    'get_item'     => ['owner', 'admin_staff', 'ops_staff', 'finance_staff'],
    'create_item'  => ['owner', 'admin_staff', 'ops_staff'],
    'update_item'  => ['owner', 'admin_staff', 'ops_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

// 3. Tentukan Kolom yang Bisa Dicari
$jamaah_searchable_fields = ['full_name', 'email', 'phone', 'passport_number', 'ktp_number'];

// 4. Inisialisasi Controller
new UMH_CRUD_Controller(
    'jamaah', 
    'umh_jamaah', 
    $jamaah_schema, 
    $jamaah_permissions,
    $jamaah_searchable_fields
);

// Catatan:
// - API Upload (ktp_scan, passport_scan) ditangani oleh api-uploads.php
// - Perhitungan amount_paid dan payment_status ditangani oleh api-payments.php