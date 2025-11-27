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
        Reset CSS Inline untuk Wrapper WordPress
        Ini memastikan area kerja React benar-benar bersih dari margin WP
    -->
    <div class="umh-react-wrapper" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; background: #f3f4f6;">
        <!-- 
            PENTING: ID ini harus 'umh-app-root' 
            agar sesuai dengan document.getElementById di src/index.jsx 
        -->
        <div id="umh-app-root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6; flex-direction: column;">
                <div class="spinner is-active" style="float:none; margin: 0 auto 20px;"></div>
                <h2 style="font-size: 1.2rem; color: #666; font-family: sans-serif;">Memuat Sistem Umroh Manager...</h2>
            </div>
        </div>
    </div>
    <?php
}