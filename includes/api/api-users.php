<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Users_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'username'   => ['type' => 'string', 'required' => true],
            'email'      => ['type' => 'string', 'required' => true],
            'full_name'  => ['type' => 'string', 'required' => true],
            'role'       => ['type' => 'string', 'required' => true], // referensi ke table roles
            'password'   => ['type' => 'string'], // hanya required saat create
        ];
        parent::__construct('users', 'umh_users', $schema, ['get_items' => ['administrator'], 'create_item' => ['administrator']]);
    }

    // Override Create untuk buat WP User juga
    public function create_item($request) {
        $params = $request->get_json_params();
        
        // 1. Cek apakah email sudah ada di WP
        $existing_user = get_user_by('email', $params['email']);
        if ($existing_user) {
            return new WP_Error('user_exists', 'Email sudah terdaftar di sistem WordPress.', ['status' => 400]);
        }

        // 2. Buat WP User Baru
        $user_id = wp_create_user($params['username'], $params['password'], $params['email']);
        if (is_wp_error($user_id)) {
            return $user_id;
        }

        // 3. Update User Meta (Nama Lengkap)
        wp_update_user([
            'ID' => $user_id, 
            'display_name' => $params['full_name'],
            'first_name' => $params['full_name']
        ]);

        // 4. Simpan ke tabel umh_users (Custom Table)
        // Kita tidak simpan password di sini, pakai punya WP
        global $wpdb;
        $wpdb->insert($this->table_name, [
            'wp_user_id' => $user_id,
            'full_name' => $params['full_name'],
            'email' => $params['email'],
            'role' => $params['role'],
            'status' => 'active',
            'created_at' => current_time('mysql')
        ]);

        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }
}
new UMH_Users_API();
?>