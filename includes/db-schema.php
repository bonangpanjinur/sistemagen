<?php
// File: includes/db-schema.php
// Version: 2.2 (Fix SQL Syntax for dbDelta)

if (!defined('ABSPATH')) {
    exit;
}

global $umh_db_version;
$umh_db_version = '2.2';

function umh_create_db_tables() {
    global $wpdb;
    global $umh_db_version;

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel Master Data
    $table_masters = $wpdb->prefix . 'umh_master_data';
    $sql_masters = "CREATE TABLE $table_masters (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        type varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        description text,
        extra_data text,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY type (type)
    ) $charset_collate;";
    dbDelta($sql_masters);

    // 2. Tabel Agen
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        agent_code varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        ktp_number varchar(50),
        phone varchar(20),
        area varchar(100),
        join_date date,
        status varchar(20) DEFAULT 'active',
        bank_account varchar(100),
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY agent_code (agent_code)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 3. Tabel Paket
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_name varchar(255) NOT NULL,
        category_id mediumint(9),
        sub_category varchar(100),
        duration int(3),
        departure_city varchar(100),
        airlines text,
        hotels text,
        facilities text,
        promo_types text,
        itinerary_data longtext,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 4. Tabel Jadwal Paket
    $table_pkg_dates = $wpdb->prefix . 'umh_package_dates';
    $sql_pkg_dates = "CREATE TABLE $table_pkg_dates (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        departure_date date NOT NULL,
        return_date date,
        quota int(4) DEFAULT 45,
        booked int(4) DEFAULT 0,
        status varchar(20) DEFAULT 'available',
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_dates);

    // 5. Tabel Harga Paket
    $table_pkg_prices = $wpdb->prefix . 'umh_package_prices';
    $sql_pkg_prices = "CREATE TABLE $table_pkg_prices (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        room_type varchar(50) NOT NULL,
        price decimal(15,2) NOT NULL,
        currency varchar(3) DEFAULT 'IDR',
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_prices);

    // 6. Tabel Jemaah
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        registration_code varchar(50),
        registration_date date,
        package_id mediumint(9),
        sub_agent_id mediumint(9),
        package_type varchar(150),
        sub_agent_name varchar(150),
        full_name varchar(255) NOT NULL,
        gender varchar(10),
        birth_place varchar(100),
        birth_date date,
        marital_status varchar(50),
        occupation varchar(100),
        ktp_number varchar(50),
        passport_number varchar(50),
        passport_name varchar(255),
        passport_issued_date date,
        passport_expiry_date date,
        passport_issued_office varchar(100),
        address text,
        city varchar(100),
        phone_number varchar(30),
        father_name varchar(255),
        mother_name varchar(255),
        heir_name varchar(255),
        heir_relation varchar(100),
        departure_date date,
        room_type varchar(50),
        clothing_size varchar(10),
        status varchar(50) DEFAULT 'active',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY sub_agent_id (sub_agent_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 7. Tabel Logistik
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        jamaah_id mediumint(9) NOT NULL,
        items_taken text,
        taken_date date,
        taken_by varchar(255),
        delivery_method varchar(50),
        delivery_address text,
        status varchar(50) DEFAULT 'Belum Diambil',
        notes text,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_logistics);

    // 8. Tabel Keuangan
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        transaction_type varchar(20) NOT NULL,
        transaction_date date NOT NULL,
        amount decimal(15,2) NOT NULL,
        jamaah_id mediumint(9),
        category varchar(100),
        payment_stage varchar(50),
        payment_method varchar(50),
        description text,
        pic_name varchar(150),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 9. Tabel Karyawan
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        full_name varchar(255) NOT NULL,
        position varchar(100),
        department varchar(100),
        salary decimal(15,2),
        join_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 10. Tabel Kasbon
    $table_loans = $wpdb->prefix . 'umh_employee_loans';
    $sql_loans = "CREATE TABLE $table_loans (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        employee_id mediumint(9) NOT NULL,
        loan_date date NOT NULL,
        amount decimal(15,2) NOT NULL,
        description text,
        status varchar(20) DEFAULT 'outstanding',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_id (employee_id)
    ) $charset_collate;";
    dbDelta($sql_loans);

    // 11. Tabel Roles
    $table_roles = $wpdb->prefix . 'umh_roles';
    $sql_roles = "CREATE TABLE $table_roles (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        role_key varchar(50) NOT NULL,
        role_name varchar(100) NOT NULL,
        capabilities text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    update_option('umh_db_version', $umh_db_version);
}
add_action('plugins_loaded', 'umh_create_db_tables');
?>