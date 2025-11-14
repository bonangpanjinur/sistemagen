<?php
// File: admin/dashboard-react.php
// Ini adalah file "host" untuk aplikasi React Anda.
// Pastikan file ini bisa diakses dari URL WordPress Admin Anda.

// Ambil path ke file build React
// (Sesuaikan 'build/index.js' dan 'build/index.asset.php' jika path Anda berbeda)
$script_path = plugin_dir_url(__FILE__) . '../build/index.js';
$script_asset_path = plugin_dir_path(__FILE__) . '../build/index.asset.php';

// Pastikan file asset ada
if (!file_exists($script_asset_path)) {
    die('File asset build React tidak ditemukan. Jalankan "npm run build".');
}

// Load dependencies dari file asset (dibuat oleh @wordpress/scripts)
$script_asset = require($script_asset_path);

// Enqueue script React
wp_enqueue_script(
    'umroh-manager-react-app',
    $script_path,
    $script_asset['dependencies'],
    $script_asset['version'],
    true // Load di footer
);

// Ini adalah tempat aplikasi React akan di-render
// Cukup satu div dengan id "root"
?>

<div class="wrap">
    <!-- 
      Judul H2 dan paragraf ini akan terlihat sebentar
      sebelum React dimuat.
      Di 'Immersive Mode' (non-admin), .wrap akan 
      di-setel ke margin: 0, jadi ini tidak akan mengganggu layout.
    -->
    <div id="root">
        <!-- React akan menggantikan konten ini -->
        <p style="padding: 20px; text-align: center;">Memuat aplikasi manajemen...</p>
    </div>
</div>