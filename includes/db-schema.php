<?php
/**
 * File: includes/db-schema.php
 *
 * Mendefinisikan fungsi umh_create_tables() untuk membuat semua
 * tabel database kustom saat aktivasi plugin.
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Fungsi utama untuk membuat/memperbarui semua tabel database.
 */
function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel User (Karyawan)
    $table_name = $wpdb->prefix . 'umh_users';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        wp_user_id BIGINT(20) UNSIGNED NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NULL,
        role VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        auth_token VARCHAR(100) NULL,
        token_expires DATETIME NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email (email),
        KEY wp_user_id (wp_user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 2. Tabel Roles
    $table_name = $wpdb->prefix . 'umh_roles';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        role_key VARCHAR(50) NOT NULL,
        role_name VARCHAR(100) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql);

    // 3. Tabel Categories (Paket)
    $table_name = $wpdb->prefix . 'umh_categories';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 4. Tabel Packages
    $table_name = $wpdb->prefix . 'umh_packages';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NULL,
        category_id BIGINT(20) NOT NULL,
        base_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        duration INT(3) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        capacity INT(4) NOT NULL DEFAULT 0,
        start_date DATE NULL,
        end_date DATE NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 5. Tabel Package Prices (Harga Kamar)
    $table_name = $wpdb->prefix . 'umh_package_prices';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        room_type VARCHAR(50) NOT NULL,
        price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 6. Tabel Relasi Package <> Flights
    $table_name = $wpdb->prefix . 'umh_package_flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY package_flight (package_id, flight_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 7. Tabel Relasi Package <> Hotels
    $table_name = $wpdb->prefix . 'umh_package_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        package_id BIGINT(20) NOT NULL,
        hotel_id BIGINT(20) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY package_hotel (package_id, hotel_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 8. Tabel Flights
    $table_name = $wpdb->prefix . 'umh_flights';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        airline VARCHAR(100) NOT NULL,
        flight_number VARCHAR(20) NOT NULL,
        departure_airport VARCHAR(100) NOT NULL,
        arrival_airport VARCHAR(100) NOT NULL,
        departure_time DATETIME NOT NULL,
        arrival_time DATETIME NOT NULL,
        total_seats INT(4) NOT NULL DEFAULT 0,
        cost_per_seat DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 9. Tabel Hotels
    $table_name = $wpdb->prefix . 'umh_hotels';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        address TEXT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NULL,
        rating INT(1) NULL,
        check_in_date DATE NULL,
        check_out_date DATE NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 10. Tabel Departures (Keberangkatan)
    $table_name = $wpdb->prefix . 'umh_departures';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        departure_date DATE NOT NULL,
        return_date DATE NOT NULL,
        package_id BIGINT(20) NOT NULL,
        flight_id BIGINT(20) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        notes TEXT NULL,
        total_seats INT(4) NOT NULL DEFAULT 0,
        available_seats INT(4) NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 11. Tabel Jamaah
    $table_name = $wpdb->prefix . 'umh_jamaah';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(100) NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NULL,
        package_id BIGINT(20) NOT NULL,
        departure_id BIGINT(20) NOT NULL,
        room_type VARCHAR(50) NULL,
        total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'belum_lunas',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        documents_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        created_by BIGINT(20) UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        KEY package_id (package_id),
        KEY departure_id (departure_id),
        KEY created_by (created_by)
    ) $charset_collate;";
    dbDelta($sql);

    // 12. Tabel Payments
    $table_name = $wpdb->prefix . 'umh_payments';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        created_by BIGINT(20) UNSIGNED NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY created_by (created_by)
    ) $charset_collate;";
    dbDelta($sql);

    // 13. Tabel Tasks
    $table_name = $wpdb->prefix . 'umh_tasks';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        due_date DATE NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        assigned_to_user_id BIGINT(20) UNSIGNED NULL,
        created_by_user_id BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY assigned_to_user_id (assigned_to_user_id),
        KEY created_by_user_id (created_by_user_id)
    ) $charset_collate;";
    dbDelta($sql);
    
    // --- PENAMBAHAN TABEL BARU (15/11/2025) ---

    // 14. Tabel Finance (untuk api-finance.php)
    $table_name = $wpdb->prefix . 'umh_finance_transactions';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        type VARCHAR(20) NOT NULL, -- 'income' atau 'expense'
        description TEXT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        transaction_date DATE NOT NULL,
        jamaah_id BIGINT(20) UNSIGNED NULL,
        package_id BIGINT(20) UNSIGNED NULL,
        created_by BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id),
        KEY created_by (created_by)
    ) $charset_collate;";
    dbDelta($sql);

    // 15. Tabel HR (untuk api-hr.php, contoh: cuti)
    $table_name = $wpdb->prefix . 'umh_hr_leave';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        created_by BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 16. Tabel Marketing (untuk api-marketing.php)
    $table_name = $wpdb->prefix . 'umh_marketing_campaigns';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(20) NOT NULL DEFAULT 'planned',
        created_by BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql);

    // 17. Tabel Flight Bookings (untuk api-flight-bookings.php)
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) UNSIGNED NOT NULL,
        flight_id BIGINT(20) UNSIGNED NOT NULL,
        departure_id BIGINT(20) UNSIGNED NOT NULL,
        confirmation_code VARCHAR(50) NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        created_by BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY flight_id (flight_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 18. Tabel Hotel Bookings (untuk api-hotel-bookings.php)
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        jamaah_id BIGINT(20) UNSIGNED NOT NULL,
        hotel_id BIGINT(20) UNSIGNED NOT NULL,
        departure_id BIGINT(20) UNSIGNED NOT NULL,
        room_number VARCHAR(20) NULL,
        confirmation_code VARCHAR(50) NULL,
        created_by BIGINT(20) UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id),
        KEY hotel_id (hotel_id)
    ) $charset_collate;";
    dbDelta($sql);

    // 19. Tabel Logs (untuk api-logs.php)
    $table_name = $wpdb->prefix . 'umh_logs';
    $sql = "CREATE TABLE $table_name (
        id BIGINT(20) NOT NULL AUTO_INCREMENT,
        level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error'
        message TEXT NOT NULL,
        context TEXT NULL, -- JSON string
        created_by BIGINT(20) UNSIGNED NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id),
        KEY level (level)
    ) $charset_collate;";
    dbDelta($sql);
}

/**
 * Fungsi BARU: Menambahkan data role default ke tabel umh_roles
 * Ini akan dipanggil saat aktivasi plugin.
 */
function umh_create_default_roles() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_roles';

    // Cek apakah tabel sudah ada isinya
    $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    if ($count > 0) {
        return; // Jangan lakukan apapun jika sudah ada data
    }

    // Data role default
    $roles = [
        ['role_key' => 'owner', 'role_name' => 'Owner'],
        ['role_key' => 'admin_staff', 'role_name' => 'Staf Admin'],
        ['role_key' => 'ops_staff', 'role_name' => 'Staf Operasional'],
        ['role_key' => 'finance_staff', 'role_name' => 'Staf Keuangan'],
        ['role_key' => 'hr_staff', 'role_name' => 'Staf HRD'],
        ['role_key' => 'marketing_staff', 'role_name' => 'Staf Marketing'],
    ];

    // Masukkan data
    foreach ($roles as $role) {
        $wpdb->insert(
            $table_name,
            [
                'role_key' => $role['role_key'],
                'role_name' => $role['role_name'],
            ],
            [
                '%s',
                '%s',
            ]
        );
    }
}