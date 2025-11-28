<?php
if (!defined('ABSPATH')) { exit; }

// Hapus wrapper hook 'rest_api_init' yang menyebabkan masalah
// Langsung jalankan logika inisialisasi kelas atau fungsi

class UMH_HR_API {
    public function __construct() {
        // Kita bisa gunakan hook di dalam constructor jika perlu custom route,
        // tapi untuk UMH_CRUD_Controller, cukup instansiasi langsung karena dia sudah handle hook di constructor-nya.
        $this->init_employees();
        $this->init_loans();
        $this->init_attendance();
        
        // Custom route untuk Bulk Attendance
        add_action('rest_api_init', [$this, 'register_custom_routes']);
    }

    private function init_employees() {
        // PERBAIKAN: Tambahkan 'phone' dan 'user_id' ke schema
        $schema = [
            'name'     => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'position' => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'phone'    => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
            'salary'   => ['type' => 'number', 'default' => 0],
            'user_id'  => ['type' => 'integer', 'required' => false], // Relasi ke user login
            'status'   => ['type' => 'string', 'default' => 'active']
        ];

        new UMH_CRUD_Controller('hr/employees', 'umh_employees', $schema, 
            ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner', 'hr_staff']], 
            ['name', 'position']
        );
    }

    private function init_loans() {
        $schema = [
            'employee_id' => ['type' => 'integer', 'required' => true],
            'amount'      => ['type' => 'number', 'required' => true],
            'date'        => ['type' => 'string', 'format' => 'date', 'required' => true],
            'description' => ['type' => 'string', 'required' => false],
            'status'      => ['type' => 'string', 'default' => 'unpaid']
        ];
        new UMH_CRUD_Controller('hr/loans', 'umh_loans', $schema, 
            ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner']], 
            ['employee_id']
        );
    }

    private function init_attendance() {
        $schema = [
            'employee_id' => ['type' => 'integer', 'required' => true],
            'date'        => ['type' => 'string', 'format' => 'date', 'required' => true],
            'status'      => ['type' => 'string', 'default' => 'present'],
            'notes'       => ['type' => 'string', 'required' => false]
        ];
        new UMH_CRUD_Controller('hr/attendance', 'umh_attendance', $schema, 
            ['get_items' => ['owner', 'hr_staff'], 'create_item' => ['owner', 'hr_staff']], 
            ['employee_id']
        );
    }

    public function register_custom_routes() {
        register_rest_route('umh/v1', '/hr/attendance/bulk', [
            'methods' => 'POST',
            'callback' => [$this, 'bulk_attendance_save'],
            'permission_callback' => function() { return current_user_can('edit_posts'); } // Sesuaikan permission
        ]);
    }

    public function bulk_attendance_save($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_attendance';
        $params = $request->get_json_params();
        $items = $params['items'] ?? [];
        $date = $params['date'] ?? current_time('Y-m-d');

        if (empty($items) || !is_array($items)) {
            return new WP_Error('invalid_data', 'Data absensi kosong.', ['status' => 400]);
        }

        // Hapus data lama di tanggal yang sama untuk update
        $wpdb->delete($table, ['date' => $date], ['%s']);

        $count = 0;
        foreach ($items as $item) {
            $wpdb->insert($table, [
                'employee_id' => $item['employee_id'],
                'date' => $date,
                'status' => $item['status'],
                'created_at' => current_time('mysql')
            ]);
            $count++;
        }

        return new WP_REST_Response(['message' => 'Absensi berhasil disimpan', 'count' => $count], 200);
    }
}

// Jalankan class
new UMH_HR_API();