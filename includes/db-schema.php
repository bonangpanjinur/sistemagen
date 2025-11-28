<?php
if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. Tabel Agents (Agen/Mitra)
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

    // 2. Tabel Jamaah (Data Jemaah)
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
        amount_paid decimal(15,2) DEFAULT 0,
        payment_status varchar(20) DEFAULT 'pending', 
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

    // 6. Tabel Paket Umrah/Haji
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

    // 7. Tabel Keberangkatan (Departures)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        flight_id mediumint(9),
        departure_date date NOT NULL,
        return_date date,
        total_seats int(11) DEFAULT 45,
        available_seats int(11) DEFAULT 45,
        status varchar(20) DEFAULT 'scheduled',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // 8. Tabel HR: Employees (Data Karyawan)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NULL, 
        name varchar(100) NOT NULL,
        position varchar(50),
        phone varchar(20),
        salary decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 9. Tabel HR: Attendance (Absensi)
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

    // 10. Tabel HR: Loans (Kasbon)
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

    // 11. Tabel Finance (Keuangan)
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
        jamaah_id mediumint(9),
        payment_method varchar(20) DEFAULT 'transfer',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 12. Tabel Logistik (Perlengkapan)
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

    // 13. Tabel Uploads (Manajemen File)
    $table_uploads = $wpdb->prefix . 'umh_uploads';
    $sql_uploads = "CREATE TABLE $table_uploads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id mediumint(9) NULL,
        attachment_id bigint(20) UNSIGNED NOT NULL,
        file_url varchar(255) NOT NULL,
        file_type varchar(50),
        upload_type varchar(50),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_uploads);

    // 14. Tabel Marketing Leads (Calon Jemaah)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20) NOT NULL,
        source varchar(50) DEFAULT 'walk_in',
        status varchar(50) DEFAULT 'new',
        notes text,
        assigned_to bigint(20) UNSIGNED NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);
    
    // 15. Tabel Marketing Campaigns
    $table_marketing = $wpdb->prefix . 'umh_marketing';
    $sql_marketing = "CREATE TABLE $table_marketing (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);
    
    // 16. Tabel Tasks (Tugas Tim)
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        assigned_to bigint(20) UNSIGNED NOT NULL,
        due_date date,
        priority varchar(20) DEFAULT 'medium',
        status varchar(20) DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);
}

register_activation_hook(__FILE__, 'umh_create_db_tables');

// Trigger update manual
if (isset($_GET['update_umh_db']) && $_GET['update_umh_db'] == 'true' && current_user_can('manage_options')) {
    umh_create_db_tables();
    echo "Database Schema Updated Successfully!";
    exit;
}
?>