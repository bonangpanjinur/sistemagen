<?php
/**
 * API Endpoint: Master Data (Lokasi & Maskapai)
 * Mendukung Schema V3 Enterprise
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Masters {

    public function register_routes() {
        $types = ['locations', 'airlines'];

        foreach ($types as $type) {
            // GET List
            register_rest_route('umh/v1', "/masters/$type", array(
                'methods' => 'GET',
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array('type' => $type) // Pass type context
            ));

            // POST Create
            register_rest_route('umh/v1', "/masters/$type", array(
                'methods' => 'POST',
                'callback' => array($this, 'create_item'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array('type' => $type)
            ));

            // PUT Update
            register_rest_route('umh/v1', "/masters/$type/(?P<id>\d+)", array(
                'methods' => 'PUT', // or POST with method override
                'callback' => array($this, 'update_item'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array('type' => $type)
            ));

            // DELETE
            register_rest_route('umh/v1', "/masters/$type/(?P<id>\d+)", array(
                'methods' => 'DELETE',
                'callback' => array($this, 'delete_item'),
                'permission_callback' => array($this, 'permissions_check'),
                'args' => array('type' => $type)
            ));
        }
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    private function get_table_name($type) {
        global $wpdb;
        if ($type === 'locations') return $wpdb->prefix . 'umh_master_locations';
        if ($type === 'airlines') return $wpdb->prefix . 'umh_master_airlines';
        return null;
    }

    /**
     * GET Items
     */
    public function get_items($request) {
        global $wpdb;
        $route = $request->get_route();
        $type = strpos($route, 'locations') !== false ? 'locations' : 'airlines';
        
        $table = $this->get_table_name($type);
        $items = $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
        
        return rest_ensure_response($items);
    }

    /**
     * CREATE Item
     */
    public function create_item($request) {
        global $wpdb;
        $route = $request->get_route();
        $type = strpos($route, 'locations') !== false ? 'locations' : 'airlines';
        $table = $this->get_table_name($type);
        
        $params = $request->get_json_params();
        $data = [];

        if ($type === 'locations') {
            if (empty($params['name'])) return new WP_Error('missing_name', 'Nama lokasi wajib diisi', ['status' => 400]);
            $data = [
                'name' => sanitize_text_field($params['name']),
                'code' => strtoupper(sanitize_text_field($params['code'])),
                'type' => sanitize_text_field($params['type']), // airport/city
                'country' => sanitize_text_field($params['country'] ?? 'Saudi Arabia')
            ];
        } else {
            if (empty($params['name'])) return new WP_Error('missing_name', 'Nama maskapai wajib diisi', ['status' => 400]);
            $data = [
                'name' => sanitize_text_field($params['name']),
                'code' => strtoupper(sanitize_text_field($params['code'])),
                'logo_url' => esc_url_raw($params['logo_url'] ?? '')
            ];
        }

        $wpdb->insert($table, $data);
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Data berhasil disimpan']);
    }

    /**
     * UPDATE Item
     */
    public function update_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $route = $request->get_route();
        $type = strpos($route, 'locations') !== false ? 'locations' : 'airlines';
        $table = $this->get_table_name($type);
        
        $params = $request->get_json_params();
        $data = [];

        if ($type === 'locations') {
            $data = [
                'name' => sanitize_text_field($params['name']),
                'code' => strtoupper(sanitize_text_field($params['code'])),
                'type' => sanitize_text_field($params['type']),
                'country' => sanitize_text_field($params['country'])
            ];
        } else {
            $data = [
                'name' => sanitize_text_field($params['name']),
                'code' => strtoupper(sanitize_text_field($params['code'])),
                'logo_url' => esc_url_raw($params['logo_url'])
            ];
        }

        $wpdb->update($table, $data, ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Data berhasil diupdate']);
    }

    /**
     * DELETE Item
     */
    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $route = $request->get_route();
        $type = strpos($route, 'locations') !== false ? 'locations' : 'airlines';
        $table = $this->get_table_name($type);

        $wpdb->delete($table, ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Data berhasil dihapus']);
    }
}