<?php
/**
 * API Endpoint: Manajemen Dokumen & Manifest
 * Fitur: Bulk Update Status Visa/Paspor, Export Manifest
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Documents {

    public function register_routes() {
        // GET Manifest Data
        register_rest_route('umh/v1', '/documents/manifest/(?P<departure_id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_manifest'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // POST Bulk Update
        register_rest_route('umh/v1', '/documents/bulk-update', array(
            'methods' => 'POST',
            'callback' => array($this, 'bulk_update_status'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return current_user_can('manage_options');
    }

    /**
     * GET: Ambil Data Manifest Lengkap
     */
    public function get_manifest($request) {
        global $wpdb;
        $dep_id = $request->get_param('departure_id');

        $query = "
            SELECT 
                bp.id, bp.booking_id, bp.visa_status, bp.passport_status, bp.visa_number,
                j.full_name, j.full_name_ar, j.passport_number, j.nik, j.gender, j.birth_date, j.city,
                b.booking_code
            FROM {$wpdb->prefix}umh_booking_passengers bp
            JOIN {$wpdb->prefix}umh_bookings b ON bp.booking_id = b.id
            JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id
            WHERE b.departure_id = %d AND bp.status = 'active'
            ORDER BY j.full_name ASC
        ";

        $results = $wpdb->get_results($wpdb->prepare($query, $dep_id));
        return rest_ensure_response($results);
    }

    /**
     * POST: Update Massal (Bulk Action)
     */
    public function bulk_update_status($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_booking_passengers';

        $ids = $params['ids']; // Array of passenger IDs
        $field = sanitize_text_field($params['field']); // 'visa_status' or 'passport_status'
        $value = sanitize_text_field($params['value']); // 'issued', 'received', etc.

        if (empty($ids) || !is_array($ids)) {
            return new WP_Error('invalid_data', 'Tidak ada data yang dipilih', ['status' => 400]);
        }

        // Validasi field agar aman
        $allowed_fields = ['visa_status', 'passport_status', 'vaccine_status'];
        if (!in_array($field, $allowed_fields)) {
            return new WP_Error('invalid_field', 'Field tidak valid', ['status' => 400]);
        }

        $ids_placeholder = implode(',', array_fill(0, count($ids), '%d'));
        $sql = "UPDATE $table SET $field = %s WHERE id IN ($ids_placeholder)";
        
        $query_args = array_merge([$value], $ids);
        $result = $wpdb->query($wpdb->prepare($sql, $query_args));

        if ($result !== false) {
            return rest_ensure_response(['success' => true, 'updated_count' => count($ids), 'message' => 'Status berhasil diperbarui']);
        }

        return new WP_Error('db_error', 'Gagal update database', ['status' => 500]);
    }
}