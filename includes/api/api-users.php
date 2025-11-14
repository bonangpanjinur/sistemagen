<?php
// File: includes/api/api-users.php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Registrasi endpoint untuk users
function umh_register_user_api_routes() {
    
    // Endpoint yang sudah ada: Login Kustom (untuk Poin 4)
    register_rest_route('umh/v1', '/users/login', [
        'methods' => 'POST',
        'callback' => 'umh_login_user',
        'permission_callback' => '__return_true', // Izinkan akses publik HANYA untuk login
    ]);

    // Endpoint yang sudah ada: CRUD untuk users
    // GET all users
    register_rest_route('umh/v1', '/users', [
        'methods' => 'GET',
        'callback' => 'umh_get_all_users',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // POST create new user
    register_rest_route('umh/v1', '/users', [
        'methods' => 'POST',
        'callback' => 'umh_create_user',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // GET specific user by ID
    register_rest_route('umh/v1', '/users/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'umh_get_user_by_id',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // PUT update user by ID
    register_rest_route('umh/v1', '/users/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'umh_update_user',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // DELETE user by ID
    register_rest_route('umh/v1', '/users/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'umh_delete_user',
        'permission_callback' => 'umh_check_api_permission', // **PERBAIKAN: Terapkan keamanan**
    ]);

    // **PERBAIKAN BARU: (Poin 1 & 2) Endpoint Auto-Login untuk WP Admin**
    register_rest_route('umh/v1', '/auth/wp-login', [
        'methods' => 'POST',
        'callback' => 'umh_handle_wp_admin_login',
        'permission_callback' => function () {
            // Sangat penting: Hanya izinkan WP Admin/Super Admin
            return is_super_admin() || current_user_can('manage_options');
        },
    ]);

    // **PERBAIKAN BARU: Endpoint untuk verifikasi token (GET /me)**
    register_rest_route('umh/v1', '/users/me', [
        'methods' => 'GET',
        'callback' => 'umh_get_current_user_by_token',
        'permission_callback' => 'umh_check_api_permission', // Gunakan checker utama kita
    ]);
}
add_action('rest_api_init', 'umh_register_user_api_routes');


// Callback untuk login kustom (Poin 4)
function umh_login_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    $params = $request->get_json_params();
    $username = sanitize_text_field($params['username']);
    $password = $params['password'];

    if (empty($username) || empty($password)) {
        return new WP_Error('invalid_credentials', 'Username dan password tidak boleh kosong.', ['status' => 400]);
    }

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE username = %s OR user_email = %s", $username, $username));

    if (!$user) {
        return new WP_Error('invalid_username', 'Username tidak ditemukan.', ['status' => 403]);
    }

    // Verifikasi password
    if (password_verify($password, $user->password_hash)) {
        // Buat token
        $token = bin2hex(random_bytes(32));
        
        // Simpan token ke database
        $wpdb->update(
            $table_name,
            ['auth_token' => $token],
            ['user_id' => $user->user_id],
            ['%s'],
            ['%d']
        );

        // Kirim token dan data user (tanpa hash password)
        $user_data = [
            'user_id' => $user->user_id,
            'username' => $user->username,
            'user_email' => $user->user_email,
            'full_name' => $user->full_name,
            'role' => $user->role,
        ];

        return new WP_REST_Response(['token' => $token, 'user' => $user_data], 200);
    } else {
        return new WP_Error('invalid_password', 'Password salah.', ['status' => 403]);
    }
}

// **PERBAIKAN BARU: (Poin 1 & 2) Callback untuk auto-login WP Admin**
function umh_handle_wp_admin_login(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';

    // Kita sudah tahu user ini adalah admin karena 'permission_callback'
    $wp_user = wp_get_current_user();
    
    if (!$wp_user || $wp_user->ID === 0) {
        return new WP_Error('not_logged_in', 'User WP tidak terdeteksi.', ['status' => 401]);
    }

    // 1. Coba cari user di tabel umh_users berdasarkan email
    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE user_email = %s", $wp_user->user_email));

    if (!$user) {
        // 2. Jika tidak ada, buat user baru di tabel umh_users
        $wpdb->insert(
            $table_name,
            [
                'username' => $wp_user->user_login,
                'user_email' => $wp_user->user_email,
                'full_name' => $wp_user->display_name,
                'role' => 'owner', // Asumsikan WP Admin = 'owner' di React App
                'password_hash' => '', // Tidak perlu password, auth via WP
                'created_at' => current_time('mysql', 1),
            ],
            [
                '%s', '%s', '%s', '%s', '%s', '%s'
            ]
        );
        $user_id = $wpdb->insert_id;
        // Ambil data user yang baru dibuat
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id));
    
    } else {
        // (Opsional) Jika user sudah ada, pastikan rolenya 'owner'
        if ($user->role !== 'owner') {
            $wpdb->update(
                $table_name,
                ['role' => 'owner'],
                ['user_id' => $user->user_id]
            );
            $user->role = 'owner'; // Update objek lokal
        }
    }

    // 3. Buat token baru
    $token = bin2hex(random_bytes(32));

    // 4. Simpan token ke database
    $wpdb->update(
        $table_name,
        ['auth_token' => $token],
        ['user_id' => $user->user_id],
        ['%s'],
        ['%d']
    );

    // 5. Kirim token dan data user (tanpa hash password)
    $user_data = [
        'user_id' => $user->user_id,
        'username' => $user->username,
        'user_email' => $user->user_email,
        'full_name' => $user->full_name,
        'role' => $user->role,
    ];

    return new WP_REST_Response(['token' => $token, 'user' => $user_data], 200);
}

// **PERBAIKAN BARU: Callback untuk GET /me (verifikasi token)**
function umh_get_current_user_by_token(WP_REST_Request $request) {
    // Kita tidak perlu cek token di sini, karena umh_check_api_permission sudah melakukannya.
    // Tapi kita perlu mengambil user ID yang sudah diverifikasi oleh permission callback.
    
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';

    // Ambil token dari header (duplikat sementara dari logic di utils,
    // idealnya utils.php harus bisa menyimpan user yang terautentikasi)
    $auth_header = $request->get_header('Authorization');
    list($type, $token) = explode(' ', $auth_header, 2);

    $user = $wpdb->get_row($wpdb->prepare("SELECT user_id, username, user_email, full_name, role FROM $table_name WHERE auth_token = %s", $token));

    if (!$user) {
        // Ini seharusnya tidak terjadi jika umh_check_api_permission bekerja
        return new WP_Error('invalid_token', 'Token tidak valid.', ['status' => 401]);
    }

    return new WP_REST_Response($user, 200);
}


// --- Callback CRUD yang sudah ada ---
// (Pastikan semua permission_callback sudah diubah ke umh_check_api_permission)

function umh_get_all_users(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $results = $wpdb->get_results("SELECT user_id, username, user_email, full_name, role, created_at FROM $table_name");
    return new WP_REST_Response($results, 200);
}

function umh_create_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    $params = $request->get_json_params();
    $username = sanitize_text_field($params['username']);
    $email = sanitize_email($params['email']);
    $full_name = sanitize_text_field($params['full_name']);
    $role = sanitize_text_field($params['role']);
    $password = $params['password'];

    if (empty($username) || empty($email) || empty($role) || empty($password)) {
        return new WP_Error('missing_params', 'Parameter tidak lengkap.', ['status' => 400]);
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $wpdb->insert(
        $table_name,
        [
            'username' => $username,
            'user_email' => $email,
            'full_name' => $full_name,
            'role' => $role,
            'password_hash' => $password_hash,
            'created_at' => current_time('mysql', 1),
        ],
        ['%s', '%s', '%s', '%s', '%s', '%s']
    );

    $new_user_id = $wpdb->insert_id;
    
    if ($new_user_id) {
         $new_user = $wpdb->get_row($wpdb->prepare("SELECT user_id, username, user_email, full_name, role, created_at FROM $table_name WHERE user_id = %d", $new_user_id));
        return new WP_REST_Response($new_user, 201);
    } else {
        return new WP_Error('create_failed', 'Gagal membuat user.', ['status' => 500]);
    }
}

function umh_get_user_by_id(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $user_id = (int) $request['id'];

    $user = $wpdb->get_row($wpdb->prepare("SELECT user_id, username, user_email, full_name, role, created_at FROM $table_name WHERE user_id = %d", $user_id));

    if (!$user) {
        return new WP_Error('not_found', 'User tidak ditemukan.', ['status' => 404]);
    }

    return new WP_REST_Response($user, 200);
}

function umh_update_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $user_id = (int) $request['id'];

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id));
    if (!$user) {
        return new WP_Error('not_found', 'User tidak ditemukan.', ['status' => 404]);
    }

    $params = $request->get_json_params();
    $update_data = [];
    $update_formats = [];

    if (isset($params['full_name'])) {
        $update_data['full_name'] = sanitize_text_field($params['full_name']);
        $update_formats[] = '%s';
    }
    if (isset($params['user_email'])) {
        $update_data['user_email'] = sanitize_email($params['user_email']);
        $update_formats[] = '%s';
    }
    if (isset($params['role'])) {
        $update_data['role'] = sanitize_text_field($params['role']);
        $update_formats[] = '%s';
    }
    if (isset($params['password']) && !empty($params['password'])) {
        $update_data['password_hash'] = password_hash($params['password'], PASSWORD_DEFAULT);
        $update_formats[] = '%s';
    }

    if (empty($update_data)) {
        return new WP_Error('no_data', 'Tidak ada data untuk diupdate.', ['status' => 400]);
    }

    $wpdb->update(
        $table_name,
        $update_data,
        ['user_id' => $user_id],
        $update_formats,
        ['%d']
    );

    $updated_user = $wpdb->get_row($wpdb->prepare("SELECT user_id, username, user_email, full_name, role, created_at FROM $table_name WHERE user_id = %d", $user_id));
    return new WP_REST_Response($updated_user, 200);
}

function umh_delete_user(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $user_id = (int) $request['id'];

    $result = $wpdb->delete($table_name, ['user_id' => $user_id], ['%d']);

    if ($result === false) {
        return new WP_Error('delete_failed', 'Gagal menghapus user.', ['status' => 500]);
    }
    if ($result === 0) {
        return new WP_Error('not_found', 'User tidak ditemukan untuk dihapus.', ['status' => 404]);
    }

    return new WP_REST_Response(['message' => 'User berhasil dihapus.'], 200);
}
?>