<?php
if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // ==========================================
    // 1. DATA MASTER & KATEGORI
    // ==========================================

    // 1.1 PACKAGE CATEGORIES
    $table_pkg_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_pkg_cats = "CREATE TABLE $table_pkg_cats (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // 1.2 HOTELS
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city varchar(50) NOT NULL, /* Makkah / Madinah / Jeddah */
        star_rating tinyint(1) DEFAULT 3,
        distance_to_haram int DEFAULT 0, /* dalam meter */
        map_link text,
        contact_person varchar(100),
        phone varchar(20),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 1.3 FLIGHTS (Maskapai Master)
    $table_flights = $wpdb->prefix . 'umh_flights';
    $sql_flights = "CREATE TABLE $table_flights (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20),
        origin varchar(50),
        destination varchar(50),
        transit varchar(50), /* Kolom Transit */
        contact_info varchar(100),
        type varchar(20) DEFAULT 'International',
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_flights);

    // ==========================================
    // 2. PRODUK & LAYANAN (PACKAGES)
    // ==========================================

    // 2.1 PACKAGES
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        category_id mediumint(9),
        duration int DEFAULT 9,
        price decimal(15,2) DEFAULT 0, /* Harga Dasar */
        hotel_makkah varchar(200),
        hotel_madinah varchar(200),
        airline varchar(100),
        facilities text,
        description text,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 2.2 DEPARTURES (Jadwal Keberangkatan)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        departure_date date NOT NULL,
        return_date date,
        quota int DEFAULT 45,
        price_override decimal(15,2) DEFAULT 0, /* Harga khusus tanggal ini */
        status varchar(20) DEFAULT 'open', /* open, closed, departed, completed */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // ==========================================
    // 3. SUMBER DAYA MANUSIA (HR & AGENTS)
    // ==========================================

    // 3.1 EMPLOYEES (HR)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        position varchar(100),
        phone varchar(20),
        email varchar(100),
        salary decimal(15,2) DEFAULT 0,
        user_id bigint(20) UNSIGNED NULL, /* Relasi ke WP User */
        status varchar(20) DEFAULT 'active',
        joined_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 3.2 AGENTS
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20) NULL,
        phone varchar(20),
        email varchar(100),
        city varchar(50),
        address text,
        type varchar(20) DEFAULT 'master', /* master, sub */
        parent_id mediumint(9) NULL, /* Untuk Sub Agent */
        commission_nominal decimal(15,2) DEFAULT 0, /* Komisi Nominal (Rupiah) */
        status varchar(20) DEFAULT 'active',
        bank_account varchar(50),
        bank_name varchar(50),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // ==========================================
    // 4. CRM & PEMASARAN
    // ==========================================

    // 4.1 LEADS (Calon Jemaah)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100),
        source varchar(50) DEFAULT 'manual', /* ig, fb, walk_in */
        status varchar(20) DEFAULT 'new', /* new, contacted, interested, closed, junk */
        notes text,
        follow_up_date date,
        assigned_to mediumint(9) NULL, /* Staff ID */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // 4.2 MARKETING CAMPAIGNS
    $table_marketing = $wpdb->prefix . 'umh_marketing';
    $sql_marketing = "CREATE TABLE $table_marketing (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        ad_link text,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // 4.3 JAMAAH (Data Fix Jemaah)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        full_name varchar(150) NOT NULL, /* Field tambahan untuk konsistensi */
        registration_number varchar(50),
        nik varchar(20),
        passport_number varchar(20),
        passport_expiry date,
        gender enum('L','P'),
        birth_date date,
        phone varchar(20),
        address text,
        city varchar(50),
        package_id mediumint(9),
        departure_id mediumint(9),
        agent_id mediumint(9) NULL, /* Jika daftar via agen */
        status varchar(20) DEFAULT 'registered', /* registered, dp, lunas, berangkat, pulang, batal */
        mahram_id mediumint(9) NULL,
        user_id bigint(20) UNSIGNED NULL, /* Link ke WP User jika jemaah login */
        package_price decimal(15,2) DEFAULT 0,
        
        /* KOLOM DOKUMEN */
        scan_ktp varchar(255) NULL,
        scan_kk varchar(255) NULL,
        scan_passport varchar(255) NULL,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // ==========================================
    // 5. KEUANGAN (FINANCE & PAYMENTS)
    // ==========================================

    // 5.1 FINANCE (Arus Kas Umum)
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        type varchar(10) NOT NULL, /* income, expense */
        category varchar(50),
        amount decimal(15,2) NOT NULL DEFAULT 0,
        description text,
        jamaah_id mediumint(9) NULL,   /* Relasi Jemaah */
        agent_id mediumint(9) NULL,    /* Relasi Agen */
        employee_id mediumint(9) NULL, /* Relasi Karyawan */
        campaign_id mediumint(9) NULL, /* Relasi Kampanye Iklan */
        payment_method varchar(20) DEFAULT 'transfer',
        proof_file varchar(255) NULL,  /* Bukti Upload */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 5.2 PAYMENTS (Detail Pembayaran Jemaah / Invoice)
    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        invoice_number varchar(50) NOT NULL,
        jamaah_id mediumint(9) NOT NULL,
        amount decimal(15,2) NOT NULL DEFAULT 0,
        payment_date date NOT NULL,
        payment_method varchar(20),
        status varchar(20) DEFAULT 'verified', /* pending, verified, rejected */
        notes text,
        finance_id mediumint(9) NULL, /* Link ke tabel finance jika tersinkron */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // ==========================================
    // 6. OPERASIONAL LAINNYA
    // ==========================================

    // 6.1 LOGISTICS (Perlengkapan)
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        unit varchar(20) DEFAULT 'pcs',
        cost_price decimal(15,2) DEFAULT 0,
        description text,
        last_updated datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);

    // 6.2 TASKS (Tugas Tim)
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to mediumint(9) NULL, /* Employee ID */
        due_date date,
        priority varchar(10) DEFAULT 'medium', /* low, medium, high */
        status varchar(20) DEFAULT 'pending', /* pending, in_progress, completed */
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // 6.3 LOGS (Audit Trail)
    $table_logs = $wpdb->prefix . 'umh_logs';
    $sql_logs = "CREATE TABLE $table_logs (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        action varchar(50),
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    // ==========================================
    // 7. MANAJEMEN FILE (UPLOADS)
    // ==========================================
    
    // 7.1 UPLOADS (Tabel Custom untuk File Management)
    $table_uploads = $wpdb->prefix . 'umh_uploads';
    $sql_uploads = "CREATE TABLE $table_uploads (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        jamaah_id mediumint(9) NULL,
        attachment_id bigint(20) UNSIGNED, /* ID Media WordPress */
        file_url text,
        file_type varchar(50),
        upload_type varchar(50), /* ktp, passport, proof_payment, dll */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_uploads);
}

register_activation_hook(dirname(__DIR__) . '/umroh-manager-hybrid.php', 'umh_create_db_tables');