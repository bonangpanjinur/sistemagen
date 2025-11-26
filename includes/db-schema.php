<?php
// File: includes/db-schema.php
// Skema Database Lengkap untuk Plugin Travel Umrah/Haji (Umroh Manager Hybrid)
// Version: 1.7 (Added Roles Table)

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

global $umh_db_version;
$umh_db_version = '1.7'; // Versi dinaikkan agar tabel baru dibuat

function umh_create_db_tables() {
    global $wpdb;
    global $umh_db_version;

    $installed_ver = get_option('umh_db_version');

    if ($installed_ver == $umh_db_version) {
        return; // Skema sudah terbaru
    }

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // ==========================================
    // 1. SYSTEM & USERS
    // ==========================================

    // 1.1 Tabel Pengguna Internal (Staff/Admin)
    $table_name = $wpdb->prefix . 'umh_users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) NOT NULL,
        auth_token VARCHAR(255),
        token_expires DATETIME,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 1.2 [BARU] Tabel Roles (Peran & Hak Akses) - YANG HILANG SEBELUMNYA
    $table_name = $wpdb->prefix . 'umh_roles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        role_key VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'marketing_staff'
        role_name VARCHAR(100) NOT NULL,      -- e.g. 'Marketing Staff'
        capabilities TEXT,                    -- JSON array of permissions
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 1.3 Tabel Log Aktivitas (Audit Trail)
    $table_name = $wpdb->prefix . 'umh_logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20),
        action VARCHAR(50) NOT NULL,
        object_type VARCHAR(50),
        object_id BIGINT(20),
        details TEXT,
        ip_address VARCHAR(100),
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 1.4 Tabel Uploads (File Manager)
    $table_name = $wpdb->prefix . 'umh_uploads';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20),
        file_url VARCHAR(255) NOT NULL,
        file_type VARCHAR(100),
        upload_type VARCHAR(50),
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 2. MASTER DATA (AGEN & PRODUK)
    // ==========================================

    // 2.1 Tabel Sub Agen
    $table_name = $wpdb->prefix . 'umh_agents';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        agent_code VARCHAR(50) NOT NULL UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        ktp_number VARCHAR(50),
        address TEXT,
        phone VARCHAR(20),
        join_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        bank_account VARCHAR(100),
        commission_rate DECIMAL(5, 2) DEFAULT 0,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2.2 Tabel Kategori Paket
    $table_name = $wpdb->prefix . 'umh_package_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        parent_id BIGINT(20) DEFAULT 0,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2.3 Tabel Paket Umroh
    $table_name = $wpdb->prefix . 'umh_packages';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        category_id BIGINT(20) DEFAULT 0,
        package_name VARCHAR(255) NOT NULL,
        description TEXT,
        departure_date DATE NOT NULL,
        return_date DATE,
        duration INT(3) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        slots_available INT(4),
        slots_filled INT(4) DEFAULT 0,
        hotel_makkah VARCHAR(255),
        hotel_madinah VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2.4 Tabel Variasi Harga Paket
    $table_name = $wpdb->prefix . 'umh_package_prices';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'IDR',
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 3. TRANSAKSI & JAMAAH
    // ==========================================

    // 3.1 Tabel Jamaah
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        registration_code VARCHAR(50),
        booking_code VARCHAR(50),
        package_id BIGINT(20) NOT NULL,
        agent_id BIGINT(20),
        user_id BIGINT(20),
        full_name VARCHAR(255) NOT NULL,
        father_name VARCHAR(255),
        id_number VARCHAR(50),
        passport_number VARCHAR(50),
        passport_issued_at VARCHAR(100),
        passport_issue_date DATE,
        passport_expiry_date DATE,
        phone VARCHAR(20),
        phone_alt VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        city VARCHAR(100),
        gender VARCHAR(10), 
        birth_place VARCHAR(100),
        birth_date DATE,
        marital_status VARCHAR(20),
        clothing_size VARCHAR(10),
        room_type VARCHAR(20) DEFAULT 'Quad',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        total_price DECIMAL(15, 2),
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        passport_scan VARCHAR(255),
        ktp_scan VARCHAR(255),
        photo_path VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY agent_id (agent_id),
        KEY registration_code (registration_code),
        KEY booking_code (booking_code)
    ) $charset_collate;";
    dbDelta($sql);

    // 3.2 Tabel Logistik
    $table_name = $wpdb->prefix . 'umh_logistics';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        passport_status VARCHAR(50) DEFAULT 'Belum',
        meningitis_status VARCHAR(20) DEFAULT 'Belum',
        biometrics_status VARCHAR(20) DEFAULT 'Belum',
        suitcase_status VARCHAR(20) DEFAULT 'Belum',
        suitcase_taken_date DATE,
        taken_by VARCHAR(255),
        delivery_method VARCHAR(50),
        delivery_address TEXT,
        notes TEXT,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 3.3 Jadwal Keberangkatan (Departures) - PASTIKAN ADA
    $table_name = $wpdb->prefix . 'umh_departures';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20),
        departure_date DATE NOT NULL,
        return_date DATE NOT NULL,
        total_seats INT(4) NOT NULL,
        available_seats INT(4) NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 4. KEUANGAN (FINANCE)
    // ==========================================

    // 4.1 Tabel Transaksi Keuangan
    $table_name = $wpdb->prefix . 'umh_finance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        transaction_no VARCHAR(50),
        jamaah_id BIGINT(20),
        user_id BIGINT(20),
        category_id BIGINT(20),
        transaction_type VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50),
        description VARCHAR(255),
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'IDR',
        transaction_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY transaction_type (transaction_type)
    ) $charset_collate;";
    dbDelta($sql);

    // 4.2 Tabel Pembayaran Jamaah (Payments) - PENTING
    $table_name = $wpdb->prefix . 'umh_payments';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_by BIGINT(20),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 4.3 Tabel Kategori Keuangan
    $table_name = $wpdb->prefix . 'umh_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 5. OPERASIONAL KANTOR (HR & TASKS)
    // ==========================================

    // 5.1 Tabel Tugas / To-Do
    $table_name = $wpdb->prefix . 'umh_tasks';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        assigned_to_user_id BIGINT(20),
        created_by_user_id BIGINT(20),
        jamaah_id BIGINT(20),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 5.2 Tabel Profil Karyawan
    $table_name = $wpdb->prefix . 'umh_employee_profiles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        position VARCHAR(100),
        department VARCHAR(100),
        join_date DATE,
        salary DECIMAL(15, 2),
        bank_account_info TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5.3 Tabel Absensi
    $table_name = $wpdb->prefix . 'umh_attendance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        check_in DATETIME,
        check_out DATETIME,
        attendance_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'present',
        notes TEXT,
        PRIMARY KEY (id),
        UNIQUE KEY user_date (user_id, attendance_date)
    ) $charset_collate;";
    dbDelta($sql);

    // 5.4 Tabel Kasbon Karyawan
    $table_name = $wpdb->prefix . 'umh_employee_loans';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        loan_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'outstanding',
        due_date DATE,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5.5 Tabel Payroll (Gaji)
    $table_name = $wpdb->prefix . 'umh_payrolls';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        pay_period_start DATE,
        pay_period_end DATE,
        base_salary DECIMAL(15, 2),
        bonus DECIMAL(15, 2) DEFAULT 0,
        deductions DECIMAL(15, 2) DEFAULT 0,
        net_pay DECIMAL(15, 2),
        payment_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 6. INVENTORY & VENDORS (HOTEL & FLIGHT)
    // ==========================================

    // 6.1 Tabel Master Hotel
    $table_name = $wpdb->prefix . 'umh_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        city VARCHAR(100),
        country VARCHAR(100),
        rating INT(1),
        address TEXT,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6.2 Tabel Booking Hotel
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        hotel_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        room_type VARCHAR(50),
        booking_code VARCHAR(50),
        status VARCHAR(20) DEFAULT 'confirmed',
        cost DECIMAL(15, 2),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6.3 Tabel Master Penerbangan
    $table_name = $wpdb->prefix . 'umh_flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        airline VARCHAR(100) NOT NULL,
        flight_number VARCHAR(20),
        departure_airport_code VARCHAR(10),
        arrival_airport_code VARCHAR(10),
        departure_time DATETIME,
        arrival_time DATETIME,
        total_seats INT(4),
        cost_per_seat DECIMAL(15, 2),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6.4 Tabel Booking Penerbangan
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20),
        seat_number VARCHAR(10),
        booking_code VARCHAR(100),
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // ==========================================
    // 7. MARKETING
    // ==========================================

    // 7.1 Kampanye Marketing
    $table_name = $wpdb->prefix . 'umh_marketing_campaigns';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        start_date DATE,
        end_date DATE,
        budget DECIMAL(15, 2),
        status VARCHAR(20) DEFAULT 'planned',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 7.2 Leads (Calon Jamaah)
    $table_name = $wpdb->prefix . 'umh_leads';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        campaign_id BIGINT(20),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        source VARCHAR(100),
        status VARCHAR(20) DEFAULT 'new',
        assigned_to_user_id BIGINT(20),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY campaign_id (campaign_id)
    ) $charset_collate;";
    dbDelta($sql);

    // Simpan versi database terbaru
    update_option('umh_db_version', $umh_db_version);
}

add_action('plugins_loaded', 'umh_create_db_tables');
?>