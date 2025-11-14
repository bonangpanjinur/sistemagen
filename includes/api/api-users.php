<?php
// File: includes/api/api-users.php
// Mengelola daftar pengguna dan hak akses kustom

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan Daftar Karyawan (Pengguna WordPress) bersama dengan Hak Akses Kustom mereka
 * Endpoint: GET /umroh/v1/users
 */
function umroh_api_get_users_with_permissions(WP_REST_Request $request) {
    global $wpdb;
    $table_permissions = $wpdb->prefix . 'umroh_user_permissions';

    // Perluasan daftar role yang relevan untuk karyawan
    $relevant_roles = apply_filters('umroh_manager_employee_roles', ['subscriber', 'editor', 'contributor', 'author', 'administrator']);

    $users_data = get_users([
        'role__in' => $relevant_roles, 
        'fields' => ['ID', 'user_login', 'display_name', 'user_email']
    ]);

    $all_permissions = [];

    foreach ($users_data as $user) {
        // Ambil semua hak akses kustom untuk user ini
        $custom_perms = $wpdb->get_results(
            $wpdb->prepare("SELECT permission_key, has_access FROM $table_permissions WHERE user_id = %d", $user->ID),
            ARRAY_A
        );

        $permissions = [];
        foreach ($custom_perms as $perm) {
            $permissions[$perm['permission_key']] = (bool)$perm['has_access'];
        }

        // Gabungkan data pengguna dengan hak aksesnya
        $all_permissions[] = [
            'id' => $user->ID,
            'name' => $user->display_name,
            'login' => $user->user_login,
            'email' => $user->user_email,
            'permissions' => $permissions
        ];
    }

    return wp_send_json_success($all_permissions);
}

/**
 * Menyimpan Hak Akses Kustom Pengguna
 * Endpoint: POST /umroh/v1/users/(id)/permissions
 */
function umroh_api_save_user_permissions(WP_REST_Request $request) {
    global $wpdb;
    $table_permissions = $wpdb->prefix . 'umroh_user_permissions';
    $user_id = absint($request['id']);
    $permissions_data = $request->get_json_params(); 

    if (empty($user_id) || !is_array($permissions_data)) {
        return wp_send_json_error('Data tidak valid.', 400);
    }

    // 1. Hapus semua hak akses kustom lama untuk pengguna ini
    $wpdb->delete($table_permissions, ['user_id' => $user_id], ['%d']);

    // 2. Simpan hak akses baru
    $insert_count = 0;
    foreach ($permissions_data as $key => $access) {
        $access = (bool)$access;
        // Hanya simpan jika akses disetel ke TRUE atau FALSE secara eksplisit
        if ($access === true || $access === false) {
             $wpdb->insert(
                $table_permissions,
                [
                    'user_id' => $user_id,
                    'permission_key' => sanitize_key($key),
                    'has_access' => $access ? 1 : 0
                ],
                ['%d', '%s', '%d']
            );
            $insert_count++;
        }
    }
    
    // Periksa apakah ada hak akses yang disimpan
    if ($insert_count > 0) {
        return wp_send_json_success(['message' => "Hak akses untuk User ID $user_id berhasil disimpan.", 'count' => $insert_count]);
    } else {
        return wp_send_json_success(['message' => "Hak akses diatur ke default (Tidak ada kustomisasi disimpan).", 'count' => 0]);
    }
}