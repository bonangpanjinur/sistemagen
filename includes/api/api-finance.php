<?php
// File: includes/api/api-finance.php
// (Versi final, perbaikan dari sebelumnya)

global $wpdb, $method, $id, $data;
$table_name = $wpdb->prefix . 'travel_finance'; 

switch ($method) {
    case 'GET':
        check_auth(array('administrator'));
        if ($id) {
            handle_get_transaction($id);
        } else {
            handle_get_all_transactions();
        }
        break;
    case 'POST':
        check_auth(array('administrator'));
        handle_create_transaction($data);
        break;
    case 'PUT':
        check_auth(array('administrator'));
        handle_update_transaction($id, $data);
        break;
    case 'DELETE':
        check_auth(array('administrator'));
        handle_delete_transaction($id);
        break;
    default:
        wp_send_json_error(array('message' => 'Metode request tidak valid.'), 405);
        break;
}

function handle_get_all_transactions() {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT t.*, j.name as jamaah_name
        FROM $table_name t
        LEFT JOIN {$wpdb->prefix}travel_jamaah j ON t.jamaah_id = j.id
        ORDER BY t.transaction_date DESC
    ", array());
    $results = $wpdb->get_results($query, ARRAY_A);

    // --- PERBAIKAN DITAMBAHKAN ---
    // Cek jika query gagal (misal: tabel tidak ada)
    if ($results === null) {
        wp_send_json_error(array('message' => 'Gagal mengambil data: ' . $wpdb->last_error), 500);
        return;
    }
    // --- AKHIR PERBAIKAN ---

    wp_send_json_success(array('data' => $results, 'success' => true));
}

function handle_get_transaction($id) {
    global $wpdb, $table_name;
    $query = $wpdb->prepare("
        SELECT t.*, j.name as jamaah_name
        FROM $table_name t
        LEFT JOIN {$wpdb->prefix}travel_jamaah j ON t.jamaah_id = j.id
        WHERE t.id = %d
    ", $id);
    $result = $wpdb->get_row($query, ARRAY_A);
    if (!$result) {
        wp_send_json_error(array('message' => 'Transaksi tidak ditemukan.'), 404);
        return;
    }
    wp_send_json_success(array('data' => $result, 'success' => true));
}

function handle_create_transaction($data) {
    global $wpdb, $table_name;
    
    if (empty($data['description']) || !isset($data['amount'])) {
        wp_send_json_error(array('message' => 'Deskripsi dan Jumlah tidak boleh kosong.'), 400);
        return;
    }
    $insert_data = array(
        'description' => sanitize_text_field($data['description']),
        'amount' => floatval($data['amount']),
        'type' => in_array($data['type'], array('income', 'expense')) ? $data['type'] : 'expense',
        'transaction_date' => sanitize_text_field($data['transaction_date']),
        'jamaah_id' => !empty($data['jamaah_id']) ? intval($data['jamaah_id']) : null, 
    );
    $formats = array('%s', '%f', '%s', '%s', '%d');
    $result = $wpdb->insert($table_name, $insert_data, $formats);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menyimpan transaksi.', 'db_error' => $wpdb->last_error));
    } else {
        $new_id = $wpdb->insert_id;
        $new_trx = $wpdb->get_row($wpdb->prepare("
            SELECT t.*, j.name as jamaah_name
            FROM $table_name t
            LEFT JOIN {$wpdb->prefix}travel_jamaah j ON t.jamaah_id = j.id
            WHERE t.id = %d
        ", $new_id), ARRAY_A);
        wp_send_json_success(array('data' => $new_trx, 'success' => true), 201);
    }
}

function handle_update_transaction($id, $data) {
    global $wpdb, $table_name;
    $update_data = array(
        'description' => sanitize_text_field($data['description']),
        'amount' => floatval($data['amount']),
        'type' => in_array($data['type'], array('income', 'expense')) ? $data['type'] : 'expense',
        'transaction_date' => sanitize_text_field($data['transaction_date']),
        'jamaah_id' => !empty($data['jamaah_id']) ? intval($data['jamaah_id']) : null, 
    );
    $formats = array('%s', '%f', '%s', '%s', '%d');
    $where = array('id' => $id);
    $where_format = array('%d');
    $result = $wpdb->update($table_name, $update_data, $where, $formats, $where_format);

    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal mengupdate transaksi.', 'db_error' => $wpdb->last_error));
    } else {
        $updated_trx = $wpdb->get_row($wpdb->prepare("
            SELECT t.*, j.name as jamaah_name
            FROM $table_name t
            LEFT JOIN {$wpdb->prefix}travel_jamaah j ON t.jamaah_id = j.id
            WHERE t.id = %d
        ", $id), ARRAY_A);
        wp_send_json_success(array('data' => $updated_trx, 'success' => true));
    }
}

function handle_delete_transaction($id) {
    global $wpdb, $table_name;
    $result = $wpdb->delete($table_name, array('id' => $id), array('%d'));
    if ($result === false) {
        wp_send_json_error(array('message' => 'Gagal menghapus transaksi.', 'db_error' => $wpdb->last_error));
    } elseif ($result === 0) {
        wp_send_json_error(array('message' => 'Transaksi tidak ditemukan.'), 404);
    } else {
        wp_send_json_success(array('message' => 'Transaksi berhasil dihapus.', 'success' => true));
    }
}