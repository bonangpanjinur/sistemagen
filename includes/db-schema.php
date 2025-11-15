<?php
/**
 * File: includes/db-schema.php
 *
 * PERBAIKAN (15/11/2025):
 * - Menghapus `KEY email (email)` dari tabel `umh_users`.
 * - Alasan: Kolom `email` sudah didefinisikan sebagai `UNIQUE`,
 * yang secara otomatis membuat indeks bernama 'email'.
 * - Menambahkan `KEY email (email)` secara manual menyebabkan
 * error "Duplicate key name 'email'".
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

function umh_create_db_schema() {
    global $wpdb;
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    $charset_collate = $wpdb->get_charset_collate();

    // 1. Tabel Kategori Paket
    $table_name = $wpdb->prefix . 'umh_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2. Tabel Paket Umroh/Haji
    $table_name = $wpdb->prefix . 'umh_packages';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        category_id BIGINT(20),
        description TEXT,
        departure_date DATE,
        duration_days INT,
        status VARCHAR(20) DEFAULT 'draft',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 3. Tabel Jemaah
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20),
        full_name VARCHAR(255) NOT NULL,
        birth_date DATE,
        gender VARCHAR(10),
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        passport_number VARCHAR(50),
        passport_expiry DATE,
        ktp_number VARCHAR(50),
        ktp_scan VARCHAR(255),
        passport_scan VARCHAR(255),
        room_type VARCHAR(20),
        status VARCHAR(50) DEFAULT 'pending',
        total_price DECIMAL(15, 2),
        amount_paid DECIMAL(15, 2) DEFAULT 0.00,
        payment_status VARCHAR(20) DEFAULT 'Belum Lunas',
        notes TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 4. Tabel Keuangan (Transaksi)
    $table_name = $wpdb->prefix . 'umh_finance';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        transaction_date DATE NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
        category VARCHAR(100),
        description TEXT,
        amount DECIMAL(15, 2) NOT NULL,
        related_id BIGINT(20),
        related_type VARCHAR(50),
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY type (type),
        KEY category (category)
    ) $charset_collate;";
    dbDelta($sql);

    // 5. Tabel Maskapai (Flights)
    $table_name = $wpdb->prefix . 'umh_flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        airline VARCHAR(100) NOT NULL,
        flight_number VARCHAR(50) NOT NULL,
        departure_airport_code VARCHAR(10) NOT NULL,
        arrival_airport_code VARCHAR(10) NOT NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        cost_per_seat DECIMAL(15, 2),
        total_seats INT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6. Tabel Hotel
    $table_name = $wpdb->prefix . 'umh_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(100),
        rating INT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 7. Tabel Booking Pesawat (Bisa untuk Jemaah atau Paket)
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        flight_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20),
        package_id BIGINT(20),
        seat_number VARCHAR(10),
        booking_code VARCHAR(50),
        status VARCHAR(20) DEFAULT 'confirmed',
        PRIMARY KEY (id),
        KEY flight_id (flight_id),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 8. Tabel Booking Hotel (Bisa untuk Jemaah atau Paket)
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        hotel_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20),
        package_id BIGINT(20),
        room_number VARCHAR(20),
        check_in_date DATE,
        check_out_date DATE,
        status VARCHAR(20) DEFAULT 'confirmed',
        PRIMARY KEY (id),
        KEY hotel_id (hotel_id),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 9. Tabel Tugas (Tasks)
    $table_name = $wpdb->prefix . 'umh_tasks';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to_user_id BIGINT(20),
        jamaah_id BIGINT(20),
        package_id BIGINT(20),
        due_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(20) DEFAULT 'medium',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY assigned_to_user_id (assigned_to_user_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 10. Tabel Pengguna/Karyawan (Users/Staff)
    $table_name = $wpdb->prefix . 'umh_users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED,
        full_name VARCHAR(255),
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        auth_token VARCHAR(100),
        token_expires DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY wp_user_id (wp_user_id)
        -- === PERBAIKAN: Baris ini dihapus ===
        -- KEY email (email)
    ) $charset_collate;";
    dbDelta($sql);

    // 11. Tabel Agen Marketing
    $table_name = $wpdb->prefix . 'umh_agents';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        upline_agent_id BIGINT(20),
        commission_rate DECIMAL(5, 2) DEFAULT 0.00,
        total_recruits INT DEFAULT 0,
        total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY upline_agent_id (upline_agent_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 12. Tabel Log Aktivitas
    $table_name = $wpdb->prefix . 'umh_logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20),
        action_type VARCHAR(100) NOT NULL,
        object_id BIGINT(20),
        object_type VARCHAR(50),
        description TEXT,
        timestamp DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY action_type (action_type)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 13. Tabel Dokumen
    $table_name = $wpdb->prefix . 'umh_documents';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        expiry_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        uploaded_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 14. Tabel Keberangkatan (Departures)
    $table_name = $wpdb->prefix . 'umh_departures';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        departure_date DATE NOT NULL,
        return_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        notes TEXT,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 15. Tabel Manifest
    $table_name = $wpdb->prefix . 'umh_manifest';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        departure_id BIGINT(20) NOT NULL,
        jamaah_id BIGINT(20) NOT NULL,
        status VARCHAR(50) DEFAULT 'confirmed',
        check_in_status BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (id),
        UNIQUE KEY departure_jamaah (departure_id, jamaah_id),
        KEY departure_id (departure_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 16. Tabel Pengaturan Plugin
    $table_name = $wpdb->prefix . 'umh_settings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value LONGTEXT,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 17. Tabel Notifikasi
    $table_name = $wpdb->prefix . 'umh_notifications';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255),
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 18. Tabel Role Karyawan
    $table_name = $wpdb->prefix . 'umh_roles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        role_key VARCHAR(50) NOT NULL UNIQUE,
        role_name VARCHAR(100) NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 19. Tabel Pembayaran Jemaah
    $table_name = $wpdb->prefix . 'umh_payments';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        payment_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_stage VARCHAR(50),
        proof_url VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // 20. Tabel Harga Paket
    $table_name = $wpdb->prefix . 'umh_package_prices';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        room_type VARCHAR(100) NOT NULL,
        price DECIMAL(15, 2) NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    do_action('umh_after_db_schema_created', $charset_collate);
}