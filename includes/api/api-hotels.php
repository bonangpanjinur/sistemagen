<?php
/**
 * API Endpoint: Master Data Hotel
 * Schema V3: umh_master_hotels
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Hotels {

    public function register_routes() {
        // GET List Hotel
        register_rest_route('umh/v1', '/hotels', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_items'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Create Hotel
        register_rest_route('umh/v1', '/hotels', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // PUT Update Hotel
        register_rest_route('umh/v1', '/hotels/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // DELETE Hotel
        register_rest_route('umh/v1', '/hotels/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_item'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: Ambil semua data hotel
     */
    public function get_items($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_hotels';
        
        // Filter opsional by City
        $city = $request->get_param('city');
        $query = "SELECT * FROM $table";
        
        if (!empty($city)) {
            $query .= $wpdb->prepare(" WHERE city = %s", $city);
        }
        
        $query .= " ORDER BY city ASC, name ASC";
        
        $items = $wpdb->get_results($query);
        return rest_ensure_response($items);
    }

    /**
     * POST: Tambah Hotel Baru
     */
    public function create_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_hotels';
        $params = $request->get_json_params();

        if (empty($params['name']) || empty($params['city'])) {
            return new WP_Error('missing_data', 'Nama Hotel dan Kota wajib diisi', ['status' => 400]);
        }

        $data = [
            'name' => sanitize_text_field($params['name']),
            'city' => sanitize_text_field($params['city']),
            'star_rating' => intval($params['star_rating'] ?? 5),
            'distance_to_haram' => intval($params['distance_to_haram'] ?? 0),
            'map_url' => esc_url_raw($params['map_url'] ?? '')
        ];

        $format = ['%s', '%s', '%d', '%d', '%s'];
        
        if ($wpdb->insert($table, $data, $format)) {
            return rest_ensure_response([
                'success' => true, 
                'id' => $wpdb->insert_id, 
                'message' => 'Hotel berhasil ditambahkan'
            ]);
        }

        return new WP_Error('db_error', 'Gagal menyimpan data', ['status' => 500]);
    }

    /**
     * PUT: Update Hotel
     */
    public function update_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_hotels';
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        $data = [
            'name' => sanitize_text_field($params['name']),
            'city' => sanitize_text_field($params['city']),
            'star_rating' => intval($params['star_rating']),
            'distance_to_haram' => intval($params['distance_to_haram']),
            'map_url' => esc_url_raw($params['map_url'])
        ];
        
        $where = ['id' => $id];

        if ($wpdb->update($table, $data, $where) !== false) {
            return rest_ensure_response(['success' => true, 'message' => 'Hotel berhasil diupdate']);
        }

        return new WP_Error('db_error', 'Gagal update data', ['status' => 500]);
    }

    /**
     * DELETE: Hapus Hotel
     */
    public function delete_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_hotels';
        $id = $request->get_param('id');

        $wpdb->delete($table, ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Hotel berhasil dihapus']);
    }
}