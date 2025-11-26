<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Fungsi ini dipanggil oleh umroh-manager-hybrid.php
 * Nama fungsi HARUS: umroh_manager_render_dashboard_react
 */
function umroh_manager_render_dashboard_react() {
    ?>
    <div class="wrap" style="margin: 0; padding: 0; max-width: 100%;">
        <!-- 
            PENTING: ID ini harus 'umh-app-root' 
            agar sesuai dengan document.getElementById di src/index.jsx 
        -->
        <div id="umh-app-root">
            <div style="padding: 50px; text-align: center; color: #666;">
                <h2>Memuat Sistem Umroh Manager...</h2>
                <p>Mohon tunggu sebentar.</p>
                <div class="spinner is-active" style="float:none; margin: 10px auto;"></div>
            </div>
        </div>
    </div>
    <?php
}