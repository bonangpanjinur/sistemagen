<?php
/**
 * API Endpoint: Manajemen Paket & Itinerary
 * Menangani CRUD Paket + Detail Itinerary + Fasilitas
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Packages {

    public function register_routes() {
        // GET List (Ringkas)
        register_rest_route('umh/v1', '/packages', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // GET Single Detail (Lengkap dengan Itinerary)
        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_item_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Create
        register_rest_route('umh/v1', '/packages', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // PUT Update
        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // DELETE
        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET List: Hanya data utama untuk tabel
     */
    public function get_items($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $items = $wpdb->get_results("SELECT id, name, type, duration_days, status, created_at FROM $table ORDER BY created_at DESC");
        return rest_ensure_response($items);
    }

    /**
     * GET Detail: Data Paket + Itinerary Lengkap
     */
    public function get_item_detail($request) {
        global $wpdb;
        $pkg_id = $request->get_param('id');
        $table_pkg = $wpdb->prefix . 'umh_packages';
        $table_itin = $wpdb->prefix . 'umh_package_itineraries';

        $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_pkg WHERE id = %d", $pkg_id));
        
        if (!$package) {
            return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);
        }

        // Decode JSON fields
        $package->included_facilities = json_decode($package->included_facilities);
        $package->excluded_facilities = json_decode($package->excluded_facilities);

        // Ambil Itinerary
        $itineraries = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_itin WHERE package_id = %d ORDER BY day_number ASC", $pkg_id));
        $package->itinerary = $itineraries;

        return rest_ensure_response($package);
    }

    /**
     * POST: Buat Paket Baru
     */
    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // Validasi
        if (empty($params['name']) || empty($params['duration_days'])) {
            return new WP_Error('missing_data', 'Nama Paket dan Durasi wajib diisi', ['status' => 400]);
        }

        $wpdb->query('START TRANSACTION');

        try {
            $table_pkg = $wpdb->prefix . 'umh_packages';
            
            // 1. Insert Header Paket
            $data_pkg = [
                'name' => sanitize_text_field($params['name']),
                'slug' => sanitize_title($params['name']),
                'type' => sanitize_text_field($params['type']),
                'duration_days' => intval($params['duration_days']),
                'description' => wp_kses_post($params['description']),
                'included_facilities' => json_encode($params['included_facilities'] ?? []),
                'excluded_facilities' => json_encode($params['excluded_facilities'] ?? []),
                'status' => 'active'
            ];

            if ($wpdb->insert($table_pkg, $data_pkg) === false) {
                throw new Exception('Gagal menyimpan data paket');
            }
            $pkg_id = $wpdb->insert_id;

            // 2. Insert Itinerary (Jika ada)
            if (!empty($params['itinerary']) && is_array($params['itinerary'])) {
                $table_itin = $wpdb->prefix . 'umh_package_itineraries';
                foreach ($params['itinerary'] as $day) {
                    $data_itin = [
                        'package_id' => $pkg_id,
                        'day_number' => intval($day['day_number']),
                        'title' => sanitize_text_field($day['title']),
                        'description' => sanitize_textarea_field($day['description']),
                        'meal_plan' => sanitize_text_field($day['meal_plan'] ?? '')
                    ];
                    $wpdb->insert($table_itin, $data_itin);
                }
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'id' => $pkg_id, 'message' => 'Paket berhasil dibuat']);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', $e->getMessage(), ['status' => 500]);
        }
    }

    /**
     * PUT: Update Paket
     */
    public function update_item($request) {
        global $wpdb;
        $pkg_id = $request->get_param('id');
        $params = $request->get_json_params();

        $wpdb->query('START TRANSACTION');

        try {
            $table_pkg = $wpdb->prefix . 'umh_packages';
            $table_itin = $wpdb->prefix . 'umh_package_itineraries';

            // 1. Update Header
            $data_pkg = [
                'name' => sanitize_text_field($params['name']),
                'type' => sanitize_text_field($params['type']),
                'duration_days' => intval($params['duration_days']),
                'description' => wp_kses_post($params['description']),
                'included_facilities' => json_encode($params['included_facilities'] ?? []),
                'excluded_facilities' => json_encode($params['excluded_facilities'] ?? []),
                'status' => sanitize_text_field($params['status'])
            ];
            $wpdb->update($table_pkg, $data_pkg, ['id' => $pkg_id]);

            // 2. Update Itinerary (Hapus Lama, Insert Baru - Cara Paling Aman)
            $wpdb->delete($table_itin, ['package_id' => $pkg_id]);

            if (!empty($params['itinerary']) && is_array($params['itinerary'])) {
                foreach ($params['itinerary'] as $day) {
                    $data_itin = [
                        'package_id' => $pkg_id,
                        'day_number' => intval($day['day_number']),
                        'title' => sanitize_text_field($day['title']),
                        'description' => sanitize_textarea_field($day['description']),
                        'meal_plan' => sanitize_text_field($day['meal_plan'] ?? '')
                    ];
                    $wpdb->insert($table_itin, $data_itin);
                }
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'message' => 'Paket berhasil diupdate']);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('db_error', $e->getMessage(), ['status' => 500]);
        }
    }

    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $table = $wpdb->prefix . 'umh_packages';
        
        // Itinerary otomatis terhapus jika pakai Foreign Key ON DELETE CASCADE
        // Tapi untuk aman, kita hapus manual dulu jika engine MyISAM
        $wpdb->delete($wpdb->prefix . 'umh_package_itineraries', ['package_id' => $id]);
        $wpdb->delete($table, ['id' => $id]);
        
        return rest_ensure_response(['success' => true, 'message' => 'Paket dihapus']);
    }
}