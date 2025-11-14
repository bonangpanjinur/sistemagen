<?php
// File: includes/utils.php
// Fungsi utilitas inti dan penanganan keamanan.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * [PENINGKATAN RBAC]
 * Fungsi ini sekarang adalah "function factory".
 * Anda memanggilnya dengan daftar peran yang diizinkan,
 * dan ia akan MENGEMBALIKAN fungsi callback permission.
 *
 * @param array $required_roles Peran yang diizinkan (e.g., ['owner', 'admin_staff', 'finance_staff'])
 * @return callable Fungsi callback untuk 'permission_callback'
 */
function umh_check_api_permission(array $required_roles = []) {
    /**
     * @param WP_REST_Request $request
     * @return bool|WP_Error
     */
    return function(WP_REST_Request $request) use ($required_roles) {
        $context = umh_get_current_user_context($request);

        if (is_wp_error($context)) {
            return $context; // Kembalikan error (misal: token invalid, expired, dll)
        }

        // Jika endpoint tidak memerlukan peran khusus, cukup cek apakah user terautentikasi
        if (empty($required_roles)) {
            return true; // Autentikasi berhasil
        }

        // Cek apakah peran pengguna ada di dalam daftar $required_roles
        if (isset($context['role']) && !empty($context['role'])) {
            // Super Admin selalu memiliki akses
            if ($context['role'] === 'super_admin') {
                return true;
            }

            // Cek peran lain
            if (in_array($context['role'], $required_roles, true)) {
                return true;
            }
        }

        // Jika gagal
        return new WP_Error(
            'rest_forbidden_context',
            __('Anda tidak memiliki izin untuk mengakses sumber daya ini.', 'umh'),
            ['status' => 403, 'required_roles' => $required_roles, 'user_role' => $context['role'] ?? 'none']
        );
    };
}


/**
 * Mendapatkan konteks pengguna saat ini, baik dari Sesi WP atau Bearer Token.
 *
 * @param WP_REST_Request $request
 * @return array|WP_Error
 */
function umh_get_current_user_context(WP_REST_Request $request) {
    global $wpdb;

    // 1. Cek Sesi Super Admin (via Nonce)
    if (check_admin_referer('wp_rest', '_wpnonce') && umh_is_super_admin(wp_get_current_user())) {
        $user = wp_get_current_user();
        return [
            'id_type' => 'wp_user_id',
            'user_id' => $user->ID,
            'role'    => 'super_admin', // Role khusus untuk Super Admin
            'email'   => $user->user_email,
        ];
    }

    // 2. Cek Bearer Token (Headless)
    $auth_header = $request->get_header('Authorization');
    if (!empty($auth_header)) {
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
            $table_name = $wpdb->prefix . 'umh_users';
            
            $user = $wpdb->get_row($wpdb->prepare(
                "SELECT id, role, email, token_expires FROM $table_name WHERE auth_token = %s",
                $token
            ), ARRAY_A);

            if ($user) {
                // Cek jika token expired
                if (strtotime($user['token_expires']) < time()) {
                    return new WP_Error('rest_token_expired', __('Token Anda telah kedaluwarsa, silakan login kembali.', 'umh'), ['status' => 401]);
                }

                // Token valid
                return [
                    'id_type' => 'umh_user_id',
                    'user_id' => (int) $user['id'],
                    'role'    => $user['role'],
                    'email'   => $user['email'],
                ];
            } else {
                return new WP_Error('rest_invalid_token', __('Token tidak valid.', 'umh'), ['status' => 401]);
            }
        }
    }
    
    // 3. Jika tidak ada Nonce (dari WP Admin) atau Token (dari Headless)
    return new WP_Error('rest_not_authenticated', __('Anda harus terautentikasi.', 'umh'), ['status' => 401]);
}


/**
 * Helper untuk mengecek apakah user adalah Super Admin.
 *
 * @param WP_User $user
 * @return bool
 */
function umh_is_super_admin(WP_User $user) {
    return $user && $user->ID > 0 && ($user->has_cap('manage_options') || is_super_admin($user->ID));
}

/**
 * Helper untuk mendapatkan IP Klien.
 */
if (!function_exists('umh_get_client_ip')) {
    function umh_get_client_ip() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }
}