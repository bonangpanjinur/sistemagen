<?php
// File: includes/api/api-packages.php
// (Versi final, perbaikan dari sebelumnya)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_packages'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        // GET bisa diakses oleh role yang lebih banyak
        check_auth(array('administrator', 'editor'));
        if ($id) {
            handle_get_package($id);
        } else {
            handle_get_all_packages();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_package($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_package($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_package($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}


function handle_get_all_packages() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name ORDER BY departure_date DESC", array());
    $packages = $wpdb->get_results($query, ARRAY_A); 
    if ($packages === null) {
        wp_send_json_error(array('message' => 'Gagal mengambil data paket: ' . $wpdb->last_error));
        return;
    }
    wp_send_json_success(array('data' => $packages, 'success' => true));
}

function handle_get_package($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id);
    $package = $wpdb->get_row($query, ARRAY_A);
    if (!$package) {
        wp_send_json_error(array('message' => 'Paket tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $package, 'success' => true));
}

function handle_create_package($data) {
    global $wpdb, $table_name;
    if (empty($data['package_name']) || !isset($data['price'])) {
        wp_send_json_error(array('message' => 'Nama paket dan harga tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'package_name' => sanitize_text_field($data['package_name']),
        'description' => sanitize_textarea_field($data['description']),
        'price' => floatval($data['price']),
        'departure_date' => sanitize_text_field($data['departure_date']),
        'duration' => intval($data['duration']),
        'destination' => sanitize_text_field($data['destination']),
    );
    $formats = array('%s', '%s', '%f', '%s', '%d', '%s');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menambahkan paket.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_package, 'success' => true), 201);
    }
}

function handle_update_package($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'package_name' => sanitize_text_field($data['package_name']),
        'description' => sanitize_textarea_field($data['description']),
        'price' => floatval($data['price']),
        'departure_date' => sanitize_text_field($data['departure_date']),
        'duration' => intval($data['duration']),
        'destination' => sanitize_text_field($data['destination']),
    );
    $formats = array('%s', '%s', '%f', '%s', '%d', '%s');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate paket.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_package, 'success' => true));
    }
}

function handle_delete_package($id) {
    global $wpdb, $table_name;
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->delete($table_name, $where, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus paket.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Paket tidak ditemukan untuk dihapus.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Paket berhasil dihapus.', 'success' => true));
    }
}