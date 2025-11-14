<?php
// File: admin/dashboard-react.php
// Ini adalah file "host" untuk aplikasi React Anda.

// Exit jika diakses langsung
if (!defined('ABSPATH')) {
    exit;
}

/**
 * PERBAIKAN: Bungkus seluruh output HTML ke dalam fungsi
 * 'umroh_manager_render_dashboard_react'.
 * * Fungsi ini adalah yang dipanggil oleh add_menu_page() 
 * di file umroh-manager-hybrid.php.
 */
function umroh_manager_render_dashboard_react() {

    /**
     * PERBAIKAN: Hapus semua panggilan wp_enqueue_script dari sini.
     * * Script sudah di-enqueue dengan benar di dalam method
     * 'enqueue_admin_scripts' di class UmrohManagerHybrid.
     * Memanggilnya di sini menyebabkan PHP Notice.
     */

    // Ini adalah tempat aplikasi React akan di-render
    // Cukup satu div dengan id "root"
    ?>
    <div class="wrap">
        <!-- 
          ID 'root' ini adalah target render dari React
          (lihat src/index.jsx)
        -->
        <div id="root">
            <!-- React akan menggantikan konten ini -->
            <p style="padding: 20px; text-align: center;">Memuat aplikasi manajemen...</p>
        </div>
    </div>
    <?php
}