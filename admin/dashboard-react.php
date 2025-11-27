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
    <!-- 
        Wrapper 'wrap' bawaan WP terkadang punya margin. 
        Kita override inline style untuk memastikan full width jika CSS termuat lambat.
    -->
    <div class="wrap" style="margin: 0; padding: 0; max-width: 100%;">
        <!-- 
            PENTING: ID ini harus 'umh-app-root' 
            agar sesuai dengan document.getElementById di src/index.jsx 
        -->
        <div id="umh-app-root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6;">
                <div style="text-align: center; color: #666;">
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Memuat Sistem Umroh Manager...</h2>
                    <div class="spinner is-active" style="float:none; margin: 0 auto;"></div>
                </div>
            </div>
        </div>
    </div>
    <?php
}