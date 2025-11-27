<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', 'umh_register_hr_routes');

function umh_register_hr_routes() {
    $namespace = 'umh/v1';

    // 1. Employees Routes
    new UMH_CRUD_Controller('hr/employees', 'umh_employees', [
        'name' => ['type' => 'string', 'required' => true],
        'position' => ['type' => 'string', 'required' => true],
        'salary' => ['type' => 'number', 'default' => 0],
        'status' => ['type' => 'string', 'default' => 'active']
    ], ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner']], ['name']);

    // 2. Loans Routes
    new UMH_CRUD_Controller('hr/loans', 'umh_loans', [
        'employee_id' => ['type' => 'integer', 'required' => true],
        'amount' => ['type' => 'number', 'required' => true],
        'status' => ['type' => 'string', 'default' => 'unpaid']
    ], ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner']], ['employee_id']);

    // 3. Attendance Routes (Standard CRUD + Bulk)
    $att_ctrl = new UMH_CRUD_Controller('hr/attendance', 'umh_attendance', [
        'employee_id' => ['type' => 'integer', 'required' => true],
        'date' => ['type' => 'string', 'format' => 'date', 'required' => true],
        'status' => ['type' => 'string', 'default' => 'present']
    ], ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner', 'hr_staff']], ['employee_id']);

    // Custom Route: Bulk Attendance
    register_rest_route($namespace, '/hr/attendance/bulk', [
        'methods' => 'POST',
        'callback' => 'umh_bulk_attendance_save',
        'permission_callback' => 'umh_check_api_permission'
    ]);
}

function umh_bulk_attendance_save($request) {
    global $wpdb;
    $table = $wpdb->prefix . 'umh_attendance';
    $params = $request->get_json_params();
    $items = $params['items'];
    $date = $params['date'];

    if (empty($items) || !is_array($items)) {
        return new WP_Error('invalid_data', 'Data absensi kosong', ['status' => 400]);
    }

    // Hapus data lama di tanggal tersebut (Reset harian) agar tidak duplikat
    $wpdb->delete($table, ['date' => $date], ['%s']);

    // Insert Bulk
    foreach ($items as $item) {
        $wpdb->insert($table, [
            'employee_id' => $item['employee_id'],
            'date' => $date,
            'status' => $item['status'],
            'created_at' => current_time('mysql')
        ]);
    }

    return new WP_REST_Response(['message' => 'Absensi berhasil disimpan', 'count' => count($items)], 200);
}