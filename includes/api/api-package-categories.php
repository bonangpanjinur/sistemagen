<?php
/**
 * API Handler untuk Kategori Paket
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_handle_package_categories_request() {
    // Pastikan user login
    if (!is_user_logged_in()) {
        wp_send_json_error(['message' => 'Unauthorized'], 401);
    }

    $method = $_SERVER['REQUEST_METHOD'];
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_package_categories';

    // === GET: Ambil Data Kategori ===
    if ($method === 'GET') {
        $categories = $wpdb->get_results("SELECT * FROM $table_name ORDER BY name ASC");
        wp_send_json_success($categories);
    }

    // === POST: Tambah/Edit Kategori ===
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Sanitasi Input
        $name = sanitize_text_field($input['name'] ?? '');
        $description = sanitize_textarea_field($input['description'] ?? '');
        $slug = sanitize_title($name);

        if (empty($name)) {
            wp_send_json_error(['message' => 'Nama kategori wajib diisi.'], 400);
        }

        $data = [
            'name' => $name,
            'slug' => $slug,
            'description' => $description
        ];

        // Jika ada ID, lakukan Update
        if (!empty($input['id'])) {
            $id = intval($input['id']);
            $updated = $wpdb->update($table_name, $data, ['id' => $id]);
            
            if ($updated === false) {
                wp_send_json_error(['message' => 'Gagal mengupdate kategori.'], 500);
            }
            wp_send_json_success(['message' => 'Kategori berhasil diperbarui.']);
        } 
        // Jika tidak ada ID, lakukan Insert
        else {
            $inserted = $wpdb->insert($table_name, $data);
            
            if ($inserted === false) {
                wp_send_json_error(['message' => 'Gagal menambahkan kategori.'], 500);
            }
            wp_send_json_success(['message' => 'Kategori berhasil ditambahkan.', 'id' => $wpdb->insert_id]);
        }
    }

    // === DELETE: Hapus Kategori ===
    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id <= 0) {
            wp_send_json_error(['message' => 'ID tidak valid.'], 400);
        }

        $deleted = $wpdb->delete($table_name, ['id' => $id]);

        if ($deleted === false) {
            wp_send_json_error(['message' => 'Gagal menghapus kategori.'], 500);
        }

        wp_send_json_success(['message' => 'Kategori berhasil dihapus.']);
    }
}