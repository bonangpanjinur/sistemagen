<?php
// File: includes/db-schema.php
// Definisi skema database kustom untuk manajemen umroh.

if (!defined('ABSPATH')) {
    exit;
}

function umroh_manager_install_db_schema() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // -----------------------------------------------------------
    // 1. Tabel KATEGORI (umroh_categories)
    // Untuk kategori/sub-kategori paket (Ekonomi, VIP, Ramadhan, dll.)
    // -----------------------------------------------------------
    $table_name_categories = $wpdb->prefix . 'umroh_categories';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_categories'") != $table_name_categories) {
        $sql = "CREATE TABLE $table_name_categories (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            parent_id mediumint(9) DEFAULT 0 NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY parent_id (parent_id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 2. Tabel HOTEL (umroh_hotels)
    // Data master hotel
    // -----------------------------------------------------------
    $table_name_hotels = $wpdb->prefix . 'umroh_hotels';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_hotels'") != $table_name_hotels) {
        $sql = "CREATE TABLE $table_name_hotels (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            city varchar(50) NOT NULL,
            stars tinyint(1) NOT NULL,
            address text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 3. Tabel PENERBANGAN (umroh_flights)
    // Data master maskapai dan rute
    // -----------------------------------------------------------
    $table_name_flights = $wpdb->prefix . 'umroh_flights';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_flights'") != $table_name_flights) {
        $sql = "CREATE TABLE $table_name_flights (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            airline_name varchar(100) NOT NULL,
            flight_number varchar(20) NOT NULL,
            origin varchar(10) NOT NULL,
            destination varchar(10) NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY flight_num_unique (flight_number)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 4. Tabel PAKET UMROH (umroh_packages)
    // Inti dari paket yang merelasi ke Master Data
    // -----------------------------------------------------------
    $table_name_packages = $wpdb->prefix . 'umroh_packages';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_packages'") != $table_name_packages) {
        $sql = "CREATE TABLE $table_name_packages (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            package_name varchar(255) NOT NULL,
            category_id mediumint(9) NOT NULL,
            duration_days tinyint(3) NOT NULL,
            description text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY category_id (category_id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 5. Tabel Relasi Paket - Hotel (umroh_package_hotels)
    // Many-to-Many
    // -----------------------------------------------------------
    $table_name_pkg_hotels = $wpdb->prefix . 'umroh_package_hotels';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_pkg_hotels'") != $table_name_pkg_hotels) {
        $sql = "CREATE TABLE $table_name_pkg_hotels (
            package_id mediumint(9) NOT NULL,
            hotel_id mediumint(9) NOT NULL,
            PRIMARY KEY (package_id, hotel_id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 6. Tabel Relasi Paket - Penerbangan (umroh_package_flights)
    // Many-to-Many
    // -----------------------------------------------------------
    $table_name_pkg_flights = $wpdb->prefix . 'umroh_package_flights';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_pkg_flights'") != $table_name_pkg_flights) {
        $sql = "CREATE TABLE $table_name_pkg_flights (
            package_id mediumint(9) NOT NULL,
            flight_id mediumint(9) NOT NULL,
            PRIMARY KEY (package_id, flight_id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 7. Tabel JADWAL KEBERANGKATAN (umroh_departures)
    // Harga dan tanggal per paket
    // -----------------------------------------------------------
    $table_name_departures = $wpdb->prefix . 'umroh_departures';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_departures'") != $table_name_departures) {
        $sql = "CREATE TABLE $table_name_departures (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            package_id mediumint(9) NOT NULL,
            departure_date date NOT NULL,
            quota smallint(5) NOT NULL,
            price_quad decimal(10,2) NOT NULL,
            price_triple decimal(10,2) NOT NULL,
            price_double decimal(10,2) NOT NULL,
            is_active boolean DEFAULT TRUE NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY package_id (package_id)
        ) $charset_collate;";
        dbDelta($sql);
    }

    // -----------------------------------------------------------
    // 8. Tabel DATA JAMAAH (umroh_jamaah)
    // -----------------------------------------------------------
    $table_name_jamaah = $wpdb->prefix . 'umroh_jamaah';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_jamaah'") != $table_name_jamaah) {
        $sql = "CREATE TABLE $table_name_jamaah (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            departure_id mediumint(9) NOT NULL,
            full_name varchar(255) NOT NULL,
            ktp_number varchar(30),
            passport_number varchar(30),
            phone_number varchar(20) NOT NULL,
            email varchar(100),
            address text,
            status varchar(50) DEFAULT 'registered' NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY (id),
            KEY departure_id (departure_id)
        ) $charset_collate;";
        dbDelta($sql);
    }
    
    // -----------------------------------------------------------
    // 9. Tabel HAK AKSES PENGGUNA (umroh_user_permissions) - BARU
    // Untuk mengelola hak akses kustom karyawan
    // -----------------------------------------------------------
    $table_name_permissions = $wpdb->prefix . 'umroh_user_permissions';
    if ($wpdb->get_var("SHOW TABLES LIKE '$table_name_permissions'") != $table_name_permissions) {
        $sql = "CREATE TABLE $table_name_permissions (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id mediumint(9) NOT NULL,
            permission_key varchar(50) NOT NULL,
            has_access boolean DEFAULT FALSE NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY user_perm_key (user_id, permission_key),
            KEY user_id (user_id)
        ) $charset_collate;";
        dbDelta($sql);
    }
}