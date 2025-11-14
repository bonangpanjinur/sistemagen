<?php
// File: includes/api/api-flights.php
// (File BARU dibuat berdasarkan pola)

global $wpdb;
$table_name = $wpdb->prefix . 'travel_flights'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator', 'editor'));
        if ($id) {
            handle_get_flight($id);
        } else {
            handle_get_all_flights();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_flight($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_flight($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_flight($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_flights() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name ORDER BY airline_name ASC", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results));
}

function handle_get_flight($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Penerbangan tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result));
}

function handle_create_flight($data) {
    global $wpdb, $table_name;
    
    if (empty($data['airline_name']) || empty($data['flight_number'])) {
        wp_send_json_error(array('message' => 'Maskapai dan No. Penerbangan tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'airline_name' => sanitize_text_field($data['airline_name']),
        'flight_number' => sanitize_text_field($data['flight_number']),
        'departure_airport' => sanitize_text_field($data['departure_airport']),
        'arrival_airport' => sanitize_text_field($data['arrival_airport']),
    );
    $formats = array('%s', '%s', '%s', '%s');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan penerbangan.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_flight = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_flight), 201);
    }
}

function handle_update_flight($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'airline_name' => sanitize_text_field($data['airline_name']),
        'flight_number' => sanitize_text_field($data['flight_number']),
        'departure_airport' => sanitize_text_field($data['departure_airport']),
        'arrival_airport' => sanitize_text_field($data['arrival_airport']),
    );
    $formats = array('%s', '%s', '%s', '%s');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate penerbangan.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_flight = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_flight));
    }
}

function handle_delete_flight($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus penerbangan.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Penerbangan tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Penerbangan berhasil dihapus.'));
    }
}