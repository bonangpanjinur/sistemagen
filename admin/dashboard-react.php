<?php
/**
 * File: admin/dashboard-react.php
 * Menampilkan container untuk aplikasi React
 */

if (!defined('ABSPATH')) {
    exit;
}

function umroh_manager_render_dashboard_react() {
    ?>
    <div class="wrap" style="margin: 0; padding: 0; max-width: 100%;">
        <!-- 
            Container ID ini harus sama dengan yang dicari oleh ReactDOM.createRoot 
            di src/index.jsx 
        -->
        <div id="umroh-manager-root" class="umh-app-container">
            <div style="display: flex; justify-content: center; align-items: center; height: 80vh;">
                <p>Memuat Sistem Manajemen Umroh...</p>
            </div>
        </div>
    </div>
    
    <style>
        /* Reset beberapa style bawaan WP agar tampilan immersive lebih rapi */
        #wpcontent {
            padding-left: 0 !important;
        }
        .auto-fold #wpcontent {
            padding-left: 0 !important;
        }
        #wpbody-content {
            padding-bottom: 0 !important;
        }
        .umh-app-container {
            min-height: calc(100vh - 32px); /* Mengurangi tinggi Admin Bar WP */
            background-color: #f3f4f6;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        /* Fix untuk mobile view WP Admin */
        @media screen and (max-width: 782px) {
            .umh-app-container {
                min-height: calc(100vh - 46px);
            }
        }
    </style>
    <?php
}