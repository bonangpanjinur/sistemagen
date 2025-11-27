<?php
if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel Agents
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        address text,
        city varchar(50),
        code varchar(20),
        status varchar(20) DEFAULT 'active',
        commission_rate decimal(15,2) DEFAULT 0,
        parent_id mediumint(9) NULL, 
        type varchar(20) DEFAULT 'master',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY parent_id (parent_id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 2. Tabel Jamaah
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        registration_number varchar(50),
        full_name varchar(100) NOT NULL,
        nik varchar(20),
        passport_number varchar(20),
        phone varchar(20),
        address text,
        city varchar(50),
        package_id mediumint(9),
        agent_id mediumint(9),
        room_type varchar(20) DEFAULT 'quad',
        package_price decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'registered',
        documents longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 3. Tabel Kategori Paket
    $table_categories = $wpdb->prefix . 'umh_package_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100),
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_categories);

    // 4. Tabel Master Hotel
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        city varchar(50) DEFAULT 'Makkah',
        rating varchar(5) DEFAULT '5',
        distance int(11) DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 5. Tabel Master Maskapai
    $table_flights = $wpdb->prefix . 'umh_flights';
    $sql_flights = "CREATE TABLE $table_flights (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10),
        type varchar(20) DEFAULT 'International',
        logo_url varchar(255),
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_flights);

    // 6. Tabel Paket
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        service_type varchar(20) DEFAULT 'umroh',
        category_id mediumint(9) NULL,
        duration int(11) DEFAULT 9,
        price decimal(15,2) DEFAULT 0,
        prices longtext,
        airline_id mediumint(9) NULL,
        accommodations longtext,
        facilities longtext,
        excludes longtext,
        itinerary_type varchar(20) DEFAULT 'manual',
        itinerary_data longtext,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 7. Tabel HR: Employees
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        position varchar(50),
        phone varchar(20),
        salary decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 8. Tabel HR: Attendance
    $table_attendance = $wpdb->prefix . 'umh_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        employee_id mediumint(9) NOT NULL,
        date date NOT NULL,
        status varchar(20) DEFAULT 'present',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_id (employee_id)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    // 9. Tabel HR: Loans
    $table_loans = $wpdb->prefix . 'umh_loans';
    $sql_loans = "CREATE TABLE $table_loans (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        employee_id mediumint(9) NOT NULL,
        date date NOT NULL,
        amount decimal(15,2) NOT NULL,
        description text,
        status varchar(20) DEFAULT 'unpaid',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_id (employee_id)
    ) $charset_collate;";
    dbDelta($sql_loans);

    // 10. Tabel Finance
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        type varchar(20) NOT NULL,
        amount decimal(15,2) NOT NULL,
        category varchar(50),
        description text,
        proof_url varchar(255),
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 11. Tabel Logistik
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        jamaah_id mediumint(9) NOT NULL,
        items_status longtext,
        handover_status varchar(20) DEFAULT 'pending',
        taken_by varchar(100),
        date_taken date,
        shipping_address text,
        notes text,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_logistics);
}

register_activation_hook(__FILE__, 'umh_create_db_tables');

// URL Trigger untuk perbaikan manual jika diperlukan
if (isset($_GET['update_umh_db']) && $_GET['update_umh_db'] == 'true' && current_user_can('manage_options')) {
    umh_create_db_tables();
    echo "Database Schema Updated Successfully (No Comments Clean Version)!";
    exit;
}