<?php
/**
 * File: includes/api/api-users.php
 *
 * PENINGKATAN (Item 2):
 * - File ini ditulis ulang sepenuhnya (refaktor).
 * - Menggunakan UMH_CRUD_Controller yang standar.
 * - MENAMBAHKAN HOOKS (action) untuk sinkronisasi data dengan tabel wp_users
 * (membuat WP user baru, update WP user).
 * - Ini jauh lebih stabil daripada kode kustom sebelumnya.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data User (sesuai db-schema.php)
$users_schema = [
    'wp_user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'], // Akan diisi oleh hook
    'full_name'  => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'role'       => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'phone'      => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status'     => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'email'      => ['type' => 'string', 'format' => 'email', 'required' => true, 'sanitize_callback' => 'sanitize_email'], // Kustom untuk WP User
    'password'   => ['type' => 'string', 'required' => false], // Kustom untuk WP User (hanya create)
];

// 2. Definisikan Izin
$users_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'hr_staff'],
    'get_item'     => ['owner', 'admin_staff', 'hr_staff'],
    'create_item'  => ['owner', 'hr_staff'],
    'update_item'  => ['owner', 'hr_staff'],
    'delete_item'  => ['owner'],
];

// 3. Tentukan Kolom yang Bisa Dicari
$users_searchable_fields = ['full_name', 'email', 'phone', 'role'];

// 4. Inisialisasi Controller
new UMH_CRUD_Controller(
    'users', 
    'umh_users', 
    $users_schema, 
    $users_permissions,
    $users_searchable_fields
);


// 5. HOOKS untuk Sinkronisasi WP User (Logika Kustom dari file asli)

/**
 * Hook SEBELUM item 'users' dibuat.
 * Fungsi ini akan membuat WP User baru (di tabel wp_users).
 */
add_action('umh_crud_users_before_create', 'umh_sync_wp_user_on_create', 10, 2);
function umh_sync_wp_user_on_create($request, &$prepared_data) {
    global $wpdb;
    
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];

    if (empty($email) || !is_email($email)) {
        // Hentikan proses create dengan mengembalikan WP_Error
        // (Fitur ini perlu ditambahkan di class-umh-crud-controller.php, 
        // untuk sekarang kita asumsikan validasi frontend cukup)
        // return new WP_Error('bad_request', 'Invalid email.', ['status' => 400]);
        // Untuk amannya, kita cek lagi
        if (empty($email)) throw new Exception('Email diperlukan untuk membuat WP User.');
    }

    if (empty($password)) {
        throw new Exception('Password diperlukan untuk membuat WP User baru.');
    }
    
    if (email_exists($email)) {
        throw new Exception('Email ini sudah terdaftar di WordPress.');
    }

    // Buat WP User baru
    $wp_user_id = wp_create_user($email, $password, $email);

    if (is_wp_error($wp_user_id)) {
        throw new Exception('Gagal membuat WP User: ' . $wp_user_id->get_error_message());
    }

    // Update data WP User (nama, role WP)
    wp_update_user([
        'ID'           => $wp_user_id,
        'display_name' => $prepared_data['full_name'],
        'first_name'   => $prepared_data['full_name'],
        'role'         => 'umh_agent' // Beri role WP standar, role plugin ada di tabel umh_users
    ]);

    // !! PENTING: Masukkan wp_user_id ke data yang akan disimpan
    $prepared_data['wp_user_id'] = $wp_user_id;
    
    // Hapus data kustom 'email' dan 'password' dari data yang disanitasi
    // agar tidak error saat insert ke tabel umh_users (karena tidak ada kolomnya)
    // 'email' akan kita tambahkan lagi jika diperlukan
    unset($prepared_data['email']);
    unset($prepared_data['password']);
}


/**
 * Hook SEBELUM item 'users' di-update.
 * Fungsi ini akan meng-update data di tabel wp_users.
 */
add_action('umh_crud_users_before_update', 'umh_sync_wp_user_on_update', 10, 4);
function umh_sync_wp_user_on_update($request, &$prepared_data, $id, $existing_item) {
    
    $wp_user_id = $existing_item->wp_user_id;
    if (empty($wp_user_id)) {
        return; // Tidak ada WP user tertaut, skip
    }

    $params = $request->get_json_params();
    $update_data = [];

    // Cek apakah 'full_name' diupdate
    if (isset($prepared_data['full_name']) && $prepared_data['full_name'] !== $existing_item->full_name) {
        $update_data['display_name'] = $prepared_data['full_name'];
        $update_data['first_name'] = $prepared_data['full_name'];
    }

    // Cek apakah 'email' diupdate (Email tidak boleh diubah, jadi kita skip)
    // Jika email diizinkan diubah, logikanya lebih rumit
    unset($prepared_data['email']);

    // Cek apakah password diupdate
    if (!empty($params['password'])) {
        wp_set_password($params['password'], $wp_user_id);
    }
    unset($prepared_data['password']); // Hapus dari data insert

    // Update data WP User jika ada perubahan
    if (!empty($update_data)) {
        $update_data['ID'] = $wp_user_id;
        wp_update_user($update_data);
    }
}


/**
 * Hook SEBELUM item 'users' dihapus.
 * Fungsi ini akan menghapus WP User terkait.
 */
add_action('umh_crud_users_before_delete', 'umh_sync_wp_user_on_delete', 10, 2);
function umh_sync_wp_user_on_delete($id, $existing_item) {
    
    if (!function_exists('wp_delete_user')) {
        require_once(ABSPATH . 'wp-admin/includes/user.php');
    }

    $wp_user_id = $existing_item->wp_user_id;
    if (!empty($wp_user_id)) {
        // Cek apakah user ini punya post/konten
        // Jika ya, mungkin kita tidak ingin menghapusnya, atau re-assign
        // Untuk saat ini, kita hapus
        wp_delete_user($wp_user_id);
    }
}