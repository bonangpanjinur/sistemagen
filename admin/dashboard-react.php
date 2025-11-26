<?php
// File: admin/dashboard-react.php
// Ini adalah file "host" untuk aplikasi React Anda.

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fungsi ini adalah yang dipanggil oleh umh_render_admin_page() 
 * di file umroh-manager-hybrid.php.
 */
function umroh_manager_render_dashboard_react() {
    ?>
    <div class="wrap">
        <!-- 
          [PERBAIKAN CRITICAL] 
          ID harus 'umh-app-root' agar sesuai dengan src/index.jsx 
        -->
        <div id="umh-app-root">
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 50vh; 
                font-family: sans-serif;
                color: #555;
            ">
                <p>Memuat Sistem Umroh Manager...</p>
            </div>
        </div>
    </div>
    <?php
}