<?php
// File: includes/api/api-departures.php
// (File BARU dibuat berdasarkan pola, dengan JOIN)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_departures'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator', 'editor'));
        if ($id) {
            handle_get_departure($id);
        } else {
            handle_get_all_departures();
        }
        break;
    case 'POST':
        check_auth(array('administrator', 'editor'));
        handle_create_departure($data);
        break;
    case 'PUT':
        check_auth(array('administrator', 'editor'));
        handle_update_departure($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_departure($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_departures() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT d.*, p.package_name, f.flight_number 
        FROM $table_name d
        LEFT JOIN {$wpdb->prefix}travel_packages p ON d.package_id = p.id
        LEFT JOIN {$wpdb->prefix}travel_flights f ON d.flight_id = f.id
        ORDER BY d.departure_date DESC
    ", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results, 'success' => true));
}

function handle_get_departure($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT d.*, p.package_name, f.flight_number 
        FROM $table_name d
        LEFT JOIN {$wpdb->prefix}travel_packages p ON d.package_id = p.id
        LEFT JOIN {$wpdb->prefix}travel_flights f ON d.flight_id = f.id
        WHERE d.id = %d
    ", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Keberangkatan tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result, 'success' => true));
}

function handle_create_departure($data) {
    global $wpdb, $table_name;
    
    if (empty($data['departure_name']) || empty($data['package_id'])) {
        wp_send_json_error(array('message' => 'Nama dan Paket tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'departure_name' => sanitize_text_field($data['departure_name']),
        'package_id' => intval($data['package_id']),
        'flight_id' => !empty($data['flight_id']) ? intval($data['flight_id']) : null,
        'departure_date' => sanitize_text_field($data['departure_date']),
        'status' => in_array($data['status'], array('scheduled', 'departed', 'arrived', 'cancelled')) ? $data['status'] : 'scheduled',
    );
    $formats = array('%s', '%d', '%d', '%s', '%s');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan keberangkatan.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_departure = $wpdb->get_row($wpdb->prepare("
            SELECT d.*, p.package_name, f.flight_number 
            FROM $table_name d
            LEFT JOIN {$wpdb->prefix}travel_packages p ON d.package_id = p.id
            LEFT JOIN {$wpdb->prefix}travel_flights f ON d.flight_id = f.id
            WHERE d.id = %d
        ", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_departure, 'success' => true), 201);
    }
}

function handle_update_departure($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'departure_name' => sanitize_text_field($data['departure_name']),
        'package_id' => intval($data['package_id']),
        'flight_id' => !empty($data['flight_id']) ? intval($data['flight_id']) : null,
        'departure_date' => sanitize_text_field($data['departure_date']),
        'status' => in_array($data['status'], array('scheduled', 'departed', 'arrived', 'cancelled')) ? $data['status'] : 'scheduled',
    );
    $formats = array('%s', '%d', '%d', '%s', '%s');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate keberangkatan.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_departure = $wpdb->get_row($wpdb->prepare("
            SELECT d.*, p.package_name, f.flight_number 
            FROM $table_name d
            LEFT JOIN {$wpdb->prefix}travel_packages p ON d.package_id = p.id
            LEFT JOIN {$wpdb->prefix}travel_flights f ON d.flight_id = f.id
            WHERE d.id = %d
        ", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_departure, 'success' => true));
    }
}

function handle_delete_departure($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus keberangkatan.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Keberangkatan tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Keberangkatan berhasil dihapus.', 'success' => true));
    }
}