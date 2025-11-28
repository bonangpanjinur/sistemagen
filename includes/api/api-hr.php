<?php
/**
 * API Endpoint: Modul HR Lengkap (Employees, Attendance, Loans, Payroll)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_HR {

    public function register_routes() {
        // --- 1. KARYAWAN & KANTOR (Existing) ---
        register_rest_route('umh/v1', '/hr/employees', array(
            'methods' => 'GET', 'callback' => array($this, 'get_employees'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/employees', array(
            'methods' => 'POST', 'callback' => array($this, 'save_employee'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/offices', array(
            'methods' => 'GET', 'callback' => array($this, 'get_offices'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/offices', array(
            'methods' => 'POST', 'callback' => array($this, 'save_office'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // --- 2. ABSENSI (Existing) ---
        register_rest_route('umh/v1', '/hr/attendance', array(
            'methods' => 'GET', 'callback' => array($this, 'get_attendance_log'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/attendance/submit', array(
            'methods' => 'POST', 'callback' => array($this, 'submit_attendance'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // --- 3. KASBON / PINJAMAN (NEW) ---
        register_rest_route('umh/v1', '/hr/loans', array(
            'methods' => 'GET', 'callback' => array($this, 'get_loans'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/loans', array(
            'methods' => 'POST', 'callback' => array($this, 'save_loan'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // --- 4. PAYROLL / PENGGAJIAN (NEW) ---
        register_rest_route('umh/v1', '/hr/payroll', array(
            'methods' => 'GET', 'callback' => array($this, 'get_payrolls'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        register_rest_route('umh/v1', '/hr/payroll/generate', array(
            'methods' => 'POST', 'callback' => array($this, 'generate_payroll'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
        // Update status payroll (Bayar)
        register_rest_route('umh/v1', '/hr/payroll/pay', array(
            'methods' => 'POST', 'callback' => array($this, 'pay_payroll'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function permissions_check() {
        return is_user_logged_in();
    }

    // =========================================================================
    // BAGIAN 1 & 2: KARYAWAN & ABSENSI (Sama seperti sebelumnya)
    // =========================================================================
    
    public function get_employees($request) {
        global $wpdb;
        $query = "SELECT e.*, u.display_name, u.user_email FROM {$wpdb->prefix}umh_hr_employees e JOIN {$wpdb->users} u ON e.user_id = u.ID ORDER BY u.display_name ASC";
        return rest_ensure_response($wpdb->get_results($query));
    }

    public function save_employee($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_hr_employees';
        $data = [
            'user_id' => intval($params['user_id']),
            'position' => sanitize_text_field($params['position']),
            'basic_salary' => floatval($params['basic_salary']),
            'allowance_transport' => floatval($params['allowance_transport']),
            'allowance_meal' => floatval($params['allowance_meal']),
            'status' => 'active'
        ];
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table WHERE user_id = %d", $data['user_id']));
        if ($exists) $wpdb->update($table, $data, ['id' => $exists]);
        else $wpdb->insert($table, $data);
        return rest_ensure_response(['success' => true]);
    }

    public function get_offices() {
        global $wpdb;
        return rest_ensure_response($wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_hr_office_locations"));
    }

    public function save_office($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_hr_office_locations';
        $data = [
            'name' => sanitize_text_field($params['name']),
            'latitude' => floatval($params['latitude']),
            'longitude' => floatval($params['longitude']),
            'radius_meter' => intval($params['radius_meter'] ?? 50),
            'qr_token' => $params['qr_token'] ?: wp_generate_password(20, false)
        ];
        if (!empty($params['id'])) $wpdb->update($table, $data, ['id' => intval($params['id'])]);
        else $wpdb->insert($table, $data);
        return rest_ensure_response(['success' => true]);
    }

    public function get_attendance_log($request) {
        global $wpdb;
        $date = $request->get_param('date') ?: date('Y-m-d');
        $query = "SELECT a.*, u.display_name FROM {$wpdb->prefix}umh_hr_attendance a JOIN {$wpdb->users} u ON a.user_id = u.ID WHERE a.date = %s ORDER BY a.check_in_time DESC";
        return rest_ensure_response($wpdb->get_results($wpdb->prepare($query, $date)));
    }

    public function submit_attendance($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = get_current_user_id();
        $today = date('Y-m-d');
        $table = $wpdb->prefix . 'umh_hr_attendance';

        // Validasi Lokasi (Simplified for brevity, use full Haversine in production if needed)
        $type = $params['type']; 
        $office_id = null;
        $notes = $type === 'office_qr' ? "Absen di Kantor" : "Absen Remote";

        if ($type === 'office_qr') {
            $qr_token = sanitize_text_field($params['qr_token']);
            $office = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_hr_office_locations WHERE qr_token = %s", $qr_token));
            if (!$office) return new WP_Error('invalid_qr', 'QR Code tidak valid!', ['status' => 400]);
            $office_id = $office->id;
        }

        $existing = $wpdb->get_row($wpdb->prepare("SELECT id FROM $table WHERE user_id = %d AND date = %s", $user_id, $today));

        if (!$existing) {
            $wpdb->insert($table, [
                'user_id' => $user_id,
                'date' => $today,
                'check_in_time' => current_time('mysql'),
                'check_in_location' => "{$params['latitude']},{$params['longitude']}",
                'type' => $type,
                'office_id' => $office_id,
                'status' => 'present',
                'notes' => $notes
            ]);
            return rest_ensure_response(['success' => true, 'message' => 'Berhasil Check-In!']);
        } else {
            $wpdb->update($table, [
                'check_out_time' => current_time('mysql'),
                'check_out_location' => "{$params['latitude']},{$params['longitude']}"
            ], ['id' => $existing->id]);
            return rest_ensure_response(['success' => true, 'message' => 'Berhasil Check-Out!']);
        }
    }

    // =========================================================================
    // BAGIAN 3: KASBON (LOANS)
    // =========================================================================

    public function get_loans($request) {
        global $wpdb;
        $query = "
            SELECT l.*, u.display_name 
            FROM {$wpdb->prefix}umh_hr_loans l
            JOIN {$wpdb->prefix}umh_hr_employees e ON l.employee_id = e.id
            JOIN {$wpdb->users} u ON e.user_id = u.ID
            ORDER BY l.created_at DESC
        ";
        return rest_ensure_response($wpdb->get_results($query));
    }

    public function save_loan($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $table = $wpdb->prefix . 'umh_hr_loans';

        // Admin yang login bisa mengajukan untuk staff lain atau approve
        // Untuk sederhananya, kita asumsikan admin input pinjaman langsung approve/pending
        
        $data = [
            'employee_id' => intval($params['employee_id']),
            'amount' => floatval($params['amount']),
            'reason' => sanitize_textarea_field($params['reason']),
            'application_date' => current_time('Y-m-d'),
            'repayment_months' => intval($params['repayment_months'] ?? 1),
            'remaining_amount' => floatval($params['amount']), // Awalnya sisa = jumlah pinjam
            'status' => sanitize_text_field($params['status'] ?? 'pending'),
            'approved_by' => ($params['status'] == 'approved') ? get_current_user_id() : null
        ];

        if (!empty($params['id'])) {
            $wpdb->update($table, $data, ['id' => intval($params['id'])]);
        } else {
            $wpdb->insert($table, $data);
        }

        return rest_ensure_response(['success' => true, 'message' => 'Data Kasbon Disimpan']);
    }

    // =========================================================================
    // BAGIAN 4: PAYROLL (PENGGAJIAN OTOMATIS)
    // =========================================================================

    public function get_payrolls($request) {
        global $wpdb;
        $period = $request->get_param('period'); // Format: YYYY-MM
        
        $where = "";
        if ($period) {
            $where = $wpdb->prepare("WHERE p.period_month = %s", $period);
        }

        $query = "
            SELECT p.*, u.display_name, e.position 
            FROM {$wpdb->prefix}umh_hr_payroll p
            JOIN {$wpdb->prefix}umh_hr_employees e ON p.employee_id = e.id
            JOIN {$wpdb->users} u ON e.user_id = u.ID
            $where
            ORDER BY p.id DESC
        ";
        return rest_ensure_response($wpdb->get_results($query));
    }

    /**
     * GENERATE GAJI BULANAN (CORE FEATURE)
     * Rumus: Gaji Bersih = (Gaji Pokok + Tunjangan) - (Potongan Kasbon)
     */
    public function generate_payroll($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $period = sanitize_text_field($params['period']); // e.g. "2023-11"

        if (!$period) return new WP_Error('missing_period', 'Periode wajib diisi', ['status' => 400]);

        $wpdb->query('START TRANSACTION');

        try {
            // 1. Ambil Semua Karyawan Aktif
            $employees = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_hr_employees WHERE status = 'active'");
            $count = 0;

            foreach ($employees as $emp) {
                // Cek apakah sudah digenerate bulan ini?
                $exist = $wpdb->get_var($wpdb->prepare(
                    "SELECT id FROM {$wpdb->prefix}umh_hr_payroll WHERE employee_id = %d AND period_month = %s",
                    $emp->id, $period
                ));

                if ($exist) continue; // Skip jika sudah ada

                // 2. Hitung Komponen
                $basic = $emp->basic_salary;
                $allowances = $emp->allowance_transport + $emp->allowance_meal;
                
                // 3. Cek Kasbon Aktif (Approved & Belum Lunas)
                // Logika: Ambil kasbon tertua, potong sesuai cicilan
                $loan_deduction = 0;
                $active_loan = $wpdb->get_row($wpdb->prepare(
                    "SELECT id, amount, repayment_months, remaining_amount 
                     FROM {$wpdb->prefix}umh_hr_loans 
                     WHERE employee_id = %d AND status = 'approved' AND remaining_amount > 0 
                     ORDER BY application_date ASC LIMIT 1",
                    $emp->id
                ));

                if ($active_loan) {
                    // Hitung cicilan per bulan
                    $monthly_installment = $active_loan->amount / $active_loan->repayment_months;
                    // Jangan potong lebih dari sisa hutang
                    $loan_deduction = min($monthly_installment, $active_loan->remaining_amount);
                }

                $gross = $basic + $allowances;
                $net = $gross - $loan_deduction;

                // 4. Insert ke Payroll Draft
                $wpdb->insert($wpdb->prefix . 'umh_hr_payroll', [
                    'employee_id' => $emp->id,
                    'period_month' => $period,
                    'basic_salary' => $basic,
                    'total_allowance' => $allowances,
                    'total_deductions' => $loan_deduction,
                    'net_salary' => $net,
                    'status' => 'draft', // Draft dulu, admin review baru bayar
                    'notes' => $loan_deduction > 0 ? "Potongan Kasbon: " . number_format($loan_deduction) : ""
                ]);

                $count++;
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'message' => "Berhasil generate gaji untuk $count karyawan."]);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('error', $e->getMessage());
        }
    }

    /**
     * BAYAR GAJI (Finalisasi)
     * - Ubah status payroll jadi 'paid'
     * - Kurangi saldo hutang karyawan di tabel loans
     */
    public function pay_payroll($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $payroll_id = intval($params['id']);

        $payroll = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_hr_payroll WHERE id = %d", $payroll_id));
        if (!$payroll || $payroll->status === 'paid') return new WP_Error('invalid', 'Data tidak valid atau sudah dibayar');

        $wpdb->query('START TRANSACTION');

        try {
            // 1. Update Payroll Status
            $wpdb->update(
                $wpdb->prefix . 'umh_hr_payroll', 
                ['status' => 'paid', 'payment_date' => current_time('mysql')], 
                ['id' => $payroll_id]
            );

            // 2. Potong Hutang (Jika ada deduction)
            if ($payroll->total_deductions > 0) {
                // Cari loan aktif
                $loan = $wpdb->get_row($wpdb->prepare(
                    "SELECT id, remaining_amount FROM {$wpdb->prefix}umh_hr_loans 
                     WHERE employee_id = %d AND status = 'approved' AND remaining_amount > 0 
                     ORDER BY application_date ASC LIMIT 1",
                    $payroll->employee_id
                ));

                if ($loan) {
                    $new_remaining = $loan->remaining_amount - $payroll->total_deductions;
                    $loan_status = ($new_remaining <= 0) ? 'paid_off' : 'approved';
                    
                    $wpdb->update(
                        $wpdb->prefix . 'umh_hr_loans',
                        ['remaining_amount' => $new_remaining, 'status' => $loan_status],
                        ['id' => $loan->id]
                    );
                }
            }

            $wpdb->query('COMMIT');
            return rest_ensure_response(['success' => true, 'message' => 'Gaji telah dibayarkan & Kasbon dipotong.']);

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            return new WP_Error('error', $e->getMessage());
        }
    }
}