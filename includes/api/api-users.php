<?php
if (!defined('ABSPATH')) {
    exit; 
}

add_action('rest_api_init', 'umh_register_users_routes');

function umh_register_users_routes() {
    $namespace = 'umh/v1';
    $base = 'users';

    $users_schema = [
        'email'       => ['type' => 'string', 'required' => true, 'format' => 'email', 'sanitize_callback' => 'sanitize_email'],
        'full_name'   => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'role'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'phone'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
        'status'      => ['type' => 'string', 'default' => 'active', 'sanitize_callback' => 'sanitize_text_field'],
        'password'    => ['type' => 'string', 'required' => false], 
    ];

    // Permission matrix
    $users_permissions = [
        'get_items'    => ['owner', 'admin_staff', 'hr_staff'],
        'get_item'     => ['owner', 'admin_staff', 'hr_staff'],
        'create_item'  => ['owner', 'admin_staff'],
        'update_item'  => ['owner', 'admin_staff'],
        'delete_item'  => ['owner'],
    ];

    $searchable_fields = ['full_name', 'email', 'phone'];

    // Hooks untuk hashing password otomatis
    add_filter("umh_crud_{$base}_before_create", 'umh_hash_password_on_create', 10, 2);
    add_filter("umh_crud_{$base}_before_update", 'umh_hash_password_on_update', 10, 2);

    new UMH_CRUD_Controller(
        $base,               
        'umh_users',         
        $users_schema,       
        $users_permissions,  
        $searchable_fields   
    );
    
    // Custom Auth Routes
    register_rest_route($namespace, '/auth/login', [
        'methods' => 'POST',
        'callback' => 'umh_auth_login',
        'permission_callback' => '__return_true', 
    ]);

    register_rest_route($namespace, '/auth/wp-login', [
        'methods' => 'POST',
        'callback' => 'umh_auth_wp_admin_login',
        'permission_callback' => 'is_user_logged_in', 
    ]);

    register_rest_route($namespace, '/' . $base . '/me', [
        'methods' => 'GET',
        'callback' => 'umh_get_current_user_by_token',
        'permission_callback' => 'umh_check_api_permission', // Perbaikan: String function name, bukan eksekusi
    ]);
}

function umh_hash_password_on_create($data, $request) {
    if (isset($data['password']) && !empty($data['password'])) {
        $data['password_hash'] = wp_hash_password($data['password']);
    }
    unset($data['password']); // Jangan simpan password plain text
    return $data;
}

function umh_hash_password_on_update($data, $request) {
    if (isset($data['password']) && !empty($data['password'])) {
        $data['password_hash'] = wp_hash_password($data['password']);
    }
    unset($data['password']);
    return $data;
}

function umh_auth_login(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    
    $params = $request->get_json_params();
    $email = sanitize_email($params['email']);
    $password = $params['password'];

    if (empty($email) || empty($password)) {
        return new WP_Error('credentials_required', 'Email dan password dibutuhkan.', ['status' => 400]);
    }

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE email = %s", $email));

    if (!$user) {
        return new WP_Error('invalid_email', 'Email tidak ditemukan.', ['status' => 403]);
    }
    
    // Perbaikan: Cek jika password hash kosong
    if (!isset($user->password_hash) || empty($user->password_hash)) {
         return new WP_Error('user_misconfigured', 'Akun ini belum memiliki password yang diset. Hubungi Admin.', ['status' => 500]);
    }

    if (!wp_check_password($password, $user->password_hash, $user->id)) {
        return new WP_Error('invalid_password', 'Password salah.', ['status' => 403]);
    }

    if ($user->status !== 'active') {
        return new WP_Error('user_inactive', 'Akun Anda tidak aktif.', ['status' => 403]);
    }

    $token_data = umh_generate_auth_token($user->id, $user->role);

    return new WP_REST_Response([
        'user' => [
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->full_name,
            'role' => $user->role,
        ],
        'token' => $token_data['token'],
        'expires' => $token_data['expires'],
    ], 200);
}

function umh_auth_wp_admin_login(WP_REST_Request $request) {
    if (!current_user_can('manage_options')) {
        return new WP_Error('not_admin', 'Hanya administrator yang bisa menggunakan endpoint ini.', ['status' => 403]);
    }

    if (!function_exists('umh_get_current_user_data_for_react')) {
        return new WP_Error('missing_dependency', 'Fungsi umh_get_current_user_data_for_react hilang.', ['status' => 500]);
    }

    $user_data_for_react = umh_get_current_user_data_for_react(); 

    if (empty($user_data_for_react['token'])) {
         return new WP_Error('admin_sync_failed', 'Gagal sinkronisasi data admin.', ['status' => 500]);
    }

    return new WP_REST_Response([
        'user' => [
            'id' => $user_data_for_react['id'], 
            'email' => $user_data_for_react['email'],
            'full_name' => $user_data_for_react['name'],
            'role' => $user_data_for_react['role'],
        ],
        'token' => $user_data_for_react['token'],
        'expires' => (new DateTime('+1 hour'))->format('Y-m-d H:i:s'),
    ], 200);
}

function umh_get_current_user_by_token(WP_REST_Request $request) {
    // Fungsi ini diasumsikan ada di utils.php atau class-umh-api-loader.php
    $context = umh_get_current_user_context($request);

    if (is_wp_error($context)) {
        return $context; 
    }

    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';
    $user = $wpdb->get_row($wpdb->prepare(
        "SELECT id, email, full_name, role, phone, status FROM $table_name WHERE id = %d",
        $context['user_id']
    ), ARRAY_A);

    if (!$user) {
        return new WP_Error('user_not_found', 'Data user tidak ditemukan.', ['status' => 404]);
    }

    return new WP_REST_Response($user, 200);
}

function umh_generate_auth_token($user_id, $role) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_users';

    try {
        $token = bin2hex(random_bytes(32));
    } catch (Exception $e) {
        $token = md5(uniqid(rand(), true));
    }
    
    $expires = new DateTime('+7 days');
    $expires_sql = $expires->format('Y-m-d H:i:s');

    $wpdb->update(
        $table_name,
        ['auth_token' => $token, 'token_expires' => $expires_sql],
        ['id' => $user_id]
    );

    return [
        'token' => $token,
        'expires' => $expires_sql,
    ];
}