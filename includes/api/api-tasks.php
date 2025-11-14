<?php
// File: includes/api/api-tasks.php
// (File BARU dibuat berdasarkan pola, dengan JOIN ke User)

global $wpdb;
$table_name = $wpdb->prefix . 'travel_tasks'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator', 'editor'));
        if ($id) {
            handle_get_task($id);
        } else {
            handle_get_all_tasks();
        }
        break;
    case 'POST':
        check_auth(array('administrator', 'editor'));
        handle_create_task($data);
        break;
    case 'PUT':
        check_auth(array('administrator', 'editor'));
        handle_update_task($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_task($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_tasks() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT t.*, u.display_name as assigned_to_name
        FROM $table_name t
        LEFT JOIN {$wpdb->prefix}users u ON t.assigned_to_user_id = u.ID
        ORDER BY t.status ASC, t.id DESC
    ", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results));
}

function handle_get_task($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT t.*, u.display_name as assigned_to_name
        FROM $table_name t
        LEFT JOIN {$wpdb->prefix}users u ON t.assigned_to_user_id = u.ID
        WHERE t.id = %d
    ", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Tugas tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result));
}

function handle_create_task($data) {
    global $wpdb, $table_name;
    
    if (empty($data['task_name'])) {
        wp_send_json_error(array('message' => 'Nama tugas tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'task_name' => sanitize_text_field($data['task_name']),
        'description' => sanitize_textarea_field($data['description']),
        'status' => in_array($data['status'], array('pending', 'in_progress', 'completed')) ? $data['status'] : 'pending',
        'assigned_to_user_id' => !empty($data['assigned_to_user_id']) ? intval($data['assigned_to_user_id']) : null,
        'created_by_user_id' => get_current_user_id(), // Catat siapa yang membuat
    );
    $formats = array('%s', '%s', '%s', '%d', '%d');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan tugas.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_task = $wpdb->get_row($wpdb->prepare("
            SELECT t.*, u.display_name as assigned_to_name
            FROM $table_name t
            LEFT JOIN {$wpdb->prefix}users u ON t.assigned_to_user_id = u.ID
            WHERE t.id = %d
        ", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_task), 201);
    }
}

function handle_update_task($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'task_name' => sanitize_text_field($data['task_name']),
        'description' => sanitize_textarea_field($data['description']),
        'status' => in_array($data['status'], array('pending', 'in_progress', 'completed')) ? $data['status'] : 'pending',
        'assigned_to_user_id' => !empty($data['assigned_to_user_id']) ? intval($data['assigned_to_user_id']) : null,
    );
    $formats = array('%s', '%s', '%s', '%d');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate tugas.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_task = $wpdb->get_row($wpdb->prepare("
            SELECT t.*, u.display_name as assigned_to_name
            FROM $table_name t
            LEFT JOIN {$wpdb->prefix}users u ON t.assigned_to_user_id = u.ID
            WHERE t.id = %d
        ", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_task));
    }
}

function handle_delete_task($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus tugas.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Tugas tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Tugas berhasil dihapus.'));
    }
}