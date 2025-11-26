<?php
// File: includes/api/api-hr.php
// Menggunakan Controller Khusus untuk join tabel user.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// --- 1. Controller untuk PROFIL KARYAWAN (Endpoint: /hr/profiles) ---

class UMH_HR_Profiles_Controller extends UMH_CRUD_Controller {
    protected function get_base_query() {
        global $wpdb;
        // Join dengan tabel users untuk dapat nama & email
        return "SELECT p.*, u.full_name, u.email, u.phone 
                FROM {$this->table_name} p
                LEFT JOIN {$wpdb->prefix}umh_users u ON p.user_id = u.id";
    }

    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE p.id = %d", $id);
        return $wpdb->get_row($query);
    }
}

$profiles_schema = [
    'user_id'           => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'position'          => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'department'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'join_date'         => ['type' => 'string', 'format' => 'date', 'required' => true],
    'salary'            => ['type' => 'number', 'required' => true],
    'bank_account_info' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'status'            => ['type' => 'string', 'required' => false, 'enum' => ['active', 'on_leave', 'terminated']],
];

$hr_permissions = [
    'get_items'    => ['owner', 'hr_staff'],
    'get_item'     => ['owner', 'hr_staff'],
    'create_item'  => ['owner', 'hr_staff'],
    'update_item'  => ['owner', 'hr_staff'],
    'delete_item'  => ['owner'],
];

new UMH_HR_Profiles_Controller('hr/profiles', 'umh_employee_profiles', $profiles_schema, $hr_permissions, ['full_name', 'position', 'department']);


// --- 2. Controller untuk ABSENSI (Endpoint: /hr/attendance) ---

class UMH_HR_Attendance_Controller extends UMH_CRUD_Controller {
    protected function get_base_query() {
        global $wpdb;
        return "SELECT a.*, u.full_name 
                FROM {$this->table_name} a
                LEFT JOIN {$wpdb->prefix}umh_users u ON a.user_id = u.id";
    }
}

$attendance_schema = [
    'user_id'         => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'check_in'        => ['type' => 'string', 'format' => 'date-time', 'required' => false],
    'check_out'       => ['type' => 'string', 'format' => 'date-time', 'required' => false],
    'attendance_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'status'          => ['type' => 'string', 'required' => false, 'default' => 'present', 'enum' => ['present', 'absent', 'late', 'leave']],
    'notes'           => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
];

$attendance_permissions = [
    'get_items'    => ['owner', 'hr_staff', 'admin_staff'],
    'get_item'     => ['owner', 'hr_staff', 'admin_staff'],
    'create_item'  => ['owner', 'hr_staff'],
    'update_item'  => ['owner', 'hr_staff'],
    'delete_item'  => ['owner', 'hr_staff'],
];

new UMH_HR_Attendance_Controller('hr/attendance', 'umh_attendance', $attendance_schema, $attendance_permissions, ['full_name', 'status']);


// --- 3. Controller untuk GAJI (Endpoint: /hr/payrolls) ---

class UMH_HR_Payroll_Controller extends UMH_CRUD_Controller {
    protected function get_base_query() {
        global $wpdb;
        return "SELECT p.*, u.full_name 
                FROM {$this->table_name} p
                LEFT JOIN {$wpdb->prefix}umh_users u ON p.user_id = u.id";
    }
}

$payroll_schema = [
    'user_id'          => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
    'pay_period_start' => ['type' => 'string', 'format' => 'date', 'required' => true],
    'pay_period_end'   => ['type' => 'string', 'format' => 'date', 'required' => true],
    'base_salary'      => ['type' => 'number', 'required' => true],
    'bonus'            => ['type' => 'number', 'required' => false],
    'deductions'       => ['type' => 'number', 'required' => false],
    'net_pay'          => ['type' => 'number', 'required' => true],
    'pay_date'         => ['type' => 'string', 'format' => 'date', 'required' => false],
    'status'           => ['type' => 'string', 'required' => false, 'default' => 'pending', 'enum' => ['pending', 'paid', 'failed']],
];

$payroll_permissions = [
    'get_items'    => ['owner', 'finance_staff', 'hr_staff'],
    'get_item'     => ['owner', 'finance_staff', 'hr_staff'],
    'create_item'  => ['owner', 'finance_staff', 'hr_staff'],
    'update_item'  => ['owner', 'finance_staff', 'hr_staff'],
    'delete_item'  => ['owner', 'finance_staff'],
];

new UMH_HR_Payroll_Controller('hr/payrolls', 'umh_payrolls', $payroll_schema, $payroll_permissions, ['full_name', 'status']);