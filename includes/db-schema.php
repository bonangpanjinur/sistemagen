<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Definisi struktur database lengkap untuk plugin Umroh Manager Hybrid.
 * Dijalankan saat aktivasi plugin.
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // --- GROUP 1: CORE & USER MANAGEMENT ---

    // 1. Tabel Users (Internal System Users selain WP Users)
    // Digunakan untuk staff, agen, atau user yang login lewat aplikasi React
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100) NOT NULL,
        role varchar(50) NOT NULL DEFAULT 'subscriber',
        phone varchar(20),
        status varchar(20) DEFAULT 'active',
        auth_token varchar(255),
        token_expires datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY email (email)
    ) $charset_collate;";
    dbDelta($sql_users);

    // 2. Tabel Roles (Manajemen Hak Akses Custom)
    $table_roles = $wpdb->prefix . 'umh_roles';
    $sql_roles = "CREATE TABLE $table_roles (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(50) NOT NULL,
        display_name varchar(100) NOT NULL,
        capabilities text, -- JSON array of permissions
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY name (name)
    ) $charset_collate;";
    dbDelta($sql_roles);


    // --- GROUP 2: MASTER DATA ---

    // 3. Tabel Master Hotel
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city varchar(50) NOT NULL, -- Makkah, Madinah, Jeddah
        rating varchar(5) DEFAULT '5',
        distance int DEFAULT 0, -- Jarak ke masjid dalam meter
        address text,
        map_link varchar(255),
        contact_phone varchar(20),
        facilities text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 4. Tabel Master Penerbangan (Maskapai)
    $table_flights = $wpdb->prefix . 'umh_flights';
    $sql_flights = "CREATE TABLE $table_flights (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10), -- Kode IATA (e.g., GA, SV)
        type varchar(20) DEFAULT 'International',
        status varchar(20) DEFAULT 'active',
        logo_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_flights);

    // 5. Tabel Kategori Paket
    $table_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_cats = "CREATE TABLE $table_cats (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_cats);


    // --- GROUP 3: PRODUCT & PACKAGES ---

    // 6. Tabel Paket Umroh/Haji (Produk Utama)
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        service_type varchar(20) DEFAULT 'umroh', -- umroh, haji, tour
        category_id mediumint(9),
        airline_id mediumint(9),
        duration int DEFAULT 9,
        departure_city varchar(50) DEFAULT 'Jakarta',
        price decimal(15,2) DEFAULT 0, -- Harga Display (Mulai dari)
        prices text, -- JSON: {quad: 30jt, triple: 32jt, double: 35jt}
        accommodations text, -- JSON: [{city:'Makkah', hotel_id:1}, ...]
        facilities text, -- Text/HTML list fasilitas
        excludes text, -- Text/HTML list exclude
        status varchar(20) DEFAULT 'active', -- active, draft, archived
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 7. Tabel Jadwal Keberangkatan (Inventory)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        departure_date date NOT NULL,
        return_date date,
        quota int DEFAULT 45,
        available_seats int DEFAULT 45,
        status varchar(20) DEFAULT 'open', -- open, full, closed, departed
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_departures);


    // --- GROUP 4: SALES & JAMAAH ---

    // 8. Tabel Agen (Mitra Penjualan)
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        city varchar(50),
        level varchar(20) DEFAULT 'agent', -- agent, branch, head
        commission_rate decimal(5,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 9. Tabel Jemaah (Customer Database)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        full_name varchar(150) NOT NULL,
        passport_number varchar(50),
        nik varchar(20),
        phone varchar(20),
        email varchar(100),
        address text,
        city varchar(50),
        gender varchar(10), -- L, P
        birth_date date,
        agent_id mediumint(9), -- Referensi ke agen jika ada
        status varchar(20) DEFAULT 'active',
        photo_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 10. Tabel Booking / Transaksi Paket (Relasi Jemaah ke Paket)
    $table_bookings = $wpdb->prefix . 'umh_bookings';
    $sql_bookings = "CREATE TABLE $table_bookings (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        booking_code varchar(20) NOT NULL, -- Kode Booking Unik
        jamaah_id mediumint(9) NOT NULL,
        departure_id mediumint(9) NOT NULL, -- Mengacu ke jadwal spesifik
        package_price decimal(15,2) NOT NULL, -- Harga deal saat booking
        room_type varchar(20) DEFAULT 'quad', -- quad, triple, double
        status varchar(20) DEFAULT 'booked', -- booked, dp_paid, paid, cancelled
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY booking_code (booking_code),
        KEY jamaah_id (jamaah_id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);


    // --- GROUP 5: MARKETING (CRM) ---

    // 11. Tabel Marketing Campaigns (Manajemen Iklan)
    $table_marketing = $wpdb->prefix . 'umh_marketing';
    $sql_marketing = "CREATE TABLE $table_marketing (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50), -- ig, fb, google, tiktok
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // 12. Tabel Leads (Calon Jemaah Potensial)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20) NOT NULL,
        source varchar(50) DEFAULT 'walk_in', -- ig, wa, referral, etc
        status varchar(50) DEFAULT 'new', -- new, contacted, interested, closing, lost
        notes text,
        assigned_to bigint(20) UNSIGNED NULL, -- User ID staff yang handle (Relasi ke umh_users)
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);


    // --- GROUP 6: FINANCE & HR ---

    // 13. Tabel Keuangan (Arus Kas)
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        type varchar(10) NOT NULL, -- income, expense
        category varchar(50), -- pembayaran_paket, gaji, iklan, operasional
        amount decimal(15,2) NOT NULL DEFAULT 0,
        description text,
        jamaah_id mediumint(9) NULL, -- Jika terkait pembayaran jemaah
        booking_id mediumint(9) NULL, -- Jika terkait booking spesifik
        payment_method varchar(20) DEFAULT 'transfer',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 14. Tabel Karyawan (HR)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        position varchar(100) NOT NULL,
        phone varchar(20),
        salary decimal(15,2) DEFAULT 0,
        user_id mediumint(9) NULL, -- Relasi ke akun login jika punya akses sistem
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 15. Tabel Absensi (HR)
    $table_attendance = $wpdb->prefix . 'umh_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        employee_id mediumint(9) NOT NULL,
        date date NOT NULL,
        status varchar(20) DEFAULT 'present', -- present, sick, permit, alpha
        notes varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_date (employee_id, date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    // 16. Tabel Kasbon/Pinjaman (HR)
    $table_loans = $wpdb->prefix . 'umh_loans';
    $sql_loans = "CREATE TABLE $table_loans (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        employee_id mediumint(9) NOT NULL,
        amount decimal(15,2) NOT NULL,
        date date NOT NULL,
        description text,
        status varchar(20) DEFAULT 'unpaid', -- unpaid, paid, installment
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_loans);


    // --- GROUP 7: UTILITIES ---

    // 17. Tabel Tasks (Manajemen Tugas Tim)
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to mediumint(9), -- User ID
        due_date date,
        priority varchar(20) DEFAULT 'medium', -- low, medium, high
        status varchar(20) DEFAULT 'pending', -- pending, in_progress, completed
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // 18. Tabel Logs (Pencatatan Aktivitas Sistem)
    $table_logs = $wpdb->prefix . 'umh_logs';
    $sql_logs = "CREATE TABLE $table_logs (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id mediumint(9),
        action varchar(50), -- create, update, delete, login
        target varchar(50), -- table name or module
        details text, -- JSON details of changes
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logs);
}

// Hook aktivasi untuk membuat/update tabel
register_activation_hook(dirname(__DIR__) . '/umroh-manager-hybrid.php', 'umh_create_db_tables');