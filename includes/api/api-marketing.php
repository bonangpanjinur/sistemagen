<?php
// File: includes/api/api-marketing.php
// (File BARU dibuat berdasarkan pola)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_marketing'; // Asumsi nama tabel

switch ($method) {
    case 'GET':
        check_auth(array('administrator'));
        if ($id) {
            handle_get_campaign($id);
        } else {
            handle_get_all_campaigns();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_campaign($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_campaign($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_campaign($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_campaigns() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name ORDER BY start_date DESC", array());
    $results = $wpdb->get_results($query, ARRAY_A);
    wp_send_json_success(array('data' => $results, 'success' => true));
}

function handle_get_campaign($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Kampanye tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result, 'success' => true));
}

function handle_create_campaign($data) {
    global $wpdb, $table_name;
    
    if (empty($data['campaign_name'])) {
        wp_send_json_error(array('message' => 'Nama kampanye tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'campaign_name' => sanitize_text_field($data['campaign_name']),
        'type' => sanitize_text_field($data['type']),
        'status' => in_array($data['status'], array('draft', 'running', 'completed')) ? $data['status'] : 'draft',
        'start_date' => sanitize_text_field($data['start_date']),
        'end_date' => sanitize_text_field($data['end_date']),
        'budget' => floatval($data['budget']),
    );
    $formats = array('%s', '%s', '%s', '%s', '%s', '%f');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan kampanye.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_campaign = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_campaign, 'success' => true), 201);
    }
}

function handle_update_campaign($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'campaign_name' => sanitize_text_field($data['campaign_name']),
        'type' => sanitize_text_field($data['type']),
        'status' => in_array($data['status'], array('draft', 'running', 'completed')) ? $data['status'] : 'draft',
        'start_date' => sanitize_text_field($data['start_date']),
        'end_date' => sanitize_text_field($data['end_date']),
        'budget' => floatval($data['budget']),
    );
    $formats = array('%s', '%s', '%s', '%s', '%s', '%f');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate kampanye.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_campaign = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_campaign, 'success' => true));
    }
}

function handle_delete_campaign($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus kampanye.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Kampanye tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Kampanye berhasil dihapus.', 'success' => true));
    }
}