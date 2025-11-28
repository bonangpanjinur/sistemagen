<?php
// Pastikan tidak diakses langsung
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Users {
    
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        // Mendaftarkan route: /wp-json/umroh-manager/v1/users/me
        register_rest_route('umroh-manager/v1', '/users/me', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_current_user'),
            'permission_callback' => function () {
                return is_user_logged_in();
            }
        ));
    }

    public function get_current_user($request) {
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return new WP_Error('no_user', 'User not found', array('status' => 404));
        }

        $user = get_userdata($user_id);
        
        // Siapkan data user untuk dikirim ke React
        $data = array(
            'id'           => $user->ID,
            'name'         => $user->display_name,
            'email'        => $user->user_email,
            'username'     => $user->user_login,
            'roles'        => $user->roles,
            'avatar_url'   => get_avatar_url($user->ID),
            'capabilities' => $user->allcaps
        );

        return rest_ensure_response(array(
            'success' => true,
            'data'    => $data
        ));
    }
}

// Inisialisasi class agar route terdaftar
new UMH_API_Users();