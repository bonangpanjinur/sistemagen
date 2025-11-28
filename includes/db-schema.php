<?php
if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // --- 1. Tabel Utama: FINANCE (Keuangan) ---
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        type varchar(10) NOT NULL, 
        category varchar(50),
        amount decimal(15,2) NOT NULL DEFAULT 0,
        description text,
        jamaah_id mediumint(9) NULL,
        agent_id mediumint(9) NULL,
        employee_id mediumint(9) NULL,
        booking_id mediumint(9) NULL, 
        payment_method varchar(20) DEFAULT 'transfer',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // --- 2. Tabel Utama: DEPARTURES (Jadwal Keberangkatan) ---
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        departure_date date NOT NULL,
        return_date date,
        quota int DEFAULT 45,
        available_seats int DEFAULT 45,
        price_override decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'open',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // --- 3. Tabel Utama: MARKETING ---
    $table_marketing = $wpdb->prefix . 'umh_marketing';
    $sql_marketing = "CREATE TABLE $table_marketing (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        ad_link text,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // --- 4. Tabel Master: AGENTS (Agen & Mitra) ---
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20) NULL,
        phone varchar(20),
        email varchar(100),
        city varchar(50),
        level varchar(20) DEFAULT 'agent',
        parent_id mediumint(9) NULL,
        commission_rate decimal(15,2) DEFAULT 0,
        bank_name varchar(50),
        bank_account varchar(50),
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // --- 5. Tabel Master: HOTELS (Hotel) ---
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city varchar(50) NOT NULL, 
        rating varchar(5) DEFAULT '5',
        distance int DEFAULT 0, 
        address text,
        map_link varchar(255),
        contact_phone varchar(20),
        facilities text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);
    
    // --- 6. Tabel Master: PACKAGES (Paket Umrah/Haji) ---
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        service_type varchar(20) DEFAULT 'umroh',
        category_id mediumint(9),
        airline_id mediumint(9),
        duration int DEFAULT 9,
        departure_city varchar(50) DEFAULT 'Jakarta',
        price decimal(15,2) DEFAULT 0,
        prices text, 
        accommodations longtext,
        facilities text,
        excludes text,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // --- 7. Tabel Master: EMPLOYEES (Karyawan/HR) ---
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        position varchar(100),
        department varchar(100),
        salary decimal(15,2) DEFAULT 0,
        join_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // --- 8. Tabel Data: JAMAAH (Data Jemaah) ---
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        full_name varchar(150) NOT NULL,
        passport_number varchar(50),
        nik varchar(50),
        gender varchar(10) DEFAULT 'L',
        birth_date date,
        phone varchar(20),
        email varchar(100),
        address text,
        city varchar(50),
        status varchar(20) DEFAULT 'leads', 
        agent_id mediumint(9) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // --- 9. Tabel Operasional: TASKS (Tugas Tim) ---
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to mediumint(9),
        due_date date,
        priority varchar(20) DEFAULT 'medium',
        status varchar(20) DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // --- 10. Tabel Operasional: LOGISTICS (Logistik/Perlengkapan) ---
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        category varchar(50),
        quantity int DEFAULT 0,
        unit varchar(20) DEFAULT 'pcs',
        status varchar(20) DEFAULT 'available',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);

    // --- 11. Tabel Kategori Paket (Master Data) ---
    $table_pkg_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_pkg_cats = "CREATE TABLE $table_pkg_cats (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100),
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // --- 12. Tabel Master: FLIGHTS (Maskapai) ---
    $table_flights = $wpdb->prefix . 'umh_flights';
    $sql_flights = "CREATE TABLE $table_flights (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10),
        origin varchar(50),
        destination varchar(50),
        contact_info text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_flights);
}

register_activation_hook(dirname(__DIR__) . '/umroh-manager-hybrid.php', 'umh_create_db_tables');