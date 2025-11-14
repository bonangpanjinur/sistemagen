<?php
// File: includes/api/api-categories.php
// Mengelola CRUD untuk umroh_categories

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mendapatkan semua Kategori dalam format hierarkis
 * Endpoint: GET /umroh/v1/categories
 */
function umroh_api_get_categories(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_categories';

    $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY parent_id ASC, name ASC", ARRAY_A);

    $categories = [];
    foreach ($results as $item) {
        if ($item['parent_id'] == 0) {
            $categories[$item['id']] = $item;
            $categories[$item['id']]['children'] = [];
        } else {
            // Asumsi parent_id selalu dimuat sebelum children, karena di-order
            if (isset($categories[$item['parent_id']])) {
                $categories[$item['parent_id']]['children'][] = $item;
            } else {
                // Jika parent belum dimuat (kasus error data), masukkan sebagai top level untuk mencegah loop
                $categories[$item['id']] = $item;
                $categories[$item['id']]['children'] = [];
            }
        }
    }

    // Mengubah array asosiatif menjadi array list (hanya top level)
    return wp_send_json_success(array_values($categories));
}

/**
 * Membuat Kategori Baru
 * Endpoint: POST /umroh/v1/categories
 */
function umroh_api_create_category(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_categories';
    
    $name = sanitize_text_field($request['name']);
    $parent_id = absint($request['parent_id']);

    if (empty($name)) {
        return wp_send_json_error('Nama kategori tidak boleh kosong.', 400);
    }

    $data = [
        'name' => $name,
        'parent_id' => $parent_id
    ];
    $format = ['%s', '%d'];

    $result = $wpdb->insert($table_name, $data, $format);

    if ($result === false) {
        return wp_send_json_error('Gagal menyimpan kategori ke database.', 500);
    }

    return wp_send_json_success(['message' => 'Kategori berhasil dibuat.', 'id' => $wpdb->insert_id]);
}

/**
 * Menghapus Kategori
 * Endpoint: DELETE /umroh/v1/categories/(id)
 */
function umroh_api_delete_category(WP_REST_Request $request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umroh_categories';
    $category_id = absint($request['id']);
    
    if (empty($category_id)) {
        return wp_send_json_error('ID kategori tidak valid.', 400);
    }

    // 1. Cek Keterkaitan (Relational Protection)
    $table_packages = $wpdb->prefix . 'umroh_packages';
    $is_used = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_packages WHERE category_id = %d", $category_id));

    if ($is_used > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Kategori ini digunakan oleh ' . $is_used . ' paket.', 409);
    }
    
    // 2. Cek apakah kategori ini memiliki sub-kategori (anak)
    $has_children = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE parent_id = %d", $category_id));

    if ($has_children > 0) {
        return wp_send_json_error('Tidak dapat menghapus. Kategori ini memiliki ' . $has_children . ' sub-kategori.', 409);
    }

    // 3. Hapus Data
    $result = $wpdb->delete($table_name, ['id' => $category_id], ['%d']);

    if ($result === false) {
        return wp_send_json_error('Gagal menghapus kategori dari database.', 500);
    }

    return wp_send_json_success(['message' => 'Kategori berhasil dihapus.']);
}