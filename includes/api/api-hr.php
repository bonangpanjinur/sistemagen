<?php
// File: includes/api/api-hr.php
// (File BARU dibuat berdasarkan pola)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_hr'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator'));
        if ($id) {
            handle_get_employee($id);
        } else {
            handle_get_all_employees();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_employee($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_employee($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_employee($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_employees() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name ORDER BY name ASC", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results, 'success' => true));
}

function handle_get_employee($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Karyawan tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result, 'success' => true));
}

function handle_create_employee($data) {
    global $wpdb, $table_name;
    
    if (empty($data['name']) || empty($data['position'])) {
        wp_send_json_error(array('message' => 'Nama dan Posisi tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'name' => sanitize_text_field($data['name']),
        'position' => sanitize_text_field($data['position']),
        'email' => sanitize_email($data['email']),
        'phone' => sanitize_text_field($data['phone']),
        'status' => in_array($data['status'], array('active', 'inactive')) ? $data['status'] : 'active',
    );
    $formats = array('%s', '%s', '%s', '%s', '%s');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan data karyawan.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_employee = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_employee, 'success' => true), 201);
    }
}

function handle_update_employee($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'name' => sanitize_text_field($data['name']),
        'position' => sanitize_text_field($data['position']),
        'email' => sanitize_email($data['email']),
        'phone' => sanitize_text_field($data['phone']),
        'status' => in_array($data['status'], array('active', 'inactive')) ? $data['status'] : 'active',
    );
    $formats = array('%s', '%s', '%s', '%s', '%s');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate data karyawan.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_employee = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_employee, 'success' => true));
    }
}

function handle_delete_employee($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus data karyawan.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Karyawan tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Karyawan berhasil dihapus.', 'success' => true));
    }
}