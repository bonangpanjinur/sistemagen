<?php
if (!defined('ABSPATH')) {
    exit;
}

function umroh_manager_render_dashboard() {
    ?>
    <div class="wrap" style="margin: 0; padding: 0; max-width: 100%;">
        <!-- Container tempat React akan dimuat -->
        <div id="umroh-manager-app">
            <div style="padding: 20px; text-align: center; color: #666;">
                <h2>Memuat Aplikasi Umroh Manager...</h2>
                <p>Jika loading berhenti di sini, pastikan build React berhasil dan tidak ada error JavaScript console.</p>
                <div class="spinner is-active" style="float:none; margin: 10px auto;"></div>
            </div>
        </div>
    </div>
    <?php
}