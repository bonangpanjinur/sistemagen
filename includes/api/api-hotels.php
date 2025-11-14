<?php
// File: includes/api/api-hotels.php
// (File BARU dibuat berdasarkan pola)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_hotels'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator', 'editor'));
        if ($id) {
            handle_get_hotel($id);
        } else {
            handle_get_all_hotels();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_hotel($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_hotel($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_hotel($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_hotels() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name ORDER BY hotel_name ASC", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results, 'success' => true));
}

function handle_get_hotel($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Hotel tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result, 'success' => true));
}

function handle_create_hotel($data) {
    global $wpdb, $table_name;
    
    if (empty($data['hotel_name'])) {
        wp_send_json_error(array('message' => 'Nama hotel tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'hotel_name' => sanitize_text_field($data['hotel_name']),
        'address' => sanitize_text_field($data['address']),
        'stars' => intval($data['stars']),
    );
    $formats = array('%s', '%s', '%d');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan hotel.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_hotel = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_hotel, 'success' => true), 201);
    }
}

function handle_update_hotel($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'hotel_name' => sanitize_text_field($data['hotel_name']),
        'address' => sanitize_text_field($data['address']),
        'stars' => intval($data['stars']),
    );
    $formats = array('%s', '%s', '%d');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate hotel.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_hotel = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_hotel, 'success' => true));
    }
}

function handle_delete_hotel($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus hotel.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Hotel tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Hotel berhasil dihapus.', 'success' => true));
    }
}